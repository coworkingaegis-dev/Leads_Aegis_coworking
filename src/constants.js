export const SOURCES = ['Web', 'Walk-in', 'WhatsApp', 'Email', 'Referral']
export const SERVICES = ['Dedicated Desk', 'Flexi Desk', 'Private Office', 'Virtual Office', 'Meeting Room', 'Day Pass']
export const PAYMENT_PLANS = ['Annual', 'Bi-annual', 'Quarterly', 'Monthly']

// Main status buttons (Clients tab)
export const STATUSES = ['None', 'Follow-up', 'Closed', 'Lost']

// Closed Client Status: Yes/No items, with the closed status each one gives
// (Onboarding Complete is last so it sits below License in the 2-column grid)
export const ALL_DONE = 'Onboarding Complete'
// Order: Paid, KYC, Lease, License, AccessRP, Tawtheeq, Onboarding Complete
export const YES_NO_FIELDS = [
    { key: 'payment', label: 'Payment', status: 'Paid' },
  { key: 'kyc', label: 'KYC', status: 'KYC' },
  { key: 'lease_agreement', label: 'Lease Agreement', status: 'Lease' },
  { key: 'license', label: 'License', status: 'Licensed' },
  { key: 'access_rp', label: 'AccessRP Registered', status: 'AccessRP' },
  { key: 'tawtheeq', label: 'Tawtheeq', status: 'Tawtheeq' },
  { key: 'onboarding_complete', label: 'Onboarding Complete', status: ALL_DONE },
]
export const CLOSED_STATUSES = ['None', ...YES_NO_FIELDS.map(f => f.status)]

// Works out the closed status after switching an item:
// - Onboarding Complete = Yes      -> "Onboarding Complete" (only when you click it)
// - an item switched to Yes        -> that item's status (e.g. KYC -> "KYC Done")
// - an item switched to No         -> status of the last item still Yes, otherwise None
export const closedStatusFrom = (changedKey, value, form) => {
  if (form.onboarding_complete === true) return ALL_DONE
  if (value === true) return YES_NO_FIELDS.find(f => f.key === changedKey).status
  const lastYes = [...YES_NO_FIELDS].reverse().find(f => form[f.key] === true)
  return lastYes ? lastYes.status : null
}

// Status shown for a closed client (None until something is done in the Closed tab)
export const closedLabel = (c) => c.closed_status || 'None'

// Status shown on the Referral tab
export const REFERRAL_STATUSES = ['Payment Paid', 'Payment Unpaid']
// Separate from the Closed Client Status "Payment" item
export const paymentLabel = (c) => (c.referral_paid === true ? 'Payment Paid' : 'Payment Unpaid')

// Desk numbers 3812-A-001 … 3812-A-3000
export const DESKS = Array.from({ length: 3000 }, (_, i) => `3812-A-D${String(i + 1).padStart(2, '0')}`)

const today = () => new Date().toISOString().slice(0, 10)

export const EMPTY_CLIENT = () => ({
  name: '', company_name: '', phone: '', email: '', source: '', service: '',
  client_date: today(),
  proposal: null, payment: null, lease_agreement: null, access_rp: null,
  kyc: null, license: null, tawtheeq: null, onboarding_complete: null,
  desk_number: '', payment_plan: '', lease_amount: '',
  deal_value: '', referral_name: '', referral_percent: '',
  status: 'None', closed_status: null, referral_paid: null, notes: '',
})

export const calcReferralAmount = (value, pct) => {
  const v = parseFloat(value), p = parseFloat(pct)
  if (isNaN(v) || isNaN(p)) return 0
  return Math.round(v * p) / 100
}

export const aed = (n) =>
  n == null || n === '' ? '—' : 'AED ' + Number(n).toLocaleString('en-AE', { maximumFractionDigits: 2 })

export const formatDate = (d) =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''

// Referral tab: came through a referral AND is closed
export const isReferral = (c) =>
  c.status === 'Closed' &&
  (c.source === 'Referral' || (c.referral_name && c.referral_name.trim() !== ''))
