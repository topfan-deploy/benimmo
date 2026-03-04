'use client';

import { useState } from 'react';

interface AppointmentCalendarProps {
  propertyId: string;
}

const TIME_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
];

export default function AppointmentCalendar({ propertyId }: AppointmentCalendarProps) {
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  // Minimum date: tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !timeSlot) {
      setError('Veuillez sélectionner une date et un créneau horaire.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          date,
          time: timeSlot,
          notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la prise de rendez-vous');
      }

      setConfirmed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmed) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Rendez-vous confirmé !
        </h3>
        <p className="text-gray-600 mb-1">
          Date : <span className="font-medium">{new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </p>
        <p className="text-gray-600 mb-4">
          Heure : <span className="font-medium">{timeSlot}</span>
        </p>
        <button
          onClick={() => {
            setConfirmed(false);
            setDate('');
            setTimeSlot('');
            setNotes('');
          }}
          className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
        >
          Prendre un autre rendez-vous
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Planifier une visite
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Date */}
        <div>
          <label htmlFor="appointment-date" className="block text-sm font-medium text-gray-700 mb-1">
            Date de visite *
          </label>
          <input
            id="appointment-date"
            type="date"
            required
            min={minDate}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border-gray-300 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Time Slots */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Créneau horaire *
          </label>
          <div className="grid grid-cols-5 gap-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTimeSlot(slot)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  timeSlot === slot
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="appointment-notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optionnel)
          </label>
          <textarea
            id="appointment-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Informations supplémentaires pour le propriétaire..."
            className="w-full rounded-lg border-gray-300 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !date || !timeSlot}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {submitting && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          <span>{submitting ? 'Réservation...' : 'Réserver la visite'}</span>
        </button>
      </form>
    </div>
  );
}
