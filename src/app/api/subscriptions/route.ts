export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

const SUBSCRIPTION_AMOUNT = 10000 // 10 000 FCFA/mois
const COMMISSION_RATE = 0.10 // 10%

// GET: vérifier le statut d'abonnement
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: { gte: new Date() },
      },
      orderBy: { endDate: 'desc' },
    })

    return NextResponse.json({
      hasActiveSubscription: !!activeSubscription,
      subscription: activeSubscription,
      amount: SUBSCRIPTION_AMOUNT,
      commissionRate: COMMISSION_RATE,
    })
  } catch (error) {
    console.error('Erreur vérification abonnement:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

// POST: créer un abonnement
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const userRole = (session.user as any).role

    if (userRole !== 'OWNER' && userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Seuls les propriétaires peuvent souscrire un abonnement' },
        { status: 403 }
      )
    }

    // Vérifier s'il y a déjà un abonnement actif
    const existing = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: { gte: new Date() },
      },
    })

    if (existing) {
      return NextResponse.json({
        message: 'Vous avez déjà un abonnement actif',
        subscription: existing,
      })
    }

    const body = await request.json()
    const { method } = body // MOMO, MOOV, CARD

    // Créer l'abonnement (1 mois)
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1)

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        amount: SUBSCRIPTION_AMOUNT,
        status: 'ACTIVE',
        startDate,
        endDate,
        method: method || null,
      },
    })

    return NextResponse.json({
      message: 'Abonnement activé avec succès',
      subscription,
    }, { status: 201 })
  } catch (error) {
    console.error('Erreur création abonnement:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
