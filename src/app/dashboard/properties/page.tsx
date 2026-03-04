'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice, formatPriceType, formatPropertyType } from '@/lib/utils'

export default function MyPropertiesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch('/api/properties?ownerId=me')
        const data = await res.json()
        setProperties(data.properties || [])
      } catch { /* ignore */ }
      setLoading(false)
    }
    if (session) fetch_()
  }, [session])

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mes propriétés</h1>
        <Link
          href="/properties/new"
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition font-medium"
        >
          + Nouvelle annonce
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-xl font-semibold mb-2">Aucune propriété</h2>
          <p className="text-gray-500 mb-4">Vous n&apos;avez pas encore publié d&apos;annonce.</p>
          <Link
            href="/properties/new"
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition inline-block"
          >
            Publier une annonce
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((p: any) => (
            <div key={p.id} className="bg-white border rounded-xl p-4 flex gap-4 items-center">
              <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                {p.images?.[0] ? (
                  <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    No img
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{p.title}</h3>
                <p className="text-gray-500 text-sm">{p.city} - {formatPropertyType(p.propertyType)}</p>
                <p className="text-emerald-600 font-semibold">
                  {formatPrice(p.price)}{formatPriceType(p.priceType)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-full ${
                  p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                  p.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
                  p.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {p.status === 'ACTIVE' ? 'Active' :
                   p.status === 'PENDING_REVIEW' ? 'En attente' :
                   p.status === 'REJECTED' ? 'Rejetée' : 'Louée'}
                </span>
                <Link
                  href={`/properties/${p.id}`}
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  Voir
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
