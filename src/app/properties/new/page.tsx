'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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

  const userRole = (session.user as any).role

  if (userRole !== 'OWNER' && userRole !== 'ADMIN') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">Accès réservé aux propriétaires</h1>
          <p className="text-gray-600 mb-6">
            Seuls les comptes propriétaires peuvent publier des annonces.
            Si vous êtes propriétaire, veuillez créer un compte avec le rôle &quot;Propriétaire&quot;.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/properties"
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition font-medium"
            >
              Parcourir les annonces
            </Link>
            <Link
              href="/auth/register"
              className="border-2 border-emerald-600 text-emerald-600 px-6 py-2 rounded-lg hover:bg-emerald-50 transition font-medium"
            >
              Créer un compte propriétaire
            </Link>
          </div>
        </div>
      </div>
    )
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
