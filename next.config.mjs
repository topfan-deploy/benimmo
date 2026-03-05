/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Appliquer à toutes les routes
        source: '/(.*)',
        headers: [
          {
            // Empêcher l'inclusion du site dans un iframe (anti clickjacking)
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // Empêcher le navigateur de deviner le type MIME (anti MIME sniffing)
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Protection XSS du navigateur
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            // Ne pas envoyer le referrer vers des sites tiers
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Empêcher l'accès aux APIs sensibles du navigateur
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          {
            // Forcer HTTPS
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            // Content Security Policy — restreindre les sources de contenu
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // Next.js a besoin de unsafe-eval en dev
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self'",
              "connect-src 'self' https://api.smileidentity.com https://sandbox-api.fedapay.com https://api.fedapay.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
};

export default nextConfig;
