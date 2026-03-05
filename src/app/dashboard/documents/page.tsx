'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'

const BENIN_ID_TYPES = [
  { value: 'DRIVERS_LICENSE', label: 'Permis de conduire' },
  { value: 'NATIONAL_ID', label: "Carte nationale d'identité (CNI)" },
  { value: 'PASSPORT', label: 'Passeport' },
  { value: 'RESIDENT_CARD', label: 'Carte de résident' },
  { value: 'VOTER_ID', label: "Carte d'électeur" },
  { value: 'TRAVEL_DOC', label: 'Document de voyage' },
]

export default function DocumentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Identity form state
  const [idType, setIdType] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [idFile, setIdFile] = useState<File | null>(null)
  const [idSubmitting, setIdSubmitting] = useState(false)
  const [idMessage, setIdMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Ownership form state
  const [ownershipFile, setOwnershipFile] = useState<File | null>(null)
  const [ownershipSubmitting, setOwnershipSubmitting] = useState(false)
  const [ownershipMessage, setOwnershipMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Tax form state
  const [taxFile, setTaxFile] = useState<File | null>(null)
  const [taxSubmitting, setTaxSubmitting] = useState(false)
  const [taxMessage, setTaxMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
    fetchDocuments()
  }, [session])

  async function fetchDocuments() {
    if (!session) return
    try {
      const res = await fetch('/api/documents')
      const data = await res.json()
      setDocuments(data.documents || [])
    } catch { /* ignore */ }
    setLoading(false)
  }

  async function uploadFile(file: File): Promise<string | null> {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) return null
      const data = await res.json()
      return data.url || null
    } catch {
      return null
    }
  }

  async function handleIdSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!idFile || !idType || !idNumber || !firstName || !lastName) return
    setIdSubmitting(true)
    setIdMessage(null)

    const url = await uploadFile(idFile)
    if (!url) {
      setIdMessage({ type: 'error', text: "Erreur lors de l'upload du fichier" })
      setIdSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'IDENTITY', url, idType, idNumber, firstName, lastName }),
      })
      const data = await res.json()
      if (res.ok) {
        const smileStatus = data.smileResult?.status
        let text = data.message || 'Document soumis'
        if (smileStatus === 'Passed') {
          text += ' — Vérification automatique réussie'
        } else if (smileStatus === 'Failed') {
          text += ' — Vérification automatique échouée, en attente de revue manuelle'
        }
        setIdMessage({ type: 'success', text })
        setIdType('')
        setIdNumber('')
        setFirstName('')
        setLastName('')
        setIdFile(null)
        fetchDocuments()
      } else {
        setIdMessage({ type: 'error', text: data.error || 'Erreur lors de la soumission' })
      }
    } catch {
      setIdMessage({ type: 'error', text: 'Erreur de connexion au serveur' })
    }
    setIdSubmitting(false)
  }

  async function handleSimpleSubmit(
    type: 'OWNERSHIP' | 'TAX_RECEIPT',
    file: File | null,
    setSubmitting: (v: boolean) => void,
    setMessage: (v: { type: 'success' | 'error'; text: string } | null) => void,
    setFile: (v: File | null) => void
  ) {
    if (!file) return
    setSubmitting(true)
    setMessage(null)

    const url = await uploadFile(file)
    if (!url) {
      setMessage({ type: 'error', text: "Erreur lors de l'upload du fichier" })
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, url }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Document soumis' })
        setFile(null)
        fetchDocuments()
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la soumission' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' })
    }
    setSubmitting(false)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mes documents</h1>

      {/* Section Pièce d'identité */}
      <div className="bg-white border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Pièce d&apos;identité</h2>
        <form onSubmit={handleIdSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de pièce</label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Sélectionner...</option>
                {BENIN_ID_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de la pièce</label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Ex: AB1234567"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de famille</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fichier (photo ou scan)</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setIdFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              required
            />
          </div>
          <button
            type="submit"
            disabled={idSubmitting}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {idSubmitting ? 'Envoi en cours...' : 'Soumettre la pièce d\'identité'}
          </button>
          {idMessage && (
            <div className={`text-sm px-4 py-2 rounded-lg ${
              idMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {idMessage.text}
            </div>
          )}
        </form>
      </div>

      {/* Section Document de propriété */}
      <div className="bg-white border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Document de propriété</h2>
        <p className="text-sm text-gray-500 mb-4">Titre foncier, certificat de propriété ou tout document attestant la propriété du bien.</p>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setOwnershipFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>
          <button
            onClick={() => handleSimpleSubmit('OWNERSHIP', ownershipFile, setOwnershipSubmitting, setOwnershipMessage, setOwnershipFile)}
            disabled={!ownershipFile || ownershipSubmitting}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            {ownershipSubmitting ? 'Envoi...' : 'Soumettre'}
          </button>
        </div>
        {ownershipMessage && (
          <div className={`mt-3 text-sm px-4 py-2 rounded-lg ${
            ownershipMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {ownershipMessage.text}
          </div>
        )}
      </div>

      {/* Section Taxe foncière */}
      <div className="bg-white border rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Taxe foncière</h2>
        <p className="text-sm text-gray-500 mb-4">Dernier avis de taxe foncière ou reçu de paiement.</p>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setTaxFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
          </div>
          <button
            onClick={() => handleSimpleSubmit('TAX_RECEIPT', taxFile, setTaxSubmitting, setTaxMessage, setTaxFile)}
            disabled={!taxFile || taxSubmitting}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
          >
            {taxSubmitting ? 'Envoi...' : 'Soumettre'}
          </button>
        </div>
        {taxMessage && (
          <div className={`mt-3 text-sm px-4 py-2 rounded-lg ${
            taxMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {taxMessage.text}
          </div>
        )}
      </div>

      {/* Documents déjà soumis */}
      {documents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Documents soumis</h2>
          <div className="space-y-3">
            {documents.map((doc: any) => (
              <div key={doc.id} className="bg-white border rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    doc.type === 'IDENTITY' ? 'bg-blue-100 text-blue-700' :
                    doc.type === 'OWNERSHIP' ? 'bg-purple-100 text-purple-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {doc.type === 'IDENTITY' ? "Pièce d'identité" :
                     doc.type === 'OWNERSHIP' ? 'Titre de propriété' : 'Taxe foncière'}
                  </span>
                  {doc.idType && (
                    <span className="text-xs text-gray-500">
                      {BENIN_ID_TYPES.find(t => t.value === doc.idType)?.label || doc.idType}
                      {doc.idNumber && ` — ${doc.idNumber}`}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{formatDate(doc.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {doc.smileVerificationStatus && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      doc.smileVerificationStatus === 'Passed' ? 'bg-emerald-100 text-emerald-700' :
                      doc.smileVerificationStatus === 'Failed' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      Smile ID: {doc.smileVerificationStatus === 'Passed' ? 'Vérifié' :
                                  doc.smileVerificationStatus === 'Failed' ? 'Échoué' : 'Erreur'}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    doc.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                    doc.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {doc.status === 'APPROVED' ? 'Approuvé' :
                     doc.status === 'REJECTED' ? 'Rejeté' : 'En attente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
