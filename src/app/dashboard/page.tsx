'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/dashboard')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/properties?ownerId=me')
        const data = await res.json()
        setStats(data)
      } catch {
        // ignore
      }
    }
    if (session) fetchStats()
  }, [session])

  if (status === 'loading') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) return null

  const user = session.user as any

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-gray-500">Bienvenue, {user.name}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Mes propriétés</p>
              <p className="text-2xl font-bold">{stats?.properties?.length || 0}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Réservations</p>
              <p className="text-2xl font-bold">-</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Statut du compte</p>
              <p className="text-lg font-bold">
                {user.isVerified ? (
                  <span className="text-emerald-600">Vérifié</span>
                ) : (
                  <span className="text-yellow-600">Non vérifié</span>
                )}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${user.isVerified ? 'bg-emerald-100' : 'bg-yellow-100'}`}>
              <svg className={`w-6 h-6 ${user.isVerified ? 'text-emerald-600' : 'text-yellow-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          href="/properties/new"
          className="bg-emerald-600 text-white p-4 rounded-xl hover:bg-emerald-700 transition text-center font-medium"
        >
          Publier une annonce
        </Link>
        <Link
          href="/dashboard/properties"
          className="bg-white border p-4 rounded-xl hover:bg-gray-50 transition text-center font-medium"
        >
          Mes propriétés
        </Link>
        <Link
          href="/dashboard/bookings"
          className="bg-white border p-4 rounded-xl hover:bg-gray-50 transition text-center font-medium"
        >
          Mes réservations
        </Link>
        <Link
          href="/properties"
          className="bg-white border p-4 rounded-xl hover:bg-gray-50 transition text-center font-medium"
        >
          Parcourir les annonces
        </Link>
      </div>

      {/* Recent Properties */}
      {stats?.properties?.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Mes propriétés récentes</h2>
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Titre</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Ville</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Prix</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats.properties.slice(0, 5).map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href={`/properties/${p.id}`} className="text-emerald-600 hover:underline">
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{p.city}</td>
                    <td className="px-6 py-4">{formatPrice(p.price)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                        p.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
                        p.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {p.status === 'ACTIVE' ? 'Active' :
                         p.status === 'PENDING_REVIEW' ? 'En attente' :
                         p.status === 'REJECTED' ? 'Rejetée' : p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
