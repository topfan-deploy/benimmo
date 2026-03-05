'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { formatPrice, formatDate } from '@/lib/utils'

export default function BookingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<any[]>([])
  const [handovers, setHandovers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
    async function fetchData() {
      try {
        const [aptRes, handoverRes] = await Promise.all([
          fetch('/api/appointments'),
          fetch('/api/handover'),
        ])
        const aptData = await aptRes.json()
        const handoverData = await handoverRes.json()
        setAppointments(aptData.appointments || [])
        setHandovers(handoverData.handovers || [])
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
      <h1 className="text-3xl font-bold mb-8">Mes réservations</h1>

      {/* Section Remise des clés */}
      {handovers.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Remise des clés</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {handovers.map((h: any) => (
              <div key={h.id} className="bg-white border rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {h.booking?.property?.title || 'Propriété'}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {h.booking?.property?.address}, {h.booking?.property?.city}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    h.status === 'CONFIRMED'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {h.status === 'CONFIRMED' ? 'Clés remises' : 'En attente'}
                  </span>
                </div>

                {/* Code de confirmation */}
                <div className={`rounded-lg p-4 text-center ${
                  h.status === 'CONFIRMED'
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-emerald-50 border border-emerald-300'
                }`}>
                  <p className="text-sm text-gray-600 mb-1">Code de confirmation</p>
                  <p className="font-mono text-3xl font-bold tracking-widest text-emerald-700">
                    {h.confirmationCode}
                  </p>
                  {h.status === 'PENDING' && (
                    <p className="text-xs text-gray-500 mt-2">
                      Communiquez ce code au propriétaire lors de la remise des clés
                    </p>
                  )}
                  {h.status === 'CONFIRMED' && h.confirmedAt && (
                    <p className="text-xs text-emerald-600 mt-2">
                      Confirmé le {formatDate(h.confirmedAt)}
                      {h.confirmedBy && ` par ${h.confirmedBy.name}`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Rendez-vous */}
      <h2 className="text-xl font-semibold mb-4">Mes rendez-vous</h2>

      {appointments.length === 0 && handovers.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-xl font-semibold mb-2">Aucune réservation</h2>
          <p className="text-gray-500">Vous n&apos;avez pas encore de rendez-vous ou de réservation.</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <p className="text-gray-500">Aucun rendez-vous de visite.</p>
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
