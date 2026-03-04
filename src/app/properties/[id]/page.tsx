export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { formatPrice, formatPriceType, formatPropertyType, formatDate } from '@/lib/utils'
import AppointmentCalendar from '@/components/AppointmentCalendar'

async function getProperty(id: string) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      images: true,
      owner: { select: { name: true, isVerified: true, phone: true } },
      reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
    },
  })
  return property
}

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  let property: any
  try {
    property = await getProperty(params.id)
  } catch {
    notFound()
  }

  if (!property) notFound()

  const avgRating =
    property.reviews.length > 0
      ? property.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / property.reviews.length
      : null

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-emerald-600">Accueil</Link>
        <span className="mx-2">/</span>
        <Link href="/properties" className="hover:text-emerald-600">Propriétés</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{property.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="mb-6">
            {property.images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="md:col-span-2">
                  <img
                    src={property.images[0].url}
                    alt={property.title}
                    className="w-full h-80 object-cover rounded-xl"
                  />
                </div>
                {property.images.slice(1, 5).map((img: any) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt={property.title}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-80 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-lg">
                Pas d&apos;images disponibles
              </div>
            )}
          </div>

          {/* Property Info */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold">{property.title}</h1>
              {property.owner.isVerified && (
                <span className="bg-emerald-100 text-emerald-700 text-sm px-3 py-1 rounded-full font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Propriétaire vérifié
                </span>
              )}
            </div>
            <p className="text-gray-500 text-lg mb-4">{property.address}, {property.city}</p>

            <div className="flex flex-wrap gap-4 mb-6">
              <span className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-semibold text-lg">
                {formatPrice(property.price)}{formatPriceType(property.priceType)}
              </span>
              <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg">
                {formatPropertyType(property.propertyType)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-emerald-600">{property.bedrooms}</div>
                <div className="text-sm text-gray-500">Chambres</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-emerald-600">{property.bathrooms}</div>
                <div className="text-sm text-gray-500">Salles de bain</div>
              </div>
              {property.area && (
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-emerald-600">{property.area}</div>
                  <div className="text-sm text-gray-500">m²</div>
                </div>
              )}
              {avgRating && (
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-500">{avgRating.toFixed(1)}</div>
                  <div className="text-sm text-gray-500">{property.reviews.length} avis</div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
          </div>

          {/* Reviews */}
          {property.reviews.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Avis des locataires</h2>
              <div className="space-y-4">
                {property.reviews.map((review: any) => (
                  <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{review.user.name}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    {review.comment && <p className="text-gray-600">{review.comment}</p>}
                    <p className="text-xs text-gray-400 mt-2">{formatDate(review.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Owner Info */}
          <div className="bg-white border rounded-xl p-6 mb-6 sticky top-4">
            <h3 className="font-semibold text-lg mb-4">Propriétaire</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 font-bold text-lg">
                  {property.owner.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium">{property.owner.name}</p>
                {property.owner.isVerified && (
                  <p className="text-xs text-emerald-600">Identité vérifiée</p>
                )}
              </div>
            </div>

            {property.owner.phone && (
              <a
                href={`tel:${property.owner.phone}`}
                className="block w-full bg-emerald-600 text-white text-center py-3 rounded-lg font-medium hover:bg-emerald-700 transition mb-3"
              >
                Appeler le propriétaire
              </a>
            )}

            <Link
              href={`/appointments/${property.id}`}
              className="block w-full border-2 border-emerald-600 text-emerald-600 text-center py-3 rounded-lg font-medium hover:bg-emerald-50 transition"
            >
              Prendre rendez-vous
            </Link>
          </div>

          {/* Quick Appointment */}
          <div className="bg-white border rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4">Planifier une visite</h3>
            <AppointmentCalendar propertyId={property.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
