import { useState } from 'react'
import { SOURCES, SERVICES, STATUSES, STATUS_SETS, statusFromChecklist, isStepStatus, YES_NO_FIELDS, EMPTY_CLIENT, calcReferralAmount, aed } from '../constants'
import { YesNoToggle } from './YesNo'

export default function ClientForm({ initial, onSave, onClose }) {
  const isNew = !initial?.id
  const [form, setForm] = useState({ ...EMPTY_CLIENT, ...cleanNulls(initial) })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Click a status -> matching checklist items become Yes
  const pickStatus = (s) => setForm(f => ({ ...f, status: s, ...(STATUS_SETS[s] || {}) }))

  // Switch any checklist item -> status updates to match (e.g. KYC Yes -> "KYC Done")
  const setCheck = (k, v) => setForm(f => {
    const next = { ...f, [k]: v }
    next.status = statusFromChecklist(k, v, next)
    return next
  })

  // Show the current step status (e.g. "KYC Done") as an extra highlighted button
  const statusButtons = isStepStatus(form.status) ? [...STATUSES.slice(0, -1), form.status, 'Closed'] : STATUSES

  const amount = calcReferralAmount(form.deal_value, form.referral_percent)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setError('')

    const payload = {
      name: form.name.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      source: form.source || null,
      service: form.service || null,
      status: form.status || 'None',
    }
    YES_NO_FIELDS.forEach(f => { payload[f.key] = form[f.key] })

    if (!isNew) {
      payload.referral_name = form.referral_name.trim() || null
      payload.deal_value = form.deal_value === '' ? null : Number(form.deal_value)
      payload.referral_percent = form.referral_percent === '' ? null : Number(form.referral_percent)
      payload.notes = form.notes.trim() || null
    }

    const err = await onSave(payload)
    if (err) { setError(err); setBusy(false) }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="modal" onSubmit={submit} onMouseDown={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{isNew ? 'New client' : 'Edit client'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          <section>
            <h3>Client</h3>
            <div className="grid2">
              <label>Name<input value={form.name} onChange={e => set('name', e.target.value)} /></label>
              <label>Phone number<input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+971…" /></label>
              <label>Email<input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="name@company.com" /></label>
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
            <h3>Status</h3>
            <div className="status-picker">
              {statusButtons.map(s => (
                <button type="button" key={s}
                  className={`status-chip ${slug(s)} ${form.status === s ? 'active' : ''}`}
                  onClick={() => pickStatus(s)}>{s}</button>
              ))}
            </div>
          </section>

          {!isNew && (
            <>
              <section>
                <h3>Current Status</h3>
                <div className="checklist">
                  {YES_NO_FIELDS.map(f => (
                    <div className="check-row" key={f.key}>
                      <span>{f.label}</span>
                      <YesNoToggle value={form[f.key]} onChange={v => setCheck(f.key, v)} />
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
                <label style={{ marginTop: 12 }}>Notes<textarea rows="2" value={form.notes} onChange={e => set('notes', e.target.value)} /></label>
              </section>
            </>
          )}

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
  ;['name', 'phone', 'email', 'source', 'service', 'referral_name', 'notes'].forEach(k => { if (out[k] == null) out[k] = '' })
  if (out.status == null) out.status = 'None'
  ;['deal_value', 'referral_percent'].forEach(k => { if (out[k] == null) out[k] = '' })
  return out
}
