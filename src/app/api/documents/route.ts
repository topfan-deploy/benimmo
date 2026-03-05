export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { submitIdVerification, isSmileConfigured } from '@/lib/smile-identity'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Erreur récupération documents:', error)
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
    const body = await request.json()
    const { type, url, idType, idNumber, firstName, lastName } = body

    if (!type || !url) {
      return NextResponse.json(
        { error: 'Le type et l\'URL du document sont requis' },
        { status: 400 }
      )
    }

    if (!['IDENTITY', 'OWNERSHIP', 'TAX_RECEIPT'].includes(type)) {
      return NextResponse.json({ error: 'Type de document invalide' }, { status: 400 })
    }

    // Pour les pièces d'identité, tenter la vérification automatique via Smile Identity
    if (type === 'IDENTITY') {
      if (!idType || !idNumber || !firstName || !lastName) {
        return NextResponse.json(
          { error: 'Type de pièce, numéro, nom et prénom sont requis pour une pièce d\'identité' },
          { status: 400 }
        )
      }

      if (isSmileConfigured()) {
        try {
          const result = await submitIdVerification({
            idType,
            idNumber,
            firstName,
            lastName,
            country: 'BJ',
          })

          const verified = result.actions.Verify_ID_Number === 'Verified'

          const document = await prisma.document.create({
            data: {
              type,
              url,
              userId,
              idType,
              idNumber,
              smileJobId: result.jobId,
              smileResult: result.fullResult,
              smileVerificationStatus: verified ? 'Passed' : 'Failed',
              autoVerifiedAt: verified ? new Date() : null,
              status: 'PENDING', // Toujours en attente de validation admin
            },
          })

          return NextResponse.json({
            message: 'Document soumis avec vérification automatique',
            document,
            smileResult: {
              status: verified ? 'Passed' : 'Failed',
              resultText: result.resultText,
            },
          })
        } catch (smileError) {
          console.error('Erreur Smile Identity (fallback manuel):', smileError)
          // Fallback : créer sans vérification automatique
          const document = await prisma.document.create({
            data: {
              type,
              url,
              userId,
              idType,
              idNumber,
              smileVerificationStatus: 'Error',
              status: 'PENDING',
            },
          })

          return NextResponse.json({
            message: 'Document soumis (vérification automatique indisponible, revue manuelle)',
            document,
            smileResult: { status: 'Error' },
          })
        }
      } else {
        // Pas de clés Smile ID configurées → revue manuelle
        const document = await prisma.document.create({
          data: {
            type,
            url,
            userId,
            idType,
            idNumber,
            status: 'PENDING',
          },
        })

        return NextResponse.json({
          message: 'Document soumis pour revue manuelle',
          document,
        })
      }
    }

    // Documents de propriété et taxe foncière → revue manuelle directe
    const document = await prisma.document.create({
      data: {
        type,
        url,
        userId,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      message: 'Document soumis pour revue manuelle',
      document,
    })
  } catch (error) {
    console.error('Erreur soumission document:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
