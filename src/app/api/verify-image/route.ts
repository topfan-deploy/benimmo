export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { verifyImage } from '@/lib/image-verification'
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

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const propertyImageId = formData.get('propertyImageId') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await verifyImage(buffer)

    // If a propertyImageId is provided, update the record in the database
    if (propertyImageId) {
      const verificationStatus = result.hasExif ? 'VERIFIED' : 'PENDING'

      await prisma.propertyImage.update({
        where: { id: propertyImageId },
        data: {
          isVerified: result.hasExif,
          exifData: result.exifData || undefined,
          imageHash: result.imageHash,
          verificationStatus,
        },
      })
    }

    return NextResponse.json({
      verified: result.hasExif,
      hasExif: result.hasExif,
      imageHash: result.imageHash,
      warnings: result.warnings,
      exifData: result.exifData,
    })
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'image:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
