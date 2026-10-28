import { slug } from './ClientForm'
import { isStepStatus } from '../constants'

const StatusBadge = ({ value }) => value
  ? <span className={`status-badge ${slug(value)} ${isStepStatus(value) ? 'step' : ''}`}>{value}</span>
  : <span className="pill none">—</span>
const text = (v) => (v == null || v === '' ? <span className="muted">—</span> : v)

// Same columns on every tab
const COLUMNS = [
  { key: 'name', label: 'Name', render: c => <strong>{text(c.name)}</strong> },
  { key: 'email', label: 'Email', render: c => text(c.email) },
  { key: 'phone', label: 'Phone Number', render: c => text(c.phone) },
  { key: 'source', label: 'Source', render: c => text(c.source) },
  { key: 'service', label: 'Service', render: c => text(c.service) },
  { key: 'status', label: 'Status', render: c => <StatusBadge value={c.status} /> },
]

export default function ClientTable({ rows, onEdit, onDelete }) {
  if (!rows.length) return <div className="empty">No clients here yet.</div>

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{COLUMNS.map(c => <th key={c.key}>{c.label}</th>)}<th className="actions-col">Actions</th></tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              {COLUMNS.map(c => <td key={c.key} data-label={c.label}>{c.render(row)}</td>)}
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
