export const dynamic = 'force-dynamic'

import Link from 'next/link'
import prisma from '@/lib/prisma'
import { formatPrice, formatPriceType, formatPropertyType } from '@/lib/utils'

async function getFeaturedProperties() {
  return prisma.property.findMany({
    where: { status: 'ACTIVE' },
    include: { images: true, owner: { select: { name: true, isVerified: true } } },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })
}

export default async function HomePage() {
  let properties: any[] = []
  try {
    properties = await getFeaturedProperties()
  } catch {
    // DB not available yet
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-28">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Trouvez votre logement idéal au Bénin
            </h1>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Location journalière, mensuelle ou longue durée. Annonces vérifiées et paiement sécurisé.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/properties"
                className="bg-white text-emerald-700 px-8 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition"
              >
                Rechercher un logement
              </Link>
              <Link
                href="/properties/new"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
              >
                Publier une annonce
              </Link>
            </div>
          </div>

          {/* Quick Search */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
            <form action="/properties" method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <select name="city" className="w-full border rounded-lg px-3 py-2 text-gray-800">
                  <option value="">Toutes les villes</option>
                  <option>Cotonou</option>
                  <option>Porto-Novo</option>
                  <option>Parakou</option>
                  <option>Abomey-Calavi</option>
                  <option>Ouidah</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select name="propertyType" className="w-full border rounded-lg px-3 py-2 text-gray-800">
                  <option value="">Tous les types</option>
                  <option value="APARTMENT">Appartement</option>
                  <option value="HOUSE">Maison</option>
                  <option value="STUDIO">Studio</option>
                  <option value="VILLA">Villa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
                <select name="priceType" className="w-full border rounded-lg px-3 py-2 text-gray-800">
                  <option value="">Toutes durées</option>
                  <option value="DAILY">Journalier</option>
                  <option value="MONTHLY">Mensuel</option>
                  <option value="YEARLY">Annuel</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition"
                >
                  Rechercher
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Pourquoi BenImmo ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Annonces vérifiées</h3>
              <p className="text-gray-600">
                Chaque annonce est vérifiée par notre équipe. Photos authentiques et documents de propriété contrôlés.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Paiement Mobile Money</h3>
              <p className="text-gray-600">
                Payez facilement via MTN MoMo, Moov Money ou carte bancaire. Transactions sécurisées par FedaPay.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Visite sur rendez-vous</h3>
              <p className="text-gray-600">
                Planifiez vos visites en ligne. Nos agents vous accompagnent sur place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      {properties.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Propriétés récentes</h2>
              <Link href="/properties" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Voir tout &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property: any) => (
                <Link key={property.id} href={`/properties/${property.id}`}>
                  <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition overflow-hidden">
                    <div className="h-48 bg-gray-200 relative">
                      {property.images[0] ? (
                        <img
                          src={property.images[0].url}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Pas d&apos;image
                        </div>
                      )}
                      {property.owner.isVerified && (
                        <span className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                          Vérifié
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{property.title}</h3>
                      <p className="text-gray-500 text-sm mb-2">{property.city}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-600 font-bold">
                          {formatPrice(property.price)}{formatPriceType(property.priceType)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatPropertyType(property.propertyType)}
                        </span>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>{property.bedrooms} ch.</span>
                        <span>{property.bathrooms} sdb.</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-emerald-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Vous êtes propriétaire ?</h2>
          <p className="text-emerald-100 mb-8 text-lg">
            Publiez votre annonce gratuitement et trouvez des locataires de confiance.
          </p>
          <Link
            href="/properties/new"
            className="bg-white text-emerald-700 px-8 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition inline-block"
          >
            Publier une annonce
          </Link>
        </div>
      </section>
    </div>
  )
}
