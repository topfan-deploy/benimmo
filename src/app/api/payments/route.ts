export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createTransaction, generatePaymentToken } from '@/lib/fedapay'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id
    const { bookingId, method } = await request.json()

    if (!bookingId || !method) {
      return NextResponse.json(
        { error: 'bookingId et method sont requis' },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { property: true },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Réservation introuvable' },
        { status: 404 }
      )
    }

    if (booking.clientId !== userId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { bookingId },
    })

    if (existingPayment && existingPayment.status === 'SUCCESS') {
      return NextResponse.json(
        { error: 'Cette réservation a déjà été payée' },
        { status: 400 }
      )
    }

    // Create FedaPay transaction
    const transaction = await createTransaction({
      amount: booking.totalAmount,
      description: `Paiement pour ${booking.property.title}`,
      currency: 'XOF',
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback`,
      customerEmail: session.user.email!,
    })

    const paymentToken = await generatePaymentToken(transaction.id)

    // Calcul de la commission (10%)
    const COMMISSION_RATE = 0.10
    const commission = Math.round(booking.totalAmount * COMMISSION_RATE)
    const ownerAmount = booking.totalAmount - commission

    // Create or update payment record
    const payment = existingPayment
      ? await prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            method,
            commission,
            ownerAmount,
            transactionRef: transaction.reference,
            fedapayTransactionId: String(transaction.id),
            status: 'PENDING',
          },
        })
      : await prisma.payment.create({
          data: {
            amount: booking.totalAmount,
            commission,
            ownerAmount,
            currency: 'XOF',
            method,
            transactionRef: transaction.reference,
            fedapayTransactionId: String(transaction.id),
            status: 'PENDING',
            bookingId,
          },
        })

    return NextResponse.json({
      payment,
      paymentUrl: paymentToken.url,
      paymentToken: paymentToken.token,
    })
  } catch (error) {
    console.error('Erreur lors de la création du paiement:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = (session.user as any).id

    // Vérifier si le client a payé pour une propriété
    const propertyId = searchParams.get('propertyId')
    const check = searchParams.get('check')

    if (propertyId && check === 'true') {
      const paidBooking = await prisma.payment.findFirst({
        where: {
          status: 'SUCCESS',
          booking: {
            propertyId,
            clientId: userId,
          },
        },
      })
      return NextResponse.json({ hasPaid: !!paidBooking })
    }

    const paymentId = searchParams.get('paymentId')
    const bookingId = searchParams.get('bookingId')

    if (!paymentId && !bookingId) {
      return NextResponse.json(
        { error: 'paymentId ou bookingId requis' },
        { status: 400 }
      )
    }

    const where: any = {}
    if (paymentId) where.id = paymentId
    if (bookingId) where.bookingId = bookingId

    const payment = await prisma.payment.findFirst({
      where,
      include: {
        booking: {
          include: {
            property: { select: { id: true, title: true } },
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Paiement introuvable' },
        { status: 404 }
      )
    }

    return NextResponse.json({ payment })
  } catch (error) {
    console.error('Erreur lors de la récupération du paiement:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
