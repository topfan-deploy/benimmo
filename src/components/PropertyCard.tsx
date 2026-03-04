'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface PropertyCardProps {
  id: string;
  title: string;
  city: string;
  price: number;
  priceType: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  images: { url: string }[];
  status: string;
  owner: {
    name: string;
    isVerified: boolean;
  };
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR').format(price);
}

function priceTypeLabel(priceType: string): string {
  switch (priceType) {
    case 'DAILY':
      return '/jour';
    case 'MONTHLY':
      return '/mois';
    case 'YEARLY':
      return '/an';
    default:
      return '';
  }
}

function propertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    APARTMENT: 'Appartement',
    HOUSE: 'Maison',
    STUDIO: 'Studio',
    VILLA: 'Villa',
    LAND: 'Terrain',
    COMMERCIAL: 'Commercial',
  };
  return labels[type] || type;
}

export default function PropertyCard({
  id,
  title,
  city,
  price,
  priceType,
  propertyType,
  bedrooms,
  bathrooms,
  images,
  status,
  owner,
}: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const imageUrl = images.length > 0 ? images[0].url : null;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <svg
              className="w-16 h-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 22V12h6v10"
              />
            </svg>
          </div>
        )}

        {/* Status Badge */}
        {status === 'ACTIVE' && (
          <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Disponible
          </span>
        )}
        {status === 'RENTED' && (
          <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Loué
          </span>
        )}
        {status === 'SOLD' && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Vendu
          </span>
        )}

        {/* Property Type */}
        <span className="absolute top-3 right-12 bg-white/90 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
          {propertyTypeLabel(propertyType)}
        </span>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
          aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <svg
            className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-500'}`}
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <Link href={`/properties/${id}`} className="block p-4">
        {/* Price */}
        <div className="mb-2">
          <span className="text-xl font-bold text-emerald-600">
            {formatPrice(price)} FCFA
          </span>
          <span className="text-sm text-gray-500">{priceTypeLabel(priceType)}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">
          {title}
        </h3>

        {/* City */}
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {city}
        </div>

        {/* Features */}
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4"
              />
            </svg>
            <span>{bedrooms} ch.</span>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h8m-8 4h8m-6 4h4"
              />
            </svg>
            <span>{bathrooms} sdb.</span>
          </div>
        </div>

        {/* Owner */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-700 text-xs font-semibold">
                {owner.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-gray-600">{owner.name}</span>
            {owner.isVerified && (
              <span className="inline-flex items-center bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Vérifié
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
