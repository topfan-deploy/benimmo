'use client';

import { useState } from 'react';

interface PaymentFormProps {
  bookingId: string;
  amount: number;
}

type PaymentMethod = 'MTN_MOMO' | 'MOOV_MONEY' | 'CARD';

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  {
    value: 'MTN_MOMO',
    label: 'MTN MoMo',
    icon: (
      <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
        <span className="text-xs font-bold text-black">MTN</span>
      </div>
    ),
  },
  {
    value: 'MOOV_MONEY',
    label: 'Moov Money',
    icon: (
      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
        <span className="text-xs font-bold text-white">Moov</span>
      </div>
    ),
  },
  {
    value: 'CARD',
    label: 'Carte bancaire',
    icon: (
      <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      </div>
    ),
  },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR').format(price);
}

export default function PaymentForm({ bookingId, amount }: PaymentFormProps) {
  const [method, setMethod] = useState<PaymentMethod | ''>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMobileMoney = method === 'MTN_MOMO' || method === 'MOOV_MONEY';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!method) {
      setError('Veuillez sélectionner un moyen de paiement.');
      return;
    }

    if (isMobileMoney && !phoneNumber) {
      setError('Veuillez saisir votre numéro de téléphone.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          amount,
          method,
          phoneNumber: isMobileMoney ? phoneNumber : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors du paiement');
      }

      const data = await res.json();

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Paiement</h3>

      {/* Amount Summary */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Montant à payer</span>
          <span className="text-2xl font-bold text-emerald-700">
            {formatPrice(amount)} FCFA
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Moyen de paiement *
          </label>
          <div className="space-y-3">
            {PAYMENT_METHODS.map((pm) => (
              <button
                key={pm.value}
                type="button"
                onClick={() => {
                  setMethod(pm.value);
                  setError(null);
                }}
                className={`w-full flex items-center space-x-4 p-4 rounded-lg border-2 transition-colors text-left ${
                  method === pm.value
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {pm.icon}
                <span className="font-medium text-gray-800">{pm.label}</span>
                {method === pm.value && (
                  <div className="ml-auto w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Phone Number (for mobile money) */}
        {isMobileMoney && (
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de téléphone *
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                +229
              </span>
              <input
                id="phone"
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="97 00 00 00"
                className="flex-1 rounded-r-lg border-gray-300 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {method === 'MTN_MOMO'
                ? 'Vous recevrez une notification MTN MoMo pour confirmer le paiement.'
                : 'Vous recevrez une notification Moov Money pour confirmer le paiement.'}
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !method}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Traitement en cours...</span>
            </>
          ) : (
            <span>Payer {formatPrice(amount)} FCFA</span>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Paiement sécurisé. Vos informations sont protégées.
        </p>
      </form>
    </div>
  );
}
