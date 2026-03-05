export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getTransaction } from '@/lib/fedapay'
import { generateConfirmationCode } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // FedaPay envoie l'ID de la transaction dans le webhook
    const { id: fedapayTransactionId } = body

    if (!fedapayTransactionId) {
      return NextResponse.json(
        { error: 'Transaction ID manquant' },
        { status: 400 }
      )
    }

    // Trouver le paiement correspondant
    const payment = await prisma.payment.findFirst({
      where: { fedapayTransactionId: String(fedapayTransactionId) },
      include: {
        booking: {
          include: {
            property: { select: { ownerId: true } },
          },
        },
      },
    })

    if (!payment) {
      console.error(`Callback: paiement introuvable pour transaction FedaPay ${fedapayTransactionId}`)
      return NextResponse.json(
        { error: 'Paiement introuvable' },
        { status: 404 }
      )
    }

    // Éviter le double traitement
    if (payment.status === 'SUCCESS') {
      return NextResponse.json({ message: 'Paiement déjà traité' })
    }

    // Vérifier le statut réel auprès de FedaPay (anti-fraude)
    const fedapayTransaction = await getTransaction(Number(fedapayTransactionId))

    if (fedapayTransaction.status === 'approved') {
      // Paiement réussi : mettre à jour le statut + créditer le propriétaire
      const ownerId = payment.booking.property.ownerId

      const confirmationCode = generateConfirmationCode()

      await prisma.$transaction([
        // 1. Mettre à jour le statut du paiement
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'SUCCESS' },
        }),

        // 2. Mettre à jour le statut de la réservation
        prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: 'CONFIRMED' },
        }),

        // 3. Créer ou mettre à jour le portefeuille du propriétaire et créditer
        prisma.wallet.upsert({
          where: { userId: ownerId },
          create: {
            userId: ownerId,
            balance: payment.ownerAmount,
          },
          update: {
            balance: { increment: payment.ownerAmount },
          },
        }),

        // 4. Créer le handover avec code de confirmation pour la remise des clés
        prisma.keyHandover.create({
          data: {
            confirmationCode,
            bookingId: payment.bookingId,
          },
        }),
      ])

      // 4. Créer la transaction wallet (besoin du walletId)
      const wallet = await prisma.wallet.findUnique({
        where: { userId: ownerId },
      })

      if (wallet) {
        await prisma.walletTransaction.create({
          data: {
            amount: payment.ownerAmount,
            type: 'CREDIT',
            description: `Paiement reçu pour ${payment.booking.property ? 'réservation' : 'service'} - Ref: ${payment.transactionRef}`,
            reference: payment.id,
            walletId: wallet.id,
          },
        })
      }

      console.log(`Callback: paiement ${payment.id} confirmé, ${payment.ownerAmount} XOF crédités au propriétaire ${ownerId}`)
    } else if (
      fedapayTransaction.status === 'declined' ||
      fedapayTransaction.status === 'cancelled'
    ) {
      // Paiement échoué
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      })

      console.log(`Callback: paiement ${payment.id} échoué (${fedapayTransaction.status})`)
    }

    // Répondre 200 à FedaPay pour confirmer la réception
    return NextResponse.json({ message: 'Callback traité' })
  } catch (error) {
    console.error('Erreur callback paiement:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

// FedaPay peut aussi envoyer des GET pour vérifier que l'endpoint existe
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
