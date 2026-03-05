export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const role = (session.user as any).role

    if (role === 'CLIENT') {
      // Le client voit les handovers de ses réservations
      const handovers = await prisma.keyHandover.findMany({
        where: { booking: { clientId: userId } },
        include: {
          booking: {
            include: {
              property: { select: { id: true, title: true, address: true, city: true } },
            },
          },
          confirmedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ handovers })
    }

    if (role === 'OWNER' || role === 'ADMIN') {
      // Le propriétaire voit les handovers de ses propriétés
      const handovers = await prisma.keyHandover.findMany({
        where: { booking: { property: { ownerId: userId } } },
        include: {
          booking: {
            include: {
              property: { select: { id: true, title: true, address: true, city: true } },
              client: { select: { id: true, name: true, email: true } },
            },
          },
          confirmedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ handovers })
    }

    return NextResponse.json({ handovers: [] })
  } catch (error) {
    console.error('Erreur récupération handovers:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const role = (session.user as any).role

    if (role !== 'OWNER' && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Seuls les propriétaires peuvent confirmer une remise de clés' },
        { status: 403 }
      )
    }

    const { code } = await request.json()

    if (!code || String(code).length !== 6) {
      return NextResponse.json(
        { error: 'Code de confirmation invalide (6 chiffres requis)' },
        { status: 400 }
      )
    }

    // Trouver le handover par code
    const handover = await prisma.keyHandover.findUnique({
      where: { confirmationCode: String(code) },
      include: {
        booking: {
          include: {
            property: { select: { id: true, title: true, ownerId: true } },
            client: { select: { id: true, name: true } },
          },
        },
      },
    })

    if (!handover) {
      return NextResponse.json({ error: 'Code de confirmation introuvable' }, { status: 404 })
    }

    // Vérifier que la propriété appartient bien au propriétaire
    if (handover.booking.property.ownerId !== userId && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Cette réservation ne concerne pas une de vos propriétés' },
        { status: 403 }
      )
    }

    // Vérifier que la remise n'est pas déjà confirmée
    if (handover.status === 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Cette remise de clés a déjà été confirmée' },
        { status: 400 }
      )
    }

    // Confirmer la remise
    const updated = await prisma.keyHandover.update({
      where: { id: handover.id },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        confirmedById: userId,
      },
      include: {
        booking: {
          include: {
            property: { select: { title: true } },
            client: { select: { name: true } },
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Remise de clés confirmée avec succès',
      handover: updated,
    })
  } catch (error) {
    console.error('Erreur confirmation handover:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
