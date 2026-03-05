export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const currentUserId = (session.user as any).id
    const otherUserId = params.userId
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')

    // Build where clause for messages between the two users
    const where: any = {
      OR: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId },
      ],
    }

    if (propertyId) {
      where.propertyId = propertyId
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
        property: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Mark unread messages sent by the other user as read
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: currentUserId,
        isRead: false,
        ...(propertyId ? { propertyId } : {}),
      },
      data: {
        isRead: true,
      },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
