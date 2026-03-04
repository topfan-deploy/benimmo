import { Suspense } from 'react'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { formatPrice, formatPriceType, formatPropertyType } from '@/lib/utils'
import SearchFilters from '@/components/SearchFilters'

interface Props {
  searchParams: {
    city?: string
    propertyType?: string
    priceType?: string
    minPrice?: string
    maxPrice?: string
    bedrooms?: string
    search?: string
  }
}

async function getProperties(params: Props['searchParams']) {
  const where: any = { status: 'ACTIVE' }

  if (params.city) where.city = params.city
  if (params.propertyType) where.propertyType = params.propertyType
  if (params.priceType) where.priceType = params.priceType
  if (params.bedrooms) where.bedrooms = { gte: parseInt(params.bedrooms) }
  if (params.minPrice || params.maxPrice) {
    where.price = {}
    if (params.minPrice) where.price.gte = parseFloat(params.minPrice)
    if (params.maxPrice) where.price.lte = parseFloat(params.maxPrice)
  }
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
      { address: { contains: params.search, mode: 'insensitive' } },
    ]
  }

  return prisma.property.findMany({
    where,
    include: {
      images: { take: 1 },
      owner: { select: { name: true, isVerified: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function PropertiesPage({ searchParams }: Props) {
  let properties: any[] = []
  try {
    properties = await getProperties(searchParams)
  } catch {
    // DB not available
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Propriétés disponibles</h1>

      <Suspense fallback={<div className="h-16 bg-gray-100 rounded-lg animate-pulse mb-6" />}>
        <SearchFilters />
      </Suspense>

      {properties.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl mb-4">🏠</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Aucune propriété trouvée</h2>
          <p className="text-gray-500">Essayez de modifier vos critères de recherche.</p>
        </div>
      ) : (
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
                    {property.area && <span>{property.area} m²</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
