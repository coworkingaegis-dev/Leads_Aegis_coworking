import { useState } from 'react'
import {
  SOURCES, SERVICES, STATUSES, PAYMENT_PLANS, DESKS, YES_NO_FIELDS,
  EMPTY_CLIENT, closedStatusFrom, closedLabel, calcReferralAmount, aed,
} from '../constants'
import { YesNoToggle } from './YesNo'

/*
  mode:
   'new'    -> New client: basic details + main status
   'lead'   -> Edit from Clients tab: basic details + main status; Closed Client Status is grey (read-only)
   'closed'   -> Edit from Closed tab: basic details + Closed Client Status editable; main status hidden
   'referral' -> Edit from Referral tab: basic details + referral details + Payment Paid / Unpaid (separate)
*/
export default function ClientForm({ initial, mode, takenDesks, onSave, onClose }) {
  const [form, setForm] = useState({ ...EMPTY_CLIENT(), ...cleanNulls(initial) })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const isClosedMode = mode === 'closed'
  const isReferralMode = mode === 'referral'
  const locked = mode === 'lead'          // Closed Client Status greyed out

  const pickStatus = (s) => set('status', s)

  const setCheck = (k, v) => setForm(f => {
    const next = { ...f, [k]: v }
    next.closed_status = closedStatusFrom(k, v, next)
    return next
  })

  const pickDesk = (d) => set('desk_number', d)

  const amount = calcReferralAmount(form.deal_value, form.referral_percent)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setError('')
    const t = (v) => (v || '').trim() || null
    const num = (v) => (v === '' || v == null ? null : Number(v))

    const payload = {
      name: t(form.name),
      company_name: t(form.company_name),
      phone: t(form.phone),
      email: t(form.email),
      source: form.source || null,
      service: form.service || null,
      client_date: form.client_date || null,
    }

    if (isClosedMode) {
      YES_NO_FIELDS.forEach(f => { payload[f.key] = form[f.key] })
      payload.closed_status = form.closed_status
      payload.desk_number = form.desk_number || null
      payload.payment_plan = form.payment_plan || null
      payload.lease_amount = num(form.lease_amount)
      payload.referral_name = t(form.referral_name)
      payload.deal_value = num(form.deal_value)
      payload.referral_percent = num(form.referral_percent)
      payload.notes = t(form.notes)
    } else if (isReferralMode) {
      payload.referral_name = t(form.referral_name)
      payload.deal_value = num(form.deal_value)
      payload.referral_percent = num(form.referral_percent)
      payload.referral_paid = form.referral_paid
      payload.notes = t(form.notes)
        } else {
      payload.status = form.status || 'None'
      if (form.source === 'Referral') {
        payload.referral_name = t(form.referral_name)
        payload.deal_value = num(form.deal_value)
        payload.referral_percent = num(form.referral_percent)
      }
    }

    const err = await onSave(payload)
    if (err) {
      setError(err.includes('clients_desk_number_unique') ? 'That desk is already allocated to another client.' : err)
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="modal" onSubmit={submit} onMouseDown={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{mode === 'new' ? 'New client' : isClosedMode ? 'Edit closed client' : isReferralMode ? 'Edit referral client' : 'Edit client'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          {/* Basic details: always editable */}
          <section>
            <h3>Client</h3>
            <div className="grid2">
              <label>Individual Name<input value={form.name} onChange={e => set('name', e.target.value)} /></label>
              <label>Company Name<input value={form.company_name} onChange={e => set('company_name', e.target.value)} /></label>
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
              <label>Date<input type="date" value={form.client_date} onChange={e => set('client_date', e.target.value)} /></label>
            </div>
          </section>

          {/* Main status: New + Clients tab only */}
          {!isClosedMode && !isReferralMode && (
            <section>
              <h3>Status</h3>
              <div className="status-picker">
                {STATUSES.map(s => (
                  <button type="button" key={s}
                    className={`status-chip ${slug(s)} ${form.status === s ? 'active' : ''}`}
                    onClick={() => pickStatus(s)}>{s}</button>
                ))}
              </div>
            </section>
          )}

          {/* Closed Client Status: editable in Closed tab, grey in Clients tab, hidden for new + referral */}
          {(isClosedMode || locked) && (
            <section className={locked ? 'locked' : ''}>
              <h3>
                Closed Client Status
                <span className={`status-badge step ${slug(closedLabel(form))}`} style={{ marginLeft: 8, textTransform: 'none', letterSpacing: 0 }}>
                  {closedLabel(form)}
                </span>
              </h3>
              {locked && <p className="lock-note">Edit this from the Closed Clients tab.</p>}
              <fieldset disabled={locked} className="plain">
                <div className="checklist">
                  {YES_NO_FIELDS.map(f => (
                    <div className="check-row" key={f.key}>
                      <span>{f.label}</span>
                      <YesNoToggle value={form[f.key]} onChange={v => setCheck(f.key, v)} />
                    </div>
                  ))}
                </div>
                <div className="grid2" style={{ marginTop: 14 }}>
                  <label>Desk Number
                    <select value={form.desk_number} onChange={e => pickDesk(e.target.value)}>
                      <option value="">—</option>
                      {DESKS.map(d => {
                        const owner = takenDesks.get(d)
                        return <option key={d} value={d} disabled={!!owner}>{d}{owner ? ` — ${owner} (allocated)` : ''}</option>
                      })}
                    </select>
                  </label>
                  <label>Payment Plan
                    <select value={form.payment_plan} onChange={e => set('payment_plan', e.target.value)}>
                      <option value="">—</option>{PAYMENT_PLANS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </label>
                  <label>Lease Amount (AED)<input type="number" min="0" step="0.01" value={form.lease_amount} onChange={e => set('lease_amount', e.target.value)} /></label>
                </div>
              </fieldset>
            </section>
          )}

                   {/* Referral: Closed and Referral tabs, and New / Clients edit when Source = Referral */}
          {(isClosedMode || isReferralMode || form.source === 'Referral') && (
            <section>
              <h3>Referral</h3>
              <div className="grid2">
                <label>Referral name<input value={form.referral_name} onChange={e => set('referral_name', e.target.value)} /></label>
                <label>Deal value (AED)<input type="number" min="0" step="0.01" value={form.deal_value} onChange={e => set('deal_value', e.target.value)} /></label>
                <label>Referral fee %<input type="number" min="0" max="100" step="0.01" value={form.referral_percent} onChange={e => set('referral_percent', e.target.value)} /></label>
                <label>Amount (auto)<input value={aed(amount)} readOnly className="readonly" /></label>
              </div>
                           {(isClosedMode || isReferralMode) && (
                <label style={{ marginTop: 12 }}>Notes<textarea rows="2" value={form.notes} onChange={e => set('notes', e.target.value)} /></label>
              )}
            </section>
          )}

          {/* Referral payment status: Referral tab only, separate from Closed Client Status */}
          {isReferralMode && (
            <section>
              <h3>Referral Payment Status</h3>
              <div className="status-picker">
                <button type="button" className={`status-chip payment-paid ${form.referral_paid === true ? 'active' : ''}`}
                  onClick={() => set('referral_paid', true)}>Payment Paid</button>
                <button type="button" className={`status-chip payment-unpaid ${form.referral_paid !== true ? 'active' : ''}`}
                  onClick={() => set('referral_paid', false)}>Payment Unpaid</button>
              </div>
            </section>
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
  ;['name', 'company_name', 'phone', 'email', 'source', 'service', 'referral_name', 'notes',
    'desk_number', 'payment_plan', 'deal_value', 'referral_percent', 'lease_amount']
    .forEach(k => { if (out[k] == null) out[k] = '' })
  if (out.status == null) out.status = 'None'
  if (out.client_date == null) delete out.client_date
  return out
}
