import { MetadataRoute } from 'next'

const siteUrl = process.env.NEXTAUTH_URL || 'https://benimmo.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/admin/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
