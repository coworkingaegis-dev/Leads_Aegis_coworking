export const SOURCES = ['Web', 'Walk-in', 'WhatsApp', 'Email', 'Referral']
export const SERVICES = ['Dedicated Desk', 'Flexi Desk', 'Private Office', 'Virtual Office', 'Meeting Room', 'Day Pass']
// Status buttons you can click
export const STATUSES = ['None', 'Proposal Sent', 'Follow-up', 'Closed']

// Yes/No checklist fields, in form order, with the status each one gives
export const YES_NO_FIELDS = [
  { key: 'proposal', label: 'Proposal', status: 'Proposal Sent' },
  { key: 'payment', label: 'Payment', status: 'Payment Done' },
  { key: 'lease_agreement', label: 'Lease Agreement', status: 'Lease Signed' },
  { key: 'access_rp', label: 'AccessRP Registered', status: 'AccessRP Registered' },
  { key: 'kyc', label: 'KYC', status: 'KYC Done' },
  { key: 'license', label: 'License', status: 'License Done' },
  { key: 'tawtheeq', label: 'Tawtheeq', status: 'Tawtheeq Done' },
]

// Every status a client can have (used for filters)
export const ALL_STATUSES = ['None', 'Proposal Sent', 'Follow-up',
  ...YES_NO_FIELDS.filter(f => f.key !== 'proposal').map(f => f.status), 'Closed']

export const isStepStatus = (s) => YES_NO_FIELDS.some(f => f.status === s && f.key !== 'proposal')

// Clicking a status button switches these checklist items to Yes
export const STATUS_SETS = {
  'Proposal Sent': { proposal: true },
  'Follow-up': { proposal: true },
  'Closed': Object.fromEntries(YES_NO_FIELDS.map(f => [f.key, true])),
}

// Switching a checklist item works out the new status:
// - all 7 items Yes             -> Closed
// - an item switched to Yes     -> that item's status (e.g. KYC -> "KYC Done")
// - an item switched to No      -> status of the last item still Yes, or None
export const statusFromChecklist = (changedKey, value, form) => {
  if (YES_NO_FIELDS.every(f => form[f.key] === true)) return 'Closed'
  if (value === true) return YES_NO_FIELDS.find(f => f.key === changedKey).status
  const lastYes = [...YES_NO_FIELDS].reverse().find(f => form[f.key] === true)
  return lastYes ? lastYes.status : 'None'
}

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
