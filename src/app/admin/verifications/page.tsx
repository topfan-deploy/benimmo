'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'

export default function VerificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
        <div className="space-y-4">
          {documents.map((doc: any) => (
            <div key={doc.id} className="bg-white border rounded-xl p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      doc.type === 'IDENTITY' ? 'bg-blue-100 text-blue-700' :
                      doc.type === 'OWNERSHIP' ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {doc.type === 'IDENTITY' ? "Pièce d'identité" :
                       doc.type === 'OWNERSHIP' ? 'Titre de propriété' : 'Taxe foncière'}
                    </span>
                    <span className="text-sm text-gray-500">{formatDate(doc.createdAt)}</span>
                  </div>
                  <p className="font-medium">{doc.user?.name || 'Utilisateur'}</p>
                  <p className="text-sm text-gray-500">{doc.user?.email}</p>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:underline text-sm mt-2 inline-block"
                  >
                    Voir le document
                  </a>
                </div>
                <div className="flex gap-2">
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
