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
