import { YesNoBadge } from './YesNo'
import { aed } from '../constants'
import { slug } from './ClientForm'

const StatusBadge = ({ value }) => value ? <span className={`status-badge ${slug(value)}`}>{value}</span> : <span className="pill none">—</span>
const text = (v) => (v == null || v === '' ? <span className="muted">—</span> : v)

// Column sets per tab
export const COLUMNS = {
  clients: [
    { key: 'name', label: 'Name', render: c => <strong>{text(c.name)}</strong> },
    { key: 'phone', label: 'Phone', render: c => text(c.phone) },
    { key: 'email', label: 'Email', render: c => text(c.email) },
    { key: 'source', label: 'Source', render: c => text(c.source) },
    { key: 'service', label: 'Service', render: c => text(c.service) },
    { key: 'proposal', label: 'Proposal', yn: true },
    { key: 'payment', label: 'Payment', yn: true },
    { key: 'lease_agreement', label: 'Lease', yn: true },
    { key: 'access_rp', label: 'AccessRP', yn: true },
    { key: 'kyc', label: 'KYC', yn: true },
    { key: 'license', label: 'License', yn: true },
    { key: 'tawtheeq', label: 'Tawtheeq', yn: true },
    { key: 'referral_name', label: 'Referral', render: c => text(c.referral_name) },
    { key: 'referral_percent', label: '% Fee', render: c => c.referral_percent != null ? `${c.referral_percent}%` : text(null) },
    { key: 'referral_amount', label: 'Amount', render: c => c.referral_amount ? aed(c.referral_amount) : text(null) },
    { key: 'status', label: 'Status', render: c => <StatusBadge value={c.status} /> },
  ],
  closed: [
    { key: 'name', label: 'Name', render: c => <strong>{text(c.name)}</strong> },
    { key: 'phone', label: 'Phone', render: c => text(c.phone) },
    { key: 'source', label: 'Source', render: c => text(c.source) },
    { key: 'service', label: 'Service', render: c => text(c.service) },
    { key: 'kyc', label: 'KYC', yn: true },
    { key: 'lease_agreement', label: 'Lease Agreement', yn: true },
    { key: 'license', label: 'License', yn: true },
    { key: 'tawtheeq', label: 'Tawtheeq', yn: true },
  ],
  referral: [
    { key: 'name', label: 'Name', render: c => <strong>{text(c.name)}</strong> },
    { key: 'phone', label: 'Phone', render: c => text(c.phone) },
    { key: 'source', label: 'Source', render: c => text(c.source) },
    { key: 'service', label: 'Service', render: c => text(c.service) },
    { key: 'referral_name', label: 'Referral Name', render: c => text(c.referral_name) },
    { key: 'referral_percent', label: '% Fee', render: c => c.referral_percent != null ? `${c.referral_percent}%` : text(null) },
    { key: 'referral_amount', label: 'Amount', render: c => aed(c.referral_amount) },
    { key: 'status', label: 'Status', render: c => c.status === 'Closed'
        ? <span className="status-badge closed">Closed</span>
        : <span className="status-badge pending-payment">Pending</span> },
  ],
}

export default function ClientTable({ tab, rows, onEdit, onDelete }) {
  const cols = COLUMNS[tab]
  if (!rows.length) return <div className="empty">No clients here yet.</div>

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{cols.map(c => <th key={c.key}>{c.label}</th>)}<th className="actions-col">Actions</th></tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              {cols.map(c => (
                <td key={c.key} data-label={c.label}>
                  {c.yn ? <YesNoBadge value={row[c.key]} /> : c.render(row)}
                </td>
              ))}
              <td className="actions-col">
                <button className="btn small" onClick={() => onEdit(row)}>Edit</button>
                <button className="btn small danger" onClick={() => onDelete(row)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
