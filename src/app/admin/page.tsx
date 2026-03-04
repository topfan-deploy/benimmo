'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
    if (session && (session.user as any).role !== 'ADMIN') router.push('/')
  }, [status, session, router])

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch { /* ignore */ }
      setLoading(false)
    }
    if (session && (session.user as any).role === 'ADMIN') fetchStats()
  }, [session])

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Administration</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border rounded-xl p-6">
          <p className="text-sm text-gray-500 mb-1">Utilisateurs</p>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-white border rounded-xl p-6">
          <p className="text-sm text-gray-500 mb-1">Propriétés actives</p>
          <p className="text-3xl font-bold text-emerald-600">{stats.activeProperties}</p>
        </div>
        <div className="bg-white border rounded-xl p-6">
          <p className="text-sm text-gray-500 mb-1">En attente</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingProperties}</p>
        </div>
        <div className="bg-white border rounded-xl p-6">
          <p className="text-sm text-gray-500 mb-1">Revenus totaux</p>
          <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue || 0)}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/properties"
          className="bg-white border rounded-xl p-6 hover:shadow-md transition"
        >
          <h3 className="font-semibold text-lg mb-1">Modérer les annonces</h3>
          <p className="text-gray-500 text-sm">Approuver ou rejeter les propriétés en attente</p>
          {stats.pendingProperties > 0 && (
            <span className="inline-block mt-2 bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
              {stats.pendingProperties} en attente
            </span>
          )}
        </Link>
        <Link
          href="/admin/verifications"
          className="bg-white border rounded-xl p-6 hover:shadow-md transition"
        >
          <h3 className="font-semibold text-lg mb-1">Vérifier les documents</h3>
          <p className="text-gray-500 text-sm">Examiner les pièces d&apos;identité et titres fonciers</p>
          {stats.pendingDocuments > 0 && (
            <span className="inline-block mt-2 bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
              {stats.pendingDocuments} en attente
            </span>
          )}
        </Link>
        <div className="bg-white border rounded-xl p-6">
          <h3 className="font-semibold text-lg mb-1">Statistiques</h3>
          <div className="text-sm text-gray-500 space-y-1">
            <p>Réservations: {stats.totalBookings || 0}</p>
            <p>Paiements réussis: {stats.successfulPayments || 0}</p>
            <p>RDV: {stats.totalAppointments || 0}</p>
          </div>
        </div>
      </div>

      {/* Pending Properties */}
      {stats.pendingPropertiesList?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Propriétés en attente</h2>
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Titre</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Propriétaire</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Ville</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats.pendingPropertiesList.map((p: any) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4">{p.title}</td>
                    <td className="px-6 py-4 text-gray-500">{p.owner?.name}</td>
                    <td className="px-6 py-4 text-gray-500">{p.city}</td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/properties`} className="text-emerald-600 hover:underline text-sm">
                        Examiner
                      </Link>
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
