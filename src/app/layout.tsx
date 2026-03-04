import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = process.env.NEXTAUTH_URL || 'https://benimmo.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'BenImmo - Location Immobilière au Bénin | Annonces Vérifiées',
    template: '%s | BenImmo',
  },
  description:
    'Trouvez votre logement idéal au Bénin. Location journalière, mensuelle ou longue durée à Cotonou, Porto-Novo, Parakou. Annonces vérifiées anti-arnaque, paiement sécurisé Mobile Money.',
  keywords: [
    'immobilier Bénin',
    'location Cotonou',
    'appartement Bénin',
    'maison à louer Cotonou',
    'location Porto-Novo',
    'location Parakou',
    'immobilier Cotonou',
    'location meublée Bénin',
    'location journalière Cotonou',
    'diaspora béninoise logement',
    'louer maison Bénin',
    'studio Cotonou',
    'villa Bénin',
    'location Abomey-Calavi',
    'BenImmo',
  ],
  authors: [{ name: 'BenImmo' }],
  creator: 'BenImmo',
  publisher: 'BenImmo',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    alternateLocale: 'fr_BJ',
    url: siteUrl,
    siteName: 'BenImmo',
    title: 'BenImmo - Location Immobilière au Bénin | Annonces Vérifiées',
    description:
      'Trouvez votre logement idéal au Bénin. Location journalière, mensuelle ou longue durée. Annonces vérifiées, paiement Mobile Money sécurisé.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BenImmo - Plateforme Immobilière au Bénin',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BenImmo - Location Immobilière au Bénin',
    description:
      'Trouvez votre logement au Bénin. Annonces vérifiées, paiement Mobile Money sécurisé.',
    images: ['/og-image.png'],
  },
  verification: {
    // Ajouter l'ID Google Search Console ici quand disponible
    // google: 'votre-code-verification',
  },
  alternates: {
    canonical: siteUrl,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BenImmo',
    url: siteUrl,
    description: 'Plateforme de location immobilière au Bénin avec vérification anti-arnaque',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/properties?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BenImmo',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+229-97-00-00-00',
      contactType: 'customer service',
      areaServed: 'BJ',
      availableLanguage: ['French'],
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Cotonou',
      addressCountry: 'BJ',
    },
  }

  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#059669" />
        <meta name="geo.region" content="BJ" />
        <meta name="geo.placename" content="Cotonou" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
