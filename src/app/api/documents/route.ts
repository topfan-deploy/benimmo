export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { submitIdVerification, isSmileConfigured } from '@/lib/smile-identity'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

// Valider et nettoyer une URL de document
function validateDocumentUrl(url: string): boolean {
  // Seules les URLs locales (/uploads/...) sont acceptées
  // Cela empêche les URLs javascript:, data:, et les URLs vers des serveurs externes
  if (url.startsWith('/uploads/')) return true
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:'
  } catch {
    return false
  }
}

// Nettoyer les entrées texte (anti XSS)
function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}

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

    // Rate limiting : 20 uploads par heure
    const rateCheck = checkRateLimit(`documents:${userId}`, RATE_LIMITS.UPLOAD)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Trop de soumissions. Réessayez plus tard.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { type, url, idType, idNumber, firstName, lastName } = body

    if (!type || !url) {
      return NextResponse.json(
        { error: 'Le type et l\'URL du document sont requis' },
        { status: 400 }
      )
    }

    // Valider l'URL du document (anti XSS / SSRF)
    if (typeof url !== 'string' || !validateDocumentUrl(url)) {
      return NextResponse.json(
        { error: 'URL du document invalide' },
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

      // Valider le type de pièce (liste blanche)
      const validIdTypes = ['DRIVERS_LICENSE', 'NATIONAL_ID', 'PASSPORT', 'RESIDENT_CARD', 'VOTER_ID', 'TRAVEL_DOC']
      if (!validIdTypes.includes(idType)) {
        return NextResponse.json({ error: 'Type de pièce d\'identité invalide' }, { status: 400 })
      }

      // Limiter la longueur et nettoyer les inputs
      if (idNumber.length > 50 || firstName.length > 100 || lastName.length > 100) {
        return NextResponse.json({ error: 'Données trop longues' }, { status: 400 })
      }

      const cleanIdNumber = sanitizeInput(idNumber)
      const cleanFirstName = sanitizeInput(firstName)
      const cleanLastName = sanitizeInput(lastName)

      if (isSmileConfigured()) {
        try {
          const result = await submitIdVerification({
            idType,
            idNumber: cleanIdNumber,
            firstName: cleanFirstName,
            lastName: cleanLastName,
            country: 'BJ',
          })

          const verified = result.actions.Verify_ID_Number === 'Verified'

          const document = await prisma.document.create({
            data: {
              type,
              url,
              userId,
              idType,
              idNumber: cleanIdNumber,
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
              idNumber: cleanIdNumber,
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
            idNumber: cleanIdNumber,
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
