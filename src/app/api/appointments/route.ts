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
    const { propertyId, requestedDate, notes } = await request.json()

    if (!propertyId || !requestedDate) {
      return NextResponse.json(
        { error: 'propertyId et requestedDate sont requis' },
        { status: 400 }
      )
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Propriété introuvable' },
        { status: 404 }
      )
    }

    if (property.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cette propriété n\'est pas disponible pour les visites' },
        { status: 400 }
      )
    }

    // Check for existing appointment at the same time
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        propertyId,
        clientId: userId,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    })

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'Vous avez déjà un rendez-vous en cours pour cette propriété' },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.create({
      data: {
        propertyId,
        clientId: userId,
        requestedDate: new Date(requestedDate),
        notes: notes || null,
      },
      include: {
        property: {
          select: { id: true, title: true, address: true, city: true },
        },
        client: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return NextResponse.json(
      { message: 'Rendez-vous demandé avec succès', appointment },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur lors de la création du rendez-vous:', error)
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

    const userId = (session.user as any).id
    const userRole = (session.user as any).role
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}

    // Filter based on user role
    if (userRole === 'AGENT') {
      where.agentId = userId
    } else if (userRole === 'OWNER') {
      where.property = { ownerId: userId }
    } else if (userRole !== 'ADMIN') {
      where.clientId = userId
    }

    if (status) {
      where.status = status
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          property: {
            select: { id: true, title: true, address: true, city: true },
          },
          client: {
            select: { id: true, name: true, email: true, phone: true },
          },
          agent: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
        orderBy: { requestedDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.appointment.count({ where }),
    ])

    return NextResponse.json({
      appointments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des rendez-vous:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
