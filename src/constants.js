export const SOURCES = ['Web', 'Walk-in', 'WhatsApp', 'Email', 'Referral']
export const SERVICES = ['Dedicated Desk', 'Flexi Desk', 'Private Office', 'Virtual Office', 'Meeting Room', 'Day Pass']
// All statuses (shown when editing)
export const STATUSES = ['None', 'Proposal Sent', 'Follow-up', 'Pending Payment', 'Closed', 'Lost']
// Statuses shown in the New Client form
export const NEW_STATUSES = ['None', 'Proposal Sent', 'Follow-up', 'Closed']

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

export const isReferral = (c) => c.source === 'Referral' || (c.referral_name && c.referral_name.trim() !== '')
