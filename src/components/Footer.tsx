'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Branding */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <svg
                className="w-8 h-8 text-emerald-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
              <span className="text-2xl font-bold text-white">BenImmo</span>
            </div>
            <p className="text-sm leading-relaxed">
              La plateforme immobilière de référence au Bénin. Trouvez facilement
              votre prochain logement ou publiez votre annonce pour toucher des
              milliers de locataires et acheteurs potentiels.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm hover:text-emerald-400 transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/properties" className="text-sm hover:text-emerald-400 transition-colors">
                  Propriétés
                </Link>
              </li>
              <li>
                <Link href="/properties/new" className="text-sm hover:text-emerald-400 transition-colors">
                  Publier une annonce
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm hover:text-emerald-400 transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-sm">Location de maisons</span>
              </li>
              <li>
                <span className="text-sm">Vente immobilière</span>
              </li>
              <li>
                <span className="text-sm">Gestion locative</span>
              </li>
              <li>
                <span className="text-sm">Conseil immobilier</span>
              </li>
              <li>
                <span className="text-sm">Estimation de biens</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0"
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
                <span className="text-sm">
                  Cotonou, Bénin
                  <br />
                  Quartier Ganhi, Rue du Commerce
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5 text-emerald-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span className="text-sm">+229 97 00 00 00</span>
              </li>
              <li className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5 text-emerald-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm">contact@benimmo.bj</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-10 pt-6 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} BenImmo. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
