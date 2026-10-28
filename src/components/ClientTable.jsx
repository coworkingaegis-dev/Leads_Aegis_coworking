import { useMemo } from 'react'
import { slug } from './ClientForm'
import { closedLabel, paymentLabel, formatDate } from '../constants'

const Badge = ({ value, step }) => value
  ? <span className={`status-badge ${slug(value)} ${step ? 'step' : ''}`}>{value}</span>
  : <span className="pill none">—</span>
const text = (v) => (v == null || v === '' ? <span className="muted">—</span> : v)

// Same columns on every tab; Status shows the Closed Client Status on Closed / Referral tabs
const columnsFor = (tab) => [
  { key: 'client_date', label: 'Date', value: c => c.client_date || '', render: c => text(formatDate(c.client_date)) },
  { key: 'company_name', label: 'Company Name', value: c => c.company_name, render: c => <strong>{text(c.company_name)}</strong> },
  { key: 'email', label: 'Email', value: c => c.email, render: c => text(c.email) },
  { key: 'phone', label: 'Phone Number', value: c => c.phone, render: c => text(c.phone) },
  { key: 'source', label: 'Source', value: c => c.source, render: c => text(c.source) },
  { key: 'service', label: 'Service', value: c => c.service, render: c => text(c.service) },
  tab === 'clients'
    ? { key: 'status', label: 'Status', value: c => c.status, render: c => <Badge value={c.status} /> }
    : tab === 'referral'
      ? { key: 'payment_status', label: 'Status', value: paymentLabel, render: c => <Badge value={paymentLabel(c)} /> }
      : { key: 'closed_status', label: 'Status', value: closedLabel, render: c => <Badge value={closedLabel(c)} step={!!c.closed_status} /> },
]

export default function ClientTable({ tab, rows, sort, onSort, onEdit, onDelete }) {
  const cols = columnsFor(tab)

  const sorted = useMemo(() => {
    const col = cols.find(c => c.key === sort.key) || cols[0]
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const x = (col.value(a) || '').toString().toLowerCase()
      const y = (col.value(b) || '').toString().toLowerCase()
      if (!x && y) return 1          // empty values always last
      if (x && !y) return -1
      return x.localeCompare(y, undefined, { numeric: true }) * dir
    })
  }, [rows, sort, tab]) // eslint-disable-line react-hooks/exhaustive-deps

  const clickHeader = (key) =>
    onSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })

  if (!rows.length) return <div className="empty">No clients here yet.</div>

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {cols.map(c => (
              <th key={c.key} className="sortable" onClick={() => clickHeader(c.key)}>
                {c.label}
                <span className="sort-arrow">{sort.key === c.key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ' ↕'}</span>
              </th>
            ))}
            <th className="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(row => (
            <tr key={row.id}>
              {cols.map(c => <td key={c.key} data-label={c.label}>{c.render(row)}</td>)}
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
