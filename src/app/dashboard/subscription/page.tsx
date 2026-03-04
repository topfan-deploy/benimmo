'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { formatPrice, formatDate } from '@/lib/utils'

export default function SubscriptionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [subscription, setSubscription] = useState<any>(null)
  const [hasActive, setHasActive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(false)
  const [method, setMethod] = useState('MOMO')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
    async function fetchSub() {
      try {
        const res = await fetch('/api/subscriptions')
        if (res.ok) {
          const data = await res.json()
          setHasActive(data.hasActiveSubscription)
          setSubscription(data.subscription)
        }
      } catch { /* ignore */ }
      setLoading(false)
    }
    if (session) fetchSub()
  }, [session])

  const handleSubscribe = async () => {
    setSubscribing(true)
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method }),
      })
      if (res.ok) {
        const data = await res.json()
        setHasActive(true)
        setSubscription(data.subscription)
      }
    } catch { /* ignore */ }
    setSubscribing(false)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Abonnement Propriétaire</h1>
      <p className="text-gray-500 mb-8">
        Un abonnement actif est requis pour publier des annonces sur BenImmo.
      </p>

      {hasActive && subscription ? (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-700">Abonnement actif</h2>
              <p className="text-emerald-600 text-sm">Vous pouvez publier des annonces</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-500">Montant</p>
              <p className="font-bold">{formatPrice(subscription.amount)}/mois</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-500">Expire le</p>
              <p className="font-bold">{formatDate(subscription.endDate)}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border rounded-xl p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🏠</div>
            <h2 className="text-2xl font-bold mb-2">Abonnement Mensuel</h2>
            <div className="text-4xl font-bold text-emerald-600 mb-1">
              {formatPrice(10000)}
              <span className="text-lg text-gray-500 font-normal">/mois</span>
            </div>
            <p className="text-gray-500 mt-2">Publiez un nombre illimité d&apos;annonces</p>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Publication illimitée d&apos;annonces</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Tableau de bord propriétaire</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Badge &quot;Propriétaire vérifié&quot;</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Gestion des rendez-vous de visite</span>
            </div>
          </div>

          {/* Méthode de paiement */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Mode de paiement</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'MOMO', label: 'MTN MoMo', color: 'yellow' },
                { value: 'MOOV', label: 'Moov Money', color: 'blue' },
                { value: 'CARD', label: 'Carte bancaire', color: 'gray' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMethod(opt.value)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition ${
                    method === opt.value
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubscribe}
            disabled={subscribing}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50 text-lg"
          >
            {subscribing ? 'Activation...' : "S'abonner - 10 000 FCFA/mois"}
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            Commission de 10% prélevée sur chaque réservation payée par un client.
          </p>
        </div>
      )}
    </div>
  )
}
