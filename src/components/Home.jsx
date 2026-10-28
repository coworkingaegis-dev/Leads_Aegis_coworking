import { aed, closedLabel, paymentLabel, ALL_DONE } from '../constants'

export const BUSINESS_NAME = 'AEGIS Coworking Business Center LTD'

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

const todayLabel = () =>
  new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

// Simple line icons
const Icon = ({ name }) => {
  const paths = {
    clients: <><circle cx="9" cy="8" r="3.2" /><path d="M3 19c.6-3.3 3-5 6-5s5.4 1.7 6 5" /><circle cx="17" cy="9" r="2.4" /><path d="M16 14.2c2.6.2 4.4 1.8 5 4.8" /></>,
    closed: <><path d="M5 12.5l4.2 4.2L19 7" /><rect x="2.5" y="2.5" width="19" height="19" rx="5" /></>,
    referral: <><circle cx="6" cy="12" r="2.6" /><circle cx="18" cy="6" r="2.6" /><circle cx="18" cy="18" r="2.6" /><path d="M8.3 10.8l7.4-3.6M8.3 13.2l7.4 3.6" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
  }
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

export default function Home({ loading, groups, onOpen, onNew }) {
  const all = groups.clients
  const closed = groups.closed
  const referral = groups.referral

  const count = (list, fn) => list.filter(fn).length
  const followUps = count(all, c => c.status === 'Follow-up')
  const newLeads = count(all, c => c.status === 'None')
  const lost = count(all, c => c.status === 'Lost')
  const onboarded = count(closed, c => closedLabel(c) === ALL_DONE)
  const inOnboarding = closed.length - onboarded
  const refPaid = count(referral, c => paymentLabel(c) === 'Payment Paid')
  const refFees = referral.reduce((s, c) => s + Number(c.referral_amount || 0), 0)
  const refUnpaidFees = referral.filter(c => paymentLabel(c) !== 'Payment Paid')
    .reduce((s, c) => s + Number(c.referral_amount || 0), 0)
  const leaseTotal = closed.reduce((s, c) => s + Number(c.lease_amount || 0), 0)
  const desks = count(closed, c => c.desk_number)
  const conversion = all.length ? Math.round((closed.length / all.length) * 100) : 0

  const n = (v) => (loading ? '…' : v)

  const cards = [
    {
      id: 'clients', icon: 'clients', title: 'Clients', total: all.length,
      caption: 'Every lead and client',
      rows: [['New', newLeads], ['Follow-up', followUps], ['Closed', closed.length], ['Lost', lost]],
    },
    {
      id: 'closed', icon: 'closed', title: 'Closed Clients', total: closed.length,
      caption: 'Onboarding progress',
      rows: [['In onboarding', inOnboarding], ['Onboarding complete', onboarded], ['Desks allocated', desks], ['Lease value', aed(leaseTotal)]],
    },
    {
      id: 'referral', icon: 'referral', title: 'Referral Clients', total: referral.length,
      caption: 'Closed through a referral',
      rows: [['Payment paid', refPaid], ['Payment unpaid', referral.length - refPaid], ['Total fees', aed(refFees)], ['Fees outstanding', aed(refUnpaidFees)]],
    },
  ]

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow">Client Relationship Manager</span>
          <h1>{greeting()}</h1>
          <p className="hero-sub">{BUSINESS_NAME}</p>
          <p className="hero-meta">Addax Tower, Al Reem Island · ADGM, Abu Dhabi · {todayLabel()}</p>
          <button className="btn gold" onClick={onNew}><Icon name="plus" /> New client</button>
        </div>
        <div className="hero-logo">
          <img src="/aegis-logo.png" alt="Aegis Coworking logo" />
        </div>
      </section>

      {/* Key numbers */}
      <section className="kpis">
        <div className="kpi"><span className="kpi-num">{n(all.length)}</span><span className="kpi-label">Total clients</span></div>
        <div className="kpi"><span className="kpi-num">{n(followUps)}</span><span className="kpi-label">Follow-ups open</span></div>
        <div className="kpi"><span className="kpi-num">{n(closed.length)}</span><span className="kpi-label">Closed deals</span></div>
        <div className="kpi"><span className="kpi-num">{n(conversion + '%')}</span><span className="kpi-label">Conversion rate</span></div>
      </section>

      {/* Section cards */}
      <section className="sections">
        {cards.map(c => (
          <button key={c.id} className={`section-card ${c.id}`} onClick={() => onOpen(c.id)}>
            <div className="section-head">
              <span className="section-icon"><Icon name={c.icon} /></span>
              <span className="section-go">Open →</span>
            </div>
            <span className="section-title">{c.title}</span>
            <span className="section-total">{n(c.total)}</span>
            <span className="section-caption">{c.caption}</span>
            <ul className="section-rows">
              {c.rows.map(([label, value]) => (
                <li key={label}><span>{label}</span><strong>{n(value)}</strong></li>
              ))}
            </ul>
          </button>
        ))}
      </section>

      <footer className="home-foot">
        © {new Date().getFullYear()} {BUSINESS_NAME} · Internal use only
      </footer>
    </div>
  )
}
