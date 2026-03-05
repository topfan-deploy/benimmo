export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

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

    // Get all messages involving the current user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
        property: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Group by other user + propertyId to form conversations
    const conversationMap = new Map<string, {
      otherUser: { id: string; name: string }
      lastMessage: typeof messages[0]
      unreadCount: number
      propertyId: string | null
      propertyTitle: string | null
    }>()

    for (const message of messages) {
      const otherUser = message.senderId === userId
        ? message.receiver
        : message.sender
      const propertyId = message.propertyId
      const key = `${otherUser.id}_${propertyId || 'none'}`

      if (!conversationMap.has(key)) {
        conversationMap.set(key, {
          otherUser,
          lastMessage: message,
          unreadCount: 0,
          propertyId: propertyId,
          propertyTitle: message.property?.title || null,
        })
      }

      // Count unread messages received by current user
      if (message.receiverId === userId && !message.isRead) {
        const conv = conversationMap.get(key)!
        conv.unreadCount++
      }
    }

    const conversations = Array.from(conversationMap.values()).map((conv) => ({
      otherUser: conv.otherUser,
      lastMessage: {
        id: conv.lastMessage.id,
        content: conv.lastMessage.content,
        createdAt: conv.lastMessage.createdAt,
        senderId: conv.lastMessage.senderId,
      },
      unreadCount: conv.unreadCount,
      propertyId: conv.propertyId,
      propertyTitle: conv.propertyTitle,
    }))

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

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
    const { receiverId, content, propertyId } = body

    if (!receiverId) {
      return NextResponse.json(
        { error: 'Le destinataire est requis' },
        { status: 400 }
      )
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le contenu du message ne peut pas être vide' },
        { status: 400 }
      )
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: userId,
        receiverId,
        propertyId: propertyId || null,
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
        property: { select: { id: true, title: true } },
      },
    })

    return NextResponse.json(
      { message },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
