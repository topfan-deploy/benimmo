'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import PropertyForm from '@/components/PropertyForm'

export default function NewPropertyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!session) {
    router.push('/auth/login?callbackUrl=/properties/new')
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Publier une annonce</h1>
      <p className="text-gray-500 mb-8">
        Remplissez les informations de votre propriété. Votre annonce sera examinée avant publication.
      </p>
      <PropertyForm />
    </div>
  )
}
