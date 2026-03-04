'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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

const BEDROOM_OPTIONS = [
  { value: '1', label: '1 chambre' },
  { value: '2', label: '2 chambres' },
  { value: '3', label: '3 chambres' },
  { value: '4', label: '4 chambres' },
  { value: '5', label: '5+ chambres' },
];

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [city, setCity] = useState(searchParams.get('city') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || '');
  const [priceMin, setPriceMin] = useState(searchParams.get('priceMin') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('priceMax') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
  const [priceType, setPriceType] = useState(searchParams.get('priceType') || '');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (propertyType) params.set('propertyType', propertyType);
    if (priceMin) params.set('priceMin', priceMin);
    if (priceMax) params.set('priceMax', priceMax);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (priceType) params.set('priceType', priceType);

    router.push(`/properties?${params.toString()}`);
  };

  const handleReset = () => {
    setCity('');
    setPropertyType('');
    setPriceMin('');
    setPriceMax('');
    setBedrooms('');
    setPriceType('');
    router.push('/properties');
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ville
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-lg border-gray-300 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Toutes les villes</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type de bien
          </label>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="w-full rounded-lg border-gray-300 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Tous les types</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prix (FCFA)
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="w-1/2 rounded-lg border-gray-300 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <input
              type="number"
              placeholder="Max"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-1/2 rounded-lg border-gray-300 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chambres
          </label>
          <select
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            className="w-full rounded-lg border-gray-300 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Toutes</option>
            {BEDROOM_OPTIONS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Période
          </label>
          <select
            value={priceType}
            onChange={(e) => setPriceType(e.target.value)}
            className="w-full rounded-lg border-gray-300 border px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Toutes</option>
            {PRICE_TYPES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-end space-x-2">
          <button
            onClick={handleSearch}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span>Rechercher</span>
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            title="Réinitialiser les filtres"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
