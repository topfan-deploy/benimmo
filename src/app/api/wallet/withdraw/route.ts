export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

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
    const body = await request.json()
    const { amount, method, phoneNumber } = body

    // Validate method
    if (!method || (method !== 'MOMO' && method !== 'MOOV')) {
      return NextResponse.json(
        { error: 'Méthode de retrait invalide. Utilisez MOMO ou MOOV.' },
        { status: 400 }
      )
    }

    // Validate phoneNumber
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Le numéro de téléphone est requis' },
        { status: 400 }
      )
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Le montant doit être supérieur à 0' },
        { status: 400 }
      )
    }

    // Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    })

    if (!wallet) {
      return NextResponse.json(
        { error: 'Portefeuille introuvable' },
        { status: 404 }
      )
    }

    if (amount > wallet.balance) {
      return NextResponse.json(
        { error: 'Solde insuffisant' },
        { status: 400 }
      )
    }

    // Debit wallet, create transaction, and create withdrawal in a transaction
    const [withdrawal] = await prisma.$transaction([
      prisma.withdrawal.create({
        data: {
          amount,
          method,
          phoneNumber,
          status: 'PENDING',
          userId,
        },
      }),
      prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: amount },
        },
      }),
      prisma.walletTransaction.create({
        data: {
          amount,
          type: 'DEBIT',
          description: `Retrait ${method} vers ${phoneNumber}`,
          walletId: wallet.id,
        },
      }),
    ])

    return NextResponse.json(
      { message: 'Demande de retrait créée', withdrawal },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur lors de la demande de retrait:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id

    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ withdrawals })
  } catch (error) {
    console.error('Erreur lors de la récupération des retraits:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
