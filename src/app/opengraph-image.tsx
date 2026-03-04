import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'BenImmo - Plateforme Immobilière au Bénin'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 40,
          background: 'linear-gradient(135deg, #059669 0%, #065f46 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '40px',
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 'bold', marginBottom: 20 }}>
          🏠 BenImmo
        </div>
        <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 30 }}>
          Plateforme Immobilière au Bénin
        </div>
        <div style={{ fontSize: 24, opacity: 0.9, textAlign: 'center' }}>
          Location journalière, mensuelle, longue durée
        </div>
        <div style={{ fontSize: 24, opacity: 0.9, textAlign: 'center', marginTop: 10 }}>
          Annonces vérifiées • Paiement Mobile Money • Anti-arnaque
        </div>
        <div
          style={{
            marginTop: 40,
            background: 'white',
            color: '#059669',
            padding: '12px 40px',
            borderRadius: 12,
            fontSize: 28,
            fontWeight: 'bold',
          }}
        >
          benimmo.vercel.app
        </div>
      </div>
    ),
    { ...size }
  )
}
