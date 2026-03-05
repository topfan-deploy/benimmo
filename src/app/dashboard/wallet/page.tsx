'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { formatPrice, formatDate } from '@/lib/utils'

export default function WalletPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [wallet, setWallet] = useState<any>(null)
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', method: 'MOMO', phoneNumber: '' })
  const [withdrawing, setWithdrawing] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
    async function fetchData() {
      try {
        const [walletRes, withdrawRes] = await Promise.all([
          fetch('/api/wallet'),
          fetch('/api/wallet/withdraw'),
        ])
        if (walletRes.ok) {
          const data = await walletRes.json()
          setWallet(data.wallet)
        }
        if (withdrawRes.ok) {
          const data = await withdrawRes.json()
          setWithdrawals(data.withdrawals || [])
        }
      } catch { /* ignore */ }
      setLoading(false)
    }
    if (session) fetchData()
  }, [session])

  const handleWithdraw = async () => {
    setWithdrawing(true)
    setMessage('')
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(withdrawForm.amount),
          method: withdrawForm.method,
          phoneNumber: withdrawForm.phoneNumber,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('Demande de retrait envoyée avec succès !')
        setShowWithdraw(false)
        setWithdrawForm({ amount: '', method: 'MOMO', phoneNumber: '' })
        // Refresh data
        const walletRes = await fetch('/api/wallet')
        if (walletRes.ok) {
          const walletData = await walletRes.json()
          setWallet(walletData.wallet)
        }
        const withdrawRes = await fetch('/api/wallet/withdraw')
        if (withdrawRes.ok) {
          const withdrawData = await withdrawRes.json()
          setWithdrawals(withdrawData.withdrawals || [])
        }
      } else {
        setMessage(data.error || 'Erreur lors du retrait')
      }
    } catch {
      setMessage('Erreur de connexion')
    }
    setWithdrawing(false)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mon Portefeuille</h1>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${message.includes('succès') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      {/* Solde */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-xl p-8 mb-8">
        <p className="text-emerald-200 text-sm mb-1">Solde disponible</p>
        <p className="text-4xl font-bold mb-4">{formatPrice(wallet?.balance || 0)}</p>
        <button
          onClick={() => setShowWithdraw(!showWithdraw)}
          disabled={!wallet?.balance || wallet.balance <= 0}
          className="bg-white text-emerald-700 px-6 py-2 rounded-lg font-semibold hover:bg-emerald-50 transition disabled:opacity-50"
        >
          Retirer vers Mobile Money
        </button>
      </div>

      {/* Formulaire de retrait */}
      {showWithdraw && (
        <div className="bg-white border rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Demande de retrait</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA)</label>
              <input
                type="number"
                value={withdrawForm.amount}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                placeholder="Ex: 50000"
                max={wallet?.balance || 0}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">Maximum : {formatPrice(wallet?.balance || 0)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
              <input
                type="tel"
                value={withdrawForm.phoneNumber}
                onChange={(e) => setWithdrawForm({ ...withdrawForm, phoneNumber: e.target.value })}
                placeholder="+229 XX XX XX XX"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Mode de retrait</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setWithdrawForm({ ...withdrawForm, method: 'MOMO' })}
                className={`flex-1 py-3 rounded-lg border-2 font-medium transition ${
                  withdrawForm.method === 'MOMO'
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                MTN MoMo
              </button>
              <button
                type="button"
                onClick={() => setWithdrawForm({ ...withdrawForm, method: 'MOOV' })}
                className={`flex-1 py-3 rounded-lg border-2 font-medium transition ${
                  withdrawForm.method === 'MOOV'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                Moov Money
              </button>
            </div>
          </div>
          <button
            onClick={handleWithdraw}
            disabled={withdrawing || !withdrawForm.amount || !withdrawForm.phoneNumber}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {withdrawing ? 'Traitement...' : 'Confirmer le retrait'}
          </button>
        </div>
      )}

      {/* Historique des transactions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Historique des transactions</h2>
        {wallet?.transactions?.length > 0 ? (
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="divide-y">
              {wallet.transactions.map((tx: any) => (
                <div key={tx.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-xs text-gray-400">{formatDate(tx.createdAt)}</p>
                  </div>
                  <span className={`font-bold ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {tx.type === 'CREDIT' ? '+' : '-'}{formatPrice(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <p className="text-gray-500">Aucune transaction pour le moment</p>
          </div>
        )}
      </div>

      {/* Historique des retraits */}
      {withdrawals.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Historique des retraits</h2>
          <div className="bg-white border rounded-xl overflow-hidden">
            <div className="divide-y">
              {withdrawals.map((w: any) => (
                <div key={w.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{formatPrice(w.amount)} → {w.phoneNumber}</p>
                    <p className="text-xs text-gray-400">
                      {w.method === 'MOMO' ? 'MTN MoMo' : 'Moov Money'} • {formatDate(w.createdAt)}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    w.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                    w.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    w.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {w.status === 'COMPLETED' ? 'Effectué' :
                     w.status === 'PENDING' ? 'En attente' :
                     w.status === 'PROCESSING' ? 'En cours' : 'Échoué'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
