export const SOURCES = ['Web', 'Walk-in', 'WhatsApp', 'Email', 'Referral']
export const SERVICES = ['Dedicated Desk', 'Flexi Desk', 'Private Office', 'Virtual Office', 'Meeting Room', 'Day Pass']
export const PAYMENT_PLANS = ['Annual', 'Bi-annual', 'Quarterly', 'Monthly']

// Main status buttons (Clients tab)
export const STATUSES = ['None', 'Proposal Sent', 'Follow-up', 'Closed']

// Clicking a main status button switches these to Yes
export const STATUS_SETS = {
  'Proposal Sent': { proposal: true },
  'Follow-up': { proposal: true },
}

// Closed Client Status: Yes/No items, with the closed status each one gives
export const YES_NO_FIELDS = [
  { key: 'proposal', label: 'Proposal', status: 'Proposal Sent' },
  { key: 'payment', label: 'Payment', status: 'Payment Done' },
  { key: 'lease_agreement', label: 'Lease Agreement', status: 'Lease Signed' },
  { key: 'access_rp', label: 'AccessRP Registered', status: 'AccessRP Registered' },
  { key: 'kyc', label: 'KYC', status: 'KYC Done' },
  { key: 'license', label: 'License', status: 'License Done' },
  { key: 'tawtheeq', label: 'Tawtheeq', status: 'Tawtheeq Done' },
]
export const ALL_DONE = 'Onboarding Complete'
export const CLOSED_STATUSES = ['Closed', ...YES_NO_FIELDS.map(f => f.status), ALL_DONE]

// Switching a Closed Client Status item works out the closed status:
// all items Yes -> Onboarding Complete; item set to Yes -> its status;
// item set to No -> status of the last item still Yes, otherwise nothing.
export const closedStatusFrom = (changedKey, value, form) => {
  if (YES_NO_FIELDS.every(f => form[f.key] === true)) return ALL_DONE
  if (value === true) return YES_NO_FIELDS.find(f => f.key === changedKey).status
  const lastYes = [...YES_NO_FIELDS].reverse().find(f => form[f.key] === true)
  return lastYes ? lastYes.status : null
}

// Status shown for a closed client
export const closedLabel = (c) => c.closed_status || 'Closed'

// Desk numbers 3812-A-001 … 3812-A-3000
export const DESKS = Array.from({ length: 3000 }, (_, i) => `3812-A-${String(i + 1).padStart(3, '0')}`)

const today = () => new Date().toISOString().slice(0, 10)

export const EMPTY_CLIENT = () => ({
  name: '', company_name: '', phone: '', email: '', source: '', service: '',
  client_date: today(),
  proposal: null, payment: null, lease_agreement: null, access_rp: null,
  kyc: null, license: null, tawtheeq: null, desk_allocated: null,
  desk_number: '', payment_plan: '', lease_amount: '',
  deal_value: '', referral_name: '', referral_percent: '',
  status: 'None', closed_status: null, notes: '',
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
