'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from './ImageUploader';
import DocumentUploader from './DocumentUploader';

const CITIES = [
  'Cotonou',
  'Porto-Novo',
  'Parakou',
  'Abomey-Calavi',
  'Djougou',
  'Bohicon',
  'Natitingou',
  'Ouidah',
  'Lokossa',
  'Abomey',
];

const PROPERTY_TYPES = [
  { value: 'APARTMENT', label: 'Appartement' },
  { value: 'HOUSE', label: 'Maison' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'LAND', label: 'Terrain' },
  { value: 'COMMERCIAL', label: 'Commercial' },
];

const PRICE_TYPES = [
  { value: 'DAILY', label: 'Par jour' },
  { value: 'MONTHLY', label: 'Par mois' },
  { value: 'YEARLY', label: 'Par an' },
];

interface PropertyFormState {
  title: string;
  description: string;
  address: string;
  city: string;
  price: string;
  priceType: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  images: string[];
  ownershipDocument: string;
}

export default function PropertyForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<PropertyFormState>({
    title: '',
    description: '',
    address: '',
    city: '',
    price: '',
    priceType: 'MONTHLY',
    propertyType: 'APARTMENT',
    bedrooms: '1',
    bathrooms: '1',
    area: '',
    images: [],
    ownershipDocument: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (urls: string[]) => {
    setForm((prev) => ({ ...prev, images: urls }));
  };

  const handleDocumentUpload = (url: string) => {
    setForm((prev) => ({ ...prev, ownershipDocument: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        address: form.address,
        city: form.city,
        price: parseFloat(form.price),
        priceType: form.priceType,
        propertyType: form.propertyType,
        bedrooms: parseInt(form.bedrooms, 10),
        bathrooms: parseInt(form.bathrooms, 10),
        area: form.area ? parseFloat(form.area) : undefined,
        images: form.images,
        ownershipDocument: form.ownershipDocument || undefined,
      };

      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la création');
      }

      const data = await res.json();
      router.push(`/properties/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Informations générales
        </h2>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Titre de l&apos;annonce *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={form.title}
            onChange={handleChange}
            placeholder="Ex: Bel appartement 3 chambres à Cotonou"
            className="w-full rounded-lg border-gray-300 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            value={form.description}
            onChange={handleChange}
            placeholder="Décrivez votre bien en détail..."
            className="w-full rounded-lg border-gray-300 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
              Type de bien *
            </label>
            <select
              id="propertyType"
              name="propertyType"
              required
              value={form.propertyType}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
              Superficie (m²)
            </label>
            <input
              id="area"
              name="area"
              type="number"
              min="0"
              value={form.area}
              onChange={handleChange}
              placeholder="Ex: 120"
              className="w-full rounded-lg border-gray-300 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">Localisation</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              Ville *
            </label>
            <select
              id="city"
              name="city"
              required
              value={form.city}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Sélectionnez une ville</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse *
            </label>
            <input
              id="address"
              name="address"
              type="text"
              required
              value={form.address}
              onChange={handleChange}
              placeholder="Ex: Quartier Ganhi, à côté de la pharmacie"
              className="w-full rounded-lg border-gray-300 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Pricing & Details */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">Prix et détails</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Prix (FCFA) *
            </label>
            <input
              id="price"
              name="price"
              type="number"
              required
              min="0"
              value={form.price}
              onChange={handleChange}
              placeholder="Ex: 150000"
              className="w-full rounded-lg border-gray-300 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="priceType" className="block text-sm font-medium text-gray-700 mb-1">
              Période *
            </label>
            <select
              id="priceType"
              name="priceType"
              required
              value={form.priceType}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {PRICE_TYPES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
              Chambres *
            </label>
            <select
              id="bedrooms"
              name="bedrooms"
              required
              value={form.bedrooms}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n.toString()}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
            Salles de bain *
          </label>
          <select
            id="bathrooms"
            name="bathrooms"
            required
            value={form.bathrooms}
            onChange={handleChange}
            className="w-full rounded-lg border-gray-300 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 max-w-xs"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n.toString()}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Photos</h2>
        <p className="text-sm text-gray-500">
          Ajoutez des photos de votre bien pour attirer plus de visiteurs.
        </p>
        <ImageUploader onUpload={handleImageUpload} maxFiles={10} />
      </div>

      {/* Ownership Document */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Document de propriété
        </h2>
        <p className="text-sm text-gray-500">
          Téléchargez un document prouvant votre droit sur le bien (titre foncier,
          contrat de bail, etc.). Cela aide à vérifier votre annonce.
        </p>
        <DocumentUploader
          onUpload={handleDocumentUpload}
          label="Document de propriété"
          accept=".pdf,.jpg,.jpeg,.png"
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {submitting && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          <span>{submitting ? 'Publication...' : 'Publier l\'annonce'}</span>
        </button>
      </div>
    </form>
  );
}
