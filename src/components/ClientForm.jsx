import { useState } from 'react'
import { SOURCES, SERVICES, STATUSES, YES_NO_FIELDS, EMPTY_CLIENT, calcReferralAmount, aed } from '../constants'
import { YesNoToggle } from './YesNo'

export default function ClientForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState({ ...EMPTY_CLIENT, ...cleanNulls(initial) })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const amount = calcReferralAmount(form.deal_value, form.referral_percent)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setError('')
    const payload = {
      name: form.name.trim() || null,
      phone: form.phone.trim() || null,
      source: form.source || null,
      service: form.service || null,
      status: form.status || null,
      referral_name: form.referral_name.trim() || null,
      deal_value: form.deal_value === '' ? null : Number(form.deal_value),
      referral_percent: form.referral_percent === '' ? null : Number(form.referral_percent),
      notes: form.notes.trim() || null,
    }
    YES_NO_FIELDS.forEach(f => { payload[f.key] = form[f.key] })
    const err = await onSave(payload)
    if (err) { setError(err); setBusy(false) }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="modal" onSubmit={submit} onMouseDown={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{initial?.id ? 'Edit client' : 'New client'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          <section>
            <h3>Client</h3>
            <div className="grid2">
              <label>Name<input value={form.name} onChange={e => set('name', e.target.value)} /></label>
              <label>Phone number<input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+971…" /></label>
              <label>Source
                <select value={form.source} onChange={e => set('source', e.target.value)}>
                  <option value="">—</option>{SOURCES.map(s => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label>Service
                <select value={form.service} onChange={e => set('service', e.target.value)}>
                  <option value="">—</option>{SERVICES.map(s => <option key={s}>{s}</option>)}
                </select>
              </label>
            </div>
          </section>

          <section>
            <h3>Checklist</h3>
            <div className="checklist">
              {YES_NO_FIELDS.map(f => (
                <div className="check-row" key={f.key}>
                  <span>{f.label}</span>
                  <YesNoToggle value={form[f.key]} onChange={v => set(f.key, v)} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3>Referral</h3>
            <div className="grid2">
              <label>Referral name<input value={form.referral_name} onChange={e => set('referral_name', e.target.value)} /></label>
              <label>Deal value (AED)<input type="number" min="0" step="0.01" value={form.deal_value} onChange={e => set('deal_value', e.target.value)} /></label>
              <label>Referral fee %<input type="number" min="0" max="100" step="0.01" value={form.referral_percent} onChange={e => set('referral_percent', e.target.value)} /></label>
              <label>Amount (auto)<input value={aed(amount)} readOnly className="readonly" /></label>
            </div>
          </section>

          <section>
            <h3>Status</h3>
            <div className="status-picker">
              {STATUSES.map(s => (
                <button type="button" key={s}
                  className={`status-chip ${slug(s)} ${form.status === s ? 'active' : ''}`}
                  onClick={() => set('status', s)}>{s}</button>
              ))}
            </div>
            <label style={{ marginTop: 12 }}>Notes<textarea rows="2" value={form.notes} onChange={e => set('notes', e.target.value)} /></label>
          </section>

          {error && <div className="error">{error}</div>}
        </div>

        <div className="modal-foot">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : 'Save client'}</button>
        </div>
      </form>
    </div>
  )
}

export const slug = (s) => (s || '').toLowerCase().replace(/[^a-z]+/g, '-')

function cleanNulls(obj = {}) {
  const out = { ...obj }
  ;['name', 'phone', 'source', 'service', 'referral_name', 'notes', 'status'].forEach(k => { if (out[k] == null) out[k] = k === 'status' ? 'Follow-up' : '' })
  ;['deal_value', 'referral_percent'].forEach(k => { if (out[k] == null) out[k] = '' })
  return out
}
