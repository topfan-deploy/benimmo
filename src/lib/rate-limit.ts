// Rate limiter en mémoire pour protéger les endpoints critiques
// En production avec plusieurs instances, utiliser Redis à la place

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Nettoyage périodique des entrées expirées (toutes les 5 minutes)
setInterval(() => {
  const now = Date.now()
  store.forEach((entry, key) => {
    if (now > entry.resetAt) {
      store.delete(key)
    }
  })
}, 5 * 60 * 1000)

interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs })
    return { allowed: true, remaining: config.maxAttempts - 1, resetAt: now + config.windowMs }
  }

  entry.count++
  store.set(key, entry)

  if (entry.count > config.maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { allowed: true, remaining: config.maxAttempts - entry.count, resetAt: entry.resetAt }
}

// Extraire l'IP depuis les headers de la requête
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp
  return 'unknown'
}

// Configs prédéfinies
export const RATE_LIMITS = {
  // Login : 5 tentatives par 15 minutes
  LOGIN: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },
  // Handover : 5 tentatives par 30 minutes (anti brute-force)
  HANDOVER: { maxAttempts: 5, windowMs: 30 * 60 * 1000 },
  // Upload : 20 uploads par heure
  UPLOAD: { maxAttempts: 20, windowMs: 60 * 60 * 1000 },
  // API générale : 100 requêtes par minute
  GENERAL: { maxAttempts: 100, windowMs: 60 * 1000 },
  // Paiement : 10 par heure
  PAYMENT: { maxAttempts: 10, windowMs: 60 * 60 * 1000 },
  // Retrait : 3 par heure
  WITHDRAWAL: { maxAttempts: 3, windowMs: 60 * 60 * 1000 },
} as const
