import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

const siteUrl = process.env.NEXTAUTH_URL || 'https://benimmo.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pages statiques
  const staticPages = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${siteUrl}/properties`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${siteUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${siteUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  // Pages dynamiques - propriétés actives
  let propertyPages: MetadataRoute.Sitemap = []
  try {
    const properties = await prisma.property.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, updatedAt: true },
    })

    propertyPages = properties.map((property) => ({
      url: `${siteUrl}/properties/${property.id}`,
      lastModified: property.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch {
    // DB not available
  }

  return [...staticPages, ...propertyPages]
}
