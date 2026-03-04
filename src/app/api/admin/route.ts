export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { error: 'Non authentifié', status: 401 }
  }

  if ((session.user as any).role !== 'ADMIN') {
    return { error: 'Accès réservé aux administrateurs', status: 403 }
  }

  return { session }
}

export async function GET() {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      )
    }

    const [
      totalUsers,
      totalProperties,
      activeProperties,
      pendingProperties,
      totalBookings,
      totalPayments,
      successfulPayments,
      pendingDocuments,
      totalAppointments,
      recentUsers,
      recentProperties,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.property.count({ where: { status: 'ACTIVE' } }),
      prisma.property.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.booking.count(),
      prisma.payment.count(),
      prisma.payment.count({ where: { status: 'SUCCESS' } }),
      prisma.document.count({ where: { status: 'PENDING' } }),
      prisma.appointment.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      prisma.property.findMany({
        where: { status: 'PENDING_REVIEW' },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          images: true,
        },
      }),
    ])

    const revenueResult = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS' },
    })

    return NextResponse.json({
      stats: {
        totalUsers,
        totalProperties,
        activeProperties,
        pendingProperties,
        totalBookings,
        totalPayments,
        successfulPayments,
        totalRevenue: revenueResult._sum.amount || 0,
        pendingDocuments,
        totalAppointments,
      },
      recentUsers,
      recentProperties,
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des stats admin:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAdmin()
    if ('error' in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      )
    }

    const adminId = (auth.session.user as any).id
    const { action, id, reason } = await request.json()

    if (!action || !id) {
      return NextResponse.json(
        { error: 'action et id sont requis' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'approve_property': {
        const property = await prisma.property.update({
          where: { id },
          data: { status: 'ACTIVE' },
        })
        return NextResponse.json({
          message: 'Propriété approuvée',
          property,
        })
      }

      case 'reject_property': {
        const property = await prisma.property.update({
          where: { id },
          data: { status: 'REJECTED' },
        })
        return NextResponse.json({
          message: 'Propriété rejetée',
          property,
        })
      }

      case 'approve_document': {
        const document = await prisma.document.update({
          where: { id },
          data: {
            status: 'APPROVED',
            reviewedById: adminId,
            reviewNote: reason || null,
          },
        })

        // If it is an identity document, mark user as verified
        if (document.type === 'IDENTITY') {
          await prisma.user.update({
            where: { id: document.userId },
            data: { isVerified: true },
          })
        }

        return NextResponse.json({
          message: 'Document approuvé',
          document,
        })
      }

      case 'reject_document': {
        const document = await prisma.document.update({
          where: { id },
          data: {
            status: 'REJECTED',
            reviewedById: adminId,
            reviewNote: reason || 'Document rejeté',
          },
        })
        return NextResponse.json({
          message: 'Document rejeté',
          document,
        })
      }

      case 'verify_image': {
        const image = await prisma.propertyImage.update({
          where: { id },
          data: {
            isVerified: true,
            verificationStatus: 'VERIFIED',
          },
        })
        return NextResponse.json({
          message: 'Image vérifiée',
          image,
        })
      }

      case 'reject_image': {
        const image = await prisma.propertyImage.update({
          where: { id },
          data: {
            isVerified: false,
            verificationStatus: 'REJECTED',
            rejectionReason: reason || 'Image rejetée',
          },
        })
        return NextResponse.json({
          message: 'Image rejetée',
          image,
        })
      }

      default:
        return NextResponse.json(
          { error: 'Action non reconnue' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Erreur lors de l\'action admin:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
