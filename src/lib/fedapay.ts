const FEDAPAY_SECRET_KEY = process.env.FEDAPAY_SECRET_KEY || ''
const FEDAPAY_BASE_URL = 'https://sandbox-api.fedapay.com/v1'

interface CreateTransactionParams {
  amount: number
  description: string
  currency: string
  callbackUrl: string
  customerEmail: string
  customerPhone?: string
}

interface FedaPayTransaction {
  id: number
  reference: string
  amount: number
  status: string
  token?: string
  url?: string
}

async function fedapayRequest(endpoint: string, method: string, body?: any) {
  const res = await fetch(`${FEDAPAY_BASE_URL}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${FEDAPAY_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`FedaPay API error: ${res.status} - ${error}`)
  }

  return res.json()
}

export async function createTransaction(
  params: CreateTransactionParams
): Promise<FedaPayTransaction> {
  const data = await fedapayRequest('/transactions', 'POST', {
    description: params.description,
    amount: params.amount,
    currency: { iso: params.currency || 'XOF' },
    callback_url: params.callbackUrl,
    customer: {
      email: params.customerEmail,
      phone_number: params.customerPhone ? { number: params.customerPhone } : undefined,
    },
  })

  return {
    id: data.v1.transaction.id,
    reference: data.v1.transaction.reference,
    amount: data.v1.transaction.amount,
    status: data.v1.transaction.status,
  }
}

export async function generatePaymentToken(transactionId: number): Promise<{ token: string; url: string }> {
  const data = await fedapayRequest(`/transactions/${transactionId}/token`, 'POST', {})
  return {
    token: data.token,
    url: data.url,
  }
}

export async function getTransaction(transactionId: number): Promise<FedaPayTransaction> {
  const data = await fedapayRequest(`/transactions/${transactionId}`, 'GET')
  return {
    id: data.v1.transaction.id,
    reference: data.v1.transaction.reference,
    amount: data.v1.transaction.amount,
    status: data.v1.transaction.status,
  }
}
