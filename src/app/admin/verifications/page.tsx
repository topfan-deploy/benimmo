'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'

const ID_TYPE_LABELS: Record<string, string> = {
  DRIVERS_LICENSE: 'Permis de conduire',
  NATIONAL_ID: "Carte nationale d'identité (CNI)",
  PASSPORT: 'Passeport',
  RESIDENT_CARD: 'Carte de résident',
  VOTER_ID: "Carte d'électeur",
  TRAVEL_DOC: 'Document de voyage',
}

export default function VerificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedJson, setExpandedJson] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
    if (session && (session.user as any).role !== 'ADMIN') router.push('/')
  }, [status, session, router])

  useEffect(() => {
    async function fetchDocs() {
      try {
        const res = await fetch('/api/admin?type=documents')
        if (res.ok) {
          const data = await res.json()
          setDocuments(data.documents || [])
        }
      } catch { /* ignore */ }
      setLoading(false)
    }
    if (session && (session.user as any).role === 'ADMIN') fetchDocs()
  }, [session])

  const handleAction = async (docId: string, action: 'approve_document' | 'reject_document', reason?: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id: docId, reason }),
      })
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== docId))
      }
    } catch { /* ignore */ }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Vérification des documents</h1>

      {documents.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-xl font-semibold mb-2">Aucun document en attente</h2>
          <p className="text-gray-500">Tous les documents ont été examinés.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {documents.map((doc: any) => (
            <div key={doc.id} className="bg-white border rounded-xl p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Header: type badge + Smile ID badge */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      doc.type === 'IDENTITY' ? 'bg-blue-100 text-blue-700' :
                      doc.type === 'OWNERSHIP' ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {doc.type === 'IDENTITY' ? "Pièce d'identité" :
                       doc.type === 'OWNERSHIP' ? 'Titre de propriété' : 'Taxe foncière'}
                    </span>

                    {/* Smile ID verification badge */}
                    {doc.type === 'IDENTITY' && doc.smileVerificationStatus && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        doc.smileVerificationStatus === 'Passed' ? 'bg-emerald-100 text-emerald-700' :
                        doc.smileVerificationStatus === 'Failed' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        Smile ID: {doc.smileVerificationStatus === 'Passed' ? 'Passed' :
                                    doc.smileVerificationStatus === 'Failed' ? 'Failed' : 'Error'}
                      </span>
                    )}

                    <span className="text-sm text-gray-500">{formatDate(doc.createdAt)}</span>
                  </div>

                  {/* User info */}
                  <p className="font-medium">{doc.user?.name || 'Utilisateur'}</p>
                  <p className="text-sm text-gray-500">{doc.user?.email}</p>
                  {doc.user?.phone && <p className="text-sm text-gray-500">{doc.user.phone}</p>}

                  {/* Identity document details */}
                  {doc.type === 'IDENTITY' && (doc.idType || doc.idNumber) && (
                    <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-800">Détails de la pièce</p>
                      {doc.idType && (
                        <p className="text-sm text-blue-700">
                          Type : {ID_TYPE_LABELS[doc.idType] || doc.idType}
                        </p>
                      )}
                      {doc.idNumber && (
                        <p className="text-sm text-blue-700">
                          Numéro : <span className="font-mono">{doc.idNumber}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Smile ID raw result (expandable) */}
                  {doc.type === 'IDENTITY' && doc.smileResult && (
                    <div className="mt-3">
                      <button
                        onClick={() => setExpandedJson(expandedJson === doc.id ? null : doc.id)}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                      >
                        {expandedJson === doc.id ? 'Masquer' : 'Voir'} le résultat Smile ID (JSON)
                      </button>
                      {expandedJson === doc.id && (
                        <pre className="mt-2 bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-64">
                          {JSON.stringify(doc.smileResult, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}

                  {/* Checklist for property documents */}
                  {(doc.type === 'OWNERSHIP' || doc.type === 'TAX_RECEIPT') && (
                    <div className="mt-3 bg-gray-50 border rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Checklist de vérification :</p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                          Document lisible et complet
                        </li>
                        <li className="flex items-center gap-2">
                          <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                          Le nom correspond au propriétaire ({doc.user?.name})
                        </li>
                        <li className="flex items-center gap-2">
                          <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                          Date du document valide (non expiré)
                        </li>
                        {doc.type === 'OWNERSHIP' && (
                          <li className="flex items-center gap-2">
                            <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                            Adresse cohérente avec la propriété déclarée
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:underline text-sm mt-3 inline-block"
                  >
                    Voir le document
                  </a>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleAction(doc.id, 'approve_document')}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition text-sm"
                  >
                    Approuver
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Raison du rejet :')
                      if (reason) handleAction(doc.id, 'reject_document', reason)
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    Rejeter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
