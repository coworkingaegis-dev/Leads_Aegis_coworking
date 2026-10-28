// Three-state toggle: Yes / No / not set
export function YesNoToggle({ value, onChange }) {
  return (
    <div className="yesno">
      <button type="button" className={value === true ? 'on yes' : ''}
        onClick={() => onChange(value === true ? null : true)}>Yes</button>
      <button type="button" className={value === false ? 'on no' : ''}
        onClick={() => onChange(value === false ? null : false)}>No</button>
    </div>
  )
}

export function YesNoBadge({ value }) {
  if (value === true) return <span className="pill yes">Yes</span>
  if (value === false) return <span className="pill no">No</span>
  return <span className="pill none">—</span>
}
