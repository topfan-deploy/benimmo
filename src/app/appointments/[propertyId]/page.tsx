'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AppointmentCalendar from '@/components/AppointmentCalendar'

export default function AppointmentPage({ params }: { params: { propertyId: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!session) {
    router.push(`/auth/login?callbackUrl=/appointments/${params.propertyId}`)
    return null
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Prendre rendez-vous</h1>
      <p className="text-gray-500 mb-8">
        Sélectionnez une date et un créneau horaire pour visiter la propriété.
      </p>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <AppointmentCalendar propertyId={params.propertyId} />
      </div>
    </div>
  )
}
