import { useEffect, useRef, useState } from 'react'
import { DESKS } from '../constants'

// Desk Number picker: click -> shows "3812" -> click 3812 -> shows A-001 … A-3000
export default function DeskPicker({ value, onChange, takenDesks }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState('unit')   // 'unit' or 'desks'
  const [q, setQ] = useState('')
  const box = useRef(null)

  // close when clicking outside
  useEffect(() => {
    const close = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const toggle = () => { setOpen(o => !o); setStep('unit'); setQ('') }
  const pick = (d) => { onChange(d); setOpen(false) }
  const short = (d) => d.replace('3812-', '')
  const list = DESKS.filter(d => !q || short(d).toLowerCase().includes(q.trim().toLowerCase()))

  return (
    <div className="desk-picker" ref={box}>
      <button type="button" className="desk-trigger" onClick={toggle}>
        <span className={value ? '' : 'muted'}>{value ? `3812 · ${short(value)}` : 'Select desk'}</span>
        <span className="caret">▾</span>
      </button>

      {open && (
        <div className="desk-menu">
          {step === 'unit' ? (
            <>
              <button type="button" className="desk-item unit" onClick={() => setStep('desks')}>
                <span>3812</span><span className="muted">›</span>
              </button>
              {value && <button type="button" className="desk-item clear" onClick={() => pick('')}>Remove desk</button>}
            </>
          ) : (
            <>
              <div className="desk-head">
                <button type="button" className="desk-back" onClick={() => setStep('unit')}>‹ 3812</button>
                <input autoFocus placeholder="Search e.g. 045" value={q} onChange={e => setQ(e.target.value)} />
              </div>
              <div className="desk-list">
                {list.map(d => {
                  const owner = takenDesks.get(d)
                  return (
                    <button type="button" key={d} disabled={!!owner}
                      className={`desk-item ${owner ? 'taken' : ''} ${value === d ? 'selected' : ''}`}
                      onClick={() => pick(d)}>
                      <span>{short(d)}</span>
                      {owner && <span className="desk-owner">{owner} (allocated)</span>}
                    </button>
                  )
                })}
                {!list.length && <div className="desk-empty">No desk found</div>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
