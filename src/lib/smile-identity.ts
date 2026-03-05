const SMILE_API_KEY = process.env.SMILE_API_KEY || ''
const SMILE_PARTNER_ID = process.env.SMILE_PARTNER_ID || ''
const SMILE_BASE_URL = process.env.SMILE_BASE_URL || 'https://api.smileidentity.com/v1'

export const BENIN_ID_TYPES = [
  { value: 'DRIVERS_LICENSE', label: 'Permis de conduire' },
  { value: 'NATIONAL_ID', label: "Carte nationale d'identité (CNI)" },
  { value: 'PASSPORT', label: 'Passeport' },
  { value: 'RESIDENT_CARD', label: 'Carte de résident' },
  { value: 'VOTER_ID', label: "Carte d'électeur" },
  { value: 'TRAVEL_DOC', label: 'Document de voyage' },
] as const

export type BeninIdType = (typeof BENIN_ID_TYPES)[number]['value']

interface IdVerificationParams {
  idType: string
  idNumber: string
  firstName: string
  lastName: string
  country: string
}

interface SmileJobResult {
  jobId: string
  resultCode: string
  resultText: string
  actions: {
    Verify_ID_Number: string
    Return_Personal_Info: string
  }
  fullResult: any
}

async function smileRequest(endpoint: string, method: string, body?: any) {
  const res = await fetch(`${SMILE_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Smile Identity API error: ${res.status} - ${error}`)
  }

  return res.json()
}

export async function submitIdVerification(
  params: IdVerificationParams
): Promise<SmileJobResult> {
  if (!SMILE_API_KEY || !SMILE_PARTNER_ID) {
    throw new Error('Smile Identity non configuré (clés API manquantes)')
  }

  const data = await smileRequest('/id_verification', 'POST', {
    partner_id: SMILE_PARTNER_ID,
    api_key: SMILE_API_KEY,
    job_type: 5, // Enhanced KYC
    country: params.country || 'BJ',
    id_type: params.idType,
    id_number: params.idNumber,
    first_name: params.firstName,
    last_name: params.lastName,
    partner_params: {
      job_id: `benimmo_${Date.now()}`,
      user_id: `user_${Date.now()}`,
      job_type: 5,
    },
  })

  return {
    jobId: data.partner_params?.job_id || data.SmileJobID || '',
    resultCode: data.ResultCode || '',
    resultText: data.ResultText || '',
    actions: {
      Verify_ID_Number: data.Actions?.Verify_ID_Number || 'Not Applicable',
      Return_Personal_Info: data.Actions?.Return_Personal_Info || 'Not Applicable',
    },
    fullResult: data,
  }
}

export async function getJobStatus(jobId: string): Promise<SmileJobResult> {
  if (!SMILE_API_KEY || !SMILE_PARTNER_ID) {
    throw new Error('Smile Identity non configuré (clés API manquantes)')
  }

  const data = await smileRequest('/job_status', 'POST', {
    partner_id: SMILE_PARTNER_ID,
    api_key: SMILE_API_KEY,
    job_id: jobId,
  })

  return {
    jobId: data.partner_params?.job_id || jobId,
    resultCode: data.ResultCode || '',
    resultText: data.ResultText || '',
    actions: {
      Verify_ID_Number: data.Actions?.Verify_ID_Number || 'Not Applicable',
      Return_Personal_Info: data.Actions?.Return_Personal_Info || 'Not Applicable',
    },
    fullResult: data,
  }
}

export function isSmileConfigured(): boolean {
  return Boolean(SMILE_API_KEY && SMILE_PARTNER_ID)
}
