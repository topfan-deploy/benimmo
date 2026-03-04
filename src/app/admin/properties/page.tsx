'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/utils'

export default function AdminPropertiesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('PENDING_REVIEW')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
    if (session && (session.user as any).role !== 'ADMIN') router.push('/')
  }, [status, session, router])

  useEffect(() => {
    async function fetchProps() {
      try {
        const res = await fetch(`/api/properties?status=${filter}&all=true`)
        if (res.ok) {
          const data = await res.json()
          setProperties(data.properties || [])
        }
      } catch { /* ignore */ }
      setLoading(false)
    }
    if (session && (session.user as any).role === 'ADMIN') fetchProps()
  }, [session, filter])

  const handleAction = async (propertyId: string, action: 'approve_property' | 'reject_property', reason?: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id: propertyId, reason }),
      })
      if (res.ok) {
        setProperties(prev => prev.filter(p => p.id !== propertyId))
      }
    } catch { /* ignore */ }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Modération des annonces</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'PENDING_REVIEW', label: 'En attente' },
          { value: 'ACTIVE', label: 'Actives' },
          { value: 'REJECTED', label: 'Rejetées' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => { setFilter(f.value); setLoading(true) }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f.value
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <p className="text-gray-500">Aucune propriété dans cette catégorie.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((p: any) => (
            <div key={p.id} className="bg-white border rounded-xl p-6">
              <div className="flex gap-4">
                <div className="w-32 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                  {p.images?.[0] ? (
                    <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No img
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{p.title}</h3>
                  <p className="text-gray-500 text-sm">{p.city} - {p.address}</p>
                  <p className="text-emerald-600 font-semibold">{formatPrice(p.price)}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Par {p.owner?.name} - {formatDate(p.createdAt)}
                  </p>
                  {p.images && (
                    <p className="text-xs text-gray-400">{p.images.length} image(s)</p>
                  )}
                </div>
                {filter === 'PENDING_REVIEW' && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleAction(p.id, 'approve_property')}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition text-sm"
                    >
                      Approuver
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Raison du rejet :')
                        if (reason) handleAction(p.id, 'reject_property', reason)
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      Rejeter
                    </button>
                    <Link
                      href={`/properties/${p.id}`}
                      className="text-center text-emerald-600 hover:underline text-sm"
                    >
                      Détails
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
