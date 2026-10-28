import { useEffect, useMemo, useState, useCallback } from 'react'
import { supabase, supabaseConfigured } from './supabaseClient'
import { isReferral, aed, STATUSES, CLOSED_STATUSES, closedLabel } from './constants'
import Login from './components/Login'
import ClientForm from './components/ClientForm'
import ClientTable from './components/ClientTable'

const TABS = [
  { id: 'clients', label: 'Clients', hint: 'Every lead and client' },
  { id: 'closed', label: 'Closed Clients', hint: 'Status = Closed' },
  { id: 'referral', label: 'Referral Clients', hint: 'Referral + Closed' },
]

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    if (!supabaseConfigured) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!supabaseConfigured) return (
    <div className="login-wrap"><div className="login-card">
      <h1>Setup needed</h1>
      <p className="muted">Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to a <code>.env</code> file, then restart.</p>
    </div></div>
  )
  if (session === undefined) return <div className="loading">Loading…</div>
  if (!session) return <Login />
  return <CRM user={session.user} />
}

function CRM({ user }) {
  const [tab, setTab] = useState(null)       // null = home
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // {} for new, row for edit
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    if (error) setError(error.message); else { setClients(data); setError('') }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const groups = useMemo(() => ({
    clients,
    closed: clients.filter(c => c.status === 'Closed'),
    referral: clients.filter(isReferral),
  }), [clients])

  const rows = useMemo(() => {
    if (!tab) return []
    const q = search.trim().toLowerCase()
    return groups[tab].filter(c =>
      (statusFilter === 'All' || (tab === 'clients' ? c.status : closedLabel(c)) === statusFilter) &&
      (!q || [c.name, c.company_name, c.phone, c.email, c.referral_name, c.service, c.source, c.desk_number].some(v => v && v.toLowerCase().includes(q)))
    )
  }, [groups, tab, search, statusFilter])

  // Desks already given to other clients (shown grey in the desk list)
  const takenDesks = useMemo(() => new Set(
    clients.filter(c => c.desk_number && c.id !== editing?.id).map(c => c.desk_number)
  ), [clients, editing])

  // Which form to open: new / Clients-tab edit / Closed-tab edit
  const formMode = !editing?.id ? 'new' : (tab === 'closed' || tab === 'referral') ? 'closed' : 'lead'

  const save = async (payload) => {
    const q = editing?.id
      ? supabase.from('clients').update(payload).eq('id', editing.id)
      : supabase.from('clients').insert(payload)
    const { error } = await q
    if (error) return error.message
    setEditing(null)
    await load()
    return null
  }

  const remove = async (row) => {
    if (!confirm(`Delete ${row.company_name || row.name || 'this client'}? This cannot be undone.`)) return
    const { error } = await supabase.from('clients').delete().eq('id', row.id)
    if (error) alert(error.message); else load()
  }

  const referralTotal = groups.referral.reduce((s, c) => s + Number(c.referral_amount || 0), 0)
  const stats = { clients: groups.clients.length, closed: groups.closed.length, referral: groups.referral.length }
  const openTab = (id) => { setTab(id); setSearch(''); setStatusFilter('All') }

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => setTab(null)}>
          <span className="brand-mark sm">A</span>
          <span><strong>Aegis</strong> CRM</span>
        </button>
        <div className="topbar-right">
          <button className="btn primary" onClick={() => setEditing({})}>+ New client</button>
          <span className="user muted">{user.email}</span>
          <button className="btn ghost" onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </header>

      <main className="container">
        {error && <div className="error">Couldn't load clients: {error}</div>}

        {!tab ? (
          <>
            <h1 className="page-title">Dashboard</h1>
            <div className="cards">
              {TABS.map(t => (
                <button key={t.id} className={`home-card ${t.id}`} onClick={() => openTab(t.id)}>
                  <span className="home-card-label">{t.label}</span>
                  <span className="home-card-num">{loading ? '…' : stats[t.id]}</span>
                  <span className="muted">{t.id === 'referral' && !loading ? `Fees: ${aed(referralTotal)}` : t.hint}</span>
                  <span className="home-card-go">Open →</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <nav className="tabs">
              <button className="tab back" onClick={() => setTab(null)}>← Home</button>
              {TABS.map(t => (
                <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => openTab(t.id)}>
                  {t.label} <span className="count">{stats[t.id]}</span>
                </button>
              ))}
            </nav>

            <div className="toolbar">
              <input className="search" placeholder="Search company, name, phone, email, desk…" value={search} onChange={e => setSearch(e.target.value)} />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option>All</option>{(tab === 'clients' ? STATUSES : CLOSED_STATUSES).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {loading ? <div className="empty">Loading…</div>
              : <ClientTable key={tab} tab={tab} rows={rows} onEdit={setEditing} onDelete={remove} />}
          </>
        )}
      </main>

      {editing && <ClientForm initial={editing} mode={formMode} takenDesks={takenDesks} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  )
}
