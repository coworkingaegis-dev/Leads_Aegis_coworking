export const SOURCES = ['Web', 'Walk-in', 'WhatsApp', 'Email', 'Referral']
export const SERVICES = ['Dedicated Desk', 'Flexi Desk', 'Private Office', 'Virtual Office', 'Meeting Room', 'Day Pass']
export const STATUSES = ['None', 'Proposal Sent', 'Follow-up', 'Closed']

// When a status is clicked, these checklist fields switch to Yes
export const STATUS_SETS = {
  'Proposal Sent': { proposal: true },
  'Follow-up': { proposal: true },
  'Closed': { proposal: true, payment: true },
}

// When a checklist field is switched, work out the status from it
export const statusFromChecklist = (current, form) => {
  if (form.payment === true) return 'Closed'
  if (current === 'Closed') return form.proposal === true ? 'Proposal Sent' : 'None'
  if (form.proposal === true) return current === 'Follow-up' ? 'Follow-up' : 'Proposal Sent'
  return 'None'
}

// Yes/No fields, in form order
export const YES_NO_FIELDS = [
  { key: 'proposal', label: 'Proposal' },
  { key: 'payment', label: 'Payment' },
  { key: 'lease_agreement', label: 'Lease Agreement' },
  { key: 'access_rp', label: 'AccessRP Registered' },
  { key: 'kyc', label: 'KYC' },
  { key: 'license', label: 'License' },
  { key: 'tawtheeq', label: 'Tawtheeq' },
]

export const EMPTY_CLIENT = {
  name: '', phone: '', email: '', source: '', service: '',
  proposal: null, payment: null, lease_agreement: null, access_rp: null,
  kyc: null, license: null, tawtheeq: null,
  deal_value: '', referral_name: '', referral_percent: '',
  status: 'None', notes: '',
}

export const calcReferralAmount = (value, pct) => {
  const v = parseFloat(value), p = parseFloat(pct)
  if (isNaN(v) || isNaN(p)) return 0
  return Math.round(v * p) / 100
}

export const aed = (n) =>
  n == null || n === '' ? '—' : 'AED ' + Number(n).toLocaleString('en-AE', { maximumFractionDigits: 2 })

// Referral tab: came through a referral AND is closed
export const isReferral = (c) =>
  c.status === 'Closed' &&
  (c.source === 'Referral' || (c.referral_name && c.referral_name.trim() !== ''))
