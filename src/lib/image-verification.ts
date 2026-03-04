import sharp from 'sharp'

export interface ImageVerificationResult {
  hasExif: boolean
  exifData: Record<string, any> | null
  imageHash: string
  warnings: string[]
}

export async function verifyImage(buffer: Buffer): Promise<ImageVerificationResult> {
  const warnings: string[] = []
  let exifData: Record<string, any> | null = null
  let hasExif = false

  // Extract EXIF data
  try {
    const metadata = await sharp(buffer).metadata()
    if (metadata.exif) {
      const ExifReader = (await import('exif-reader')).default
      exifData = ExifReader(metadata.exif)
      hasExif = true

      // Check for GPS data
      if (exifData?.gps?.GPSLatitude && exifData?.gps?.GPSLongitude) {
        // GPS data present - good sign of authentic photo
      } else {
        warnings.push('Pas de données GPS dans la photo')
      }

      // Check date
      if (!exifData?.exif?.DateTimeOriginal) {
        warnings.push('Pas de date de prise de vue')
      }
    } else {
      warnings.push('Aucune métadonnée EXIF - image probablement téléchargée depuis internet')
    }
  } catch {
    warnings.push('Impossible de lire les métadonnées EXIF')
  }

  // Calculate perceptual hash using sharp
  const imageHash = await calculateImageHash(buffer)

  if (!hasExif) {
    warnings.push('Image suspecte : absence de métadonnées. Vérification manuelle recommandée.')
  }

  return { hasExif, exifData, imageHash, warnings }
}

async function calculateImageHash(buffer: Buffer): Promise<string> {
  // Resize to 8x8 grayscale for perceptual hash
  const resized = await sharp(buffer)
    .resize(8, 8, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer()

  // Calculate average
  const pixels = Array.from(resized)
  const avg = pixels.reduce((sum, val) => sum + val, 0) / pixels.length

  // Generate hash: 1 if pixel > average, 0 otherwise
  const hash = pixels.map(p => (p > avg ? '1' : '0')).join('')

  // Convert binary string to hex
  let hex = ''
  for (let i = 0; i < hash.length; i += 4) {
    hex += parseInt(hash.substring(i, i + 4), 2).toString(16)
  }

  return hex
}

export async function addWatermark(
  buffer: Buffer,
  text: string = 'BenImmo'
): Promise<Buffer> {
  const image = sharp(buffer)
  const metadata = await image.metadata()
  const width = metadata.width || 800
  const height = metadata.height || 600

  const svgWatermark = `
    <svg width="${width}" height="${height}">
      <style>
        .watermark { fill: rgba(255,255,255,0.3); font-size: ${Math.max(width / 15, 24)}px; font-family: Arial, sans-serif; font-weight: bold; }
      </style>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="watermark" transform="rotate(-30, ${width / 2}, ${height / 2})">${text}</text>
    </svg>
  `

  return await image
    .composite([{ input: Buffer.from(svgWatermark), top: 0, left: 0 }])
    .toBuffer()
}
