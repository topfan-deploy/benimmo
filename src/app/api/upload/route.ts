export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { writeFile } from 'fs/promises'
import path from 'path'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

// Extensions autorisées — liste blanche stricte
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf'])
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
])

// Signatures magiques (magic bytes) pour valider le contenu réel du fichier
const MAGIC_BYTES: Record<string, number[]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF
  'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
}

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const expected = MAGIC_BYTES[mimeType]
  if (!expected) return false
  for (let i = 0; i < expected.length; i++) {
    if (buffer[i] !== expected[i]) return false
  }
  return true
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

    // Rate limiting : 20 uploads par heure par utilisateur
    const userId = (session.user as any).id
    const rateCheck = checkRateLimit(`upload:${userId}`, RATE_LIMITS.UPLOAD)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Trop d\'uploads. Réessayez plus tard.' },
        { status: 429 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // 1. Vérifier le type MIME déclaré
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Utilisez JPG, PNG, WebP ou PDF.' },
        { status: 400 }
      )
    }

    // 2. Vérifier l'extension du fichier (liste blanche)
    const originalExt = path.extname(file.name).toLowerCase()
    if (!ALLOWED_EXTENSIONS.has(originalExt)) {
      return NextResponse.json(
        { error: 'Extension de fichier non autorisée.' },
        { status: 400 }
      )
    }

    // 3. Vérifier la taille
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Le fichier est trop volumineux. Taille maximale : 5 Mo.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 4. Vérifier les magic bytes (contenu réel du fichier)
    // Un attaquant peut renommer un .exe en .jpg — les magic bytes détectent ça
    if (!validateMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { error: 'Le contenu du fichier ne correspond pas au type déclaré.' },
        { status: 400 }
      )
    }

    // 5. Générer un nom de fichier sécurisé (jamais le nom original)
    // Extension forcée depuis le type MIME, pas depuis le nom du fichier
    const safeExtMap: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'application/pdf': '.pdf',
    }
    const safeExt = safeExtMap[file.type] || '.jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${safeExt}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')

    // 6. Vérifier que le chemin final reste dans uploadDir (anti path traversal)
    const filepath = path.resolve(uploadDir, filename)
    if (!filepath.startsWith(path.resolve(uploadDir))) {
      return NextResponse.json(
        { error: 'Chemin de fichier invalide.' },
        { status: 400 }
      )
    }

    await writeFile(filepath, buffer)

    const url = `/uploads/${filename}`

    return NextResponse.json(
      { message: 'Fichier uploadé avec succès', url, filename },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
