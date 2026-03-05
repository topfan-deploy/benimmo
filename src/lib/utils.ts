import { randomBytes } from 'crypto'

export function generateConfirmationCode(): string {
  // Code alphanumérique de 12 caractères (majuscules + chiffres)
  // Espace de recherche : 36^12 = ~4.7 quadrillions de combinaisons (anti brute-force)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Sans I/O/0/1 pour éviter les confusions
  const bytes = randomBytes(12)
  let code = ''
  for (let i = 0; i < 12; i++) {
    code += chars[bytes[i] % chars.length]
  }
  return code
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA'
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatPriceType(type: string): string {
  const labels: Record<string, string> = {
    DAILY: '/jour',
    MONTHLY: '/mois',
    YEARLY: '/an',
  }
  return labels[type] || ''
}

export function formatPropertyType(type: string): string {
  const labels: Record<string, string> = {
    APARTMENT: 'Appartement',
    HOUSE: 'Maison',
    STUDIO: 'Studio',
    VILLA: 'Villa',
  }
  return labels[type] || type
}

export function formatStatus(status: string): string {
  const labels: Record<string, string> = {
    PENDING_REVIEW: 'En attente de vérification',
    ACTIVE: 'Active',
    REJECTED: 'Rejetée',
    RENTED: 'Louée',
    PENDING: 'En attente',
    CONFIRMED: 'Confirmé',
    CANCELLED: 'Annulé',
    COMPLETED: 'Terminé',
    SUCCESS: 'Réussi',
    FAILED: 'Échoué',
    APPROVED: 'Approuvé',
    VERIFIED: 'Vérifié',
  }
  return labels[status] || status
}

export const BENIN_CITIES = [
  'Cotonou',
  'Porto-Novo',
  'Parakou',
  'Abomey-Calavi',
  'Djougou',
  'Bohicon',
  'Natitingou',
  'Savè',
  'Kandi',
  'Ouidah',
  'Lokossa',
  'Dogbo',
  'Abomey',
  'Nikki',
  'Malanville',
]
