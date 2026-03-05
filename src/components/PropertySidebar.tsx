'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AppointmentCalendar from './AppointmentCalendar'

interface Props {
  propertyId: string
  ownerId: string
  ownerName: string
  ownerPhone: string | null
  ownerIsVerified: boolean
}

export default function PropertySidebar({ propertyId, ownerId, ownerName, ownerPhone, ownerIsVerified }: Props) {
  const { data: session } = useSession()
  const [hasPaid, setHasPaid] = useState(false)
  const [loading, setLoading] = useState(true)
  const [messageText, setMessageText] = useState('')
  const [messageSent, setMessageSent] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    async function checkPayment() {
      if (!session) {
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`/api/payments?propertyId=${propertyId}&check=true`)
        if (res.ok) {
          const data = await res.json()
          setHasPaid(data.hasPaid)
        }
      } catch { /* ignore */ }
      setLoading(false)
    }
    checkPayment()
  }, [session, propertyId])

  const handleSendMessage = async () => {
    if (!messageText.trim() || !session) return
    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: ownerId,
          content: messageText,
          propertyId,
        }),
      })
      if (res.ok) {
        setMessageSent(true)
        setMessageText('')
      }
    } catch { /* ignore */ }
    setSending(false)
  }

  return (
    <div className="lg:col-span-1">
      {/* Owner Info */}
      <div className="bg-white border rounded-xl p-6 mb-6 sticky top-4">
        <h3 className="font-semibold text-lg mb-4">Propriétaire</h3>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-emerald-600 font-bold text-lg">
              {ownerName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium">{ownerName}</p>
            {ownerIsVerified && (
              <p className="text-xs text-emerald-600">Identité vérifiée</p>
            )}
          </div>
        </div>

        {/* Numéro visible uniquement après paiement */}
        {hasPaid && ownerPhone ? (
          <a
            href={`tel:${ownerPhone}`}
            className="block w-full bg-emerald-600 text-white text-center py-3 rounded-lg font-medium hover:bg-emerald-700 transition mb-3"
          >
            📞 {ownerPhone}
          </a>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3 text-center">
            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-sm text-gray-500 font-medium">Numéro masqué</p>
            <p className="text-xs text-gray-400 mt-1">
              Le numéro du propriétaire sera visible après réservation et paiement
            </p>
          </div>
        )}

        <Link
          href={`/appointments/${propertyId}`}
          className="block w-full border-2 border-emerald-600 text-emerald-600 text-center py-3 rounded-lg font-medium hover:bg-emerald-50 transition mb-3"
        >
          Prendre rendez-vous
        </Link>

        {/* Messagerie interne */}
        {session ? (
          <div className="mt-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Envoyer un message</h4>
            {messageSent ? (
              <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm text-center">
                Message envoyé ! Le propriétaire vous répondra bientôt.
                <button
                  onClick={() => setMessageSent(false)}
                  className="block mx-auto mt-2 text-emerald-600 underline text-xs"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Bonjour, je suis intéressé par cette propriété..."
                  className="w-full border rounded-lg px-3 py-2 text-sm h-20 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sending}
                  className="w-full mt-2 bg-gray-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition disabled:opacity-50"
                >
                  {sending ? 'Envoi...' : 'Envoyer le message'}
                </button>
              </>
            )}
          </div>
        ) : (
          <Link
            href={`/auth/login?callbackUrl=/properties/${propertyId}`}
            className="block w-full bg-gray-100 text-gray-600 text-center py-3 rounded-lg font-medium hover:bg-gray-200 transition mt-3 text-sm"
          >
            Connectez-vous pour contacter le propriétaire
          </Link>
        )}
      </div>

      {/* Quick Appointment */}
      <div className="bg-white border rounded-xl p-6">
        <h3 className="font-semibold text-lg mb-4">Planifier une visite</h3>
        <AppointmentCalendar propertyId={propertyId} />
      </div>
    </div>
  )
}
