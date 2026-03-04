'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { formatPrice, formatDate } from '@/lib/utils'

export default function BookingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/appointments')
        const data = await res.json()
        setAppointments(data.appointments || [])
      } catch { /* ignore */ }
      setLoading(false)
    }
    if (session) fetchData()
  }, [session])

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mes rendez-vous</h1>

      {appointments.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-xl font-semibold mb-2">Aucun rendez-vous</h2>
          <p className="text-gray-500">Vous n&apos;avez pas encore de rendez-vous de visite.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt: any) => (
            <div key={apt.id} className="bg-white border rounded-xl p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{apt.property?.title || 'Propriété'}</h3>
                  <p className="text-gray-500 text-sm">
                    {formatDate(apt.requestedDate)}
                    {apt.confirmedDate && ` - Confirmé: ${formatDate(apt.confirmedDate)}`}
                  </p>
                  {apt.notes && <p className="text-gray-600 mt-2">{apt.notes}</p>}
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  apt.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                  apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  apt.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {apt.status === 'CONFIRMED' ? 'Confirmé' :
                   apt.status === 'PENDING' ? 'En attente' :
                   apt.status === 'CANCELLED' ? 'Annulé' : 'Terminé'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
