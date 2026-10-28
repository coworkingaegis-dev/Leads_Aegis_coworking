import { useEffect, useMemo, useState, useCallback } from 'react'
import { supabase, supabaseConfigured } from './supabaseClient'
import { isReferral, aed, STATUSES, CLOSED_STATUSES, REFERRAL_STATUSES, SOURCES, SERVICES, closedLabel, paymentLabel } from './constants'

// Status shown / filtered on each tab
const statusOf = (tab, c) => tab === 'clients' ? c.status : tab === 'referral' ? paymentLabel(c) : closedLabel(c)
const statusOptions = (tab) => tab === 'clients' ? STATUSES : tab === 'referral' ? REFERRAL_STATUSES : CLOSED_STATUSES
import Login from './components/Login'
import ClientForm, { slug } from './components/ClientForm'
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
  const [sourceFilter, setSourceFilter] = useState('All')
  const [serviceFilter, setServiceFilter] = useState('All')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort, setSort] = useState({ key: 'client_date', dir: 'desc' })

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

  // Clients on this tab after search / source / service / date (but not status)
  const baseRows = useMemo(() => {
    if (!tab) return []
    const q = search.trim().toLowerCase()
    return groups[tab].filter(c =>
      (sourceFilter === 'All' || c.source === sourceFilter) &&
      (serviceFilter === 'All' || c.service === serviceFilter) &&
      (!dateFrom || (c.client_date && c.client_date >= dateFrom)) &&
      (!dateTo || (c.client_date && c.client_date <= dateTo)) &&
      (!q || [c.name, c.company_name, c.phone, c.email, c.referral_name, c.service, c.source, c.desk_number].some(v => v && v.toLowerCase().includes(q)))
    )
  }, [groups, tab, search, sourceFilter, serviceFilter, dateFrom, dateTo])

  // Apply the status picked in the side panel
  const rows = useMemo(() =>
    statusFilter === 'All' ? baseRows : baseRows.filter(c => statusOf(tab, c) === statusFilter)
  , [baseRows, statusFilter, tab])

  // Count per status for the side panel
  const statusCounts = useMemo(() => {
    const counts = {}
    baseRows.forEach(c => { const s = statusOf(tab, c); counts[s] = (counts[s] || 0) + 1 })
    return counts
  }, [baseRows, tab])

  // Desks already given to other clients (shown grey in the desk list)
  const takenDesks = useMemo(() => new Map(
    clients.filter(c => c.desk_number && c.id !== editing?.id)
      .map(c => [c.desk_number, c.company_name || c.name || 'another client'])
  ), [clients, editing])

  // Which form to open: new / Clients-tab edit / Closed-tab edit
  const formMode = !editing?.id ? 'new' : tab === 'closed' ? 'closed' : tab === 'referral' ? 'referral' : 'lead'

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
  const clearFilters = () => {
    setSearch(''); setStatusFilter('All'); setSourceFilter('All'); setServiceFilter('All'); setDateFrom(''); setDateTo('')
  }
  const openTab = (id) => { setTab(id); clearFilters(); setSort({ key: 'client_date', dir: 'desc' }) }
  const filtersOn = search || statusFilter !== 'All' || sourceFilter !== 'All' || serviceFilter !== 'All' || dateFrom || dateTo

  // "Sort by" dropdown choices
  const statusKey = tab === 'clients' ? 'status' : tab === 'referral' ? 'payment_status' : 'closed_status'
  const SORT_OPTIONS = [
    ['client_date:desc', 'Newest first'],
    ['client_date:asc', 'Oldest first'],
    ['company_name:asc', 'Company A → Z'],
    ['company_name:desc', 'Company Z → A'],
    [`${statusKey}:asc`, 'Status'],
    ['source:asc', 'Source'],
    ['service:asc', 'Service'],
  ]
  const sortValue = `${sort.key}:${sort.dir}`
  const pickSort = (v) => { const [key, dir] = v.split(':'); setSort({ key, dir }) }

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
              <label className="tool">Sort by
                <select value={sortValue} onChange={e => pickSort(e.target.value)}>
                  {!SORT_OPTIONS.some(o => o[0] === sortValue) && <option value={sortValue}>Custom (column)</option>}
                  {SORT_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </label>
            </div>

            <div className="toolbar filters">
              <label className="tool">Source
                <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
                  <option>All</option>{SOURCES.map(s => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="tool">Service
                <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)}>
                  <option>All</option>{SERVICES.map(s => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="tool">From
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </label>
              <label className="tool">To
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </label>
              {filtersOn && <button className="btn small clear" onClick={clearFilters}>Clear filters</button>}
              <span className="muted result-count">{rows.length} {rows.length === 1 ? 'client' : 'clients'}</span>
            </div>

            <div className="tab-layout">
              {/* Status side panel */}
              <aside className="status-panel">
                <h4>Status</h4>
                <button className={`status-row ${statusFilter === 'All' ? 'active' : ''}`} onClick={() => setStatusFilter('All')}>
                  <span>All</span><span className="status-count">{baseRows.length}</span>
                </button>
                {statusOptions(tab).map(s => (
                  <button key={s} className={`status-row ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                    <span><span className={`dot ${slug(s)}`} />{s}</span>
                    <span className="status-count">{statusCounts[s] || 0}</span>
                  </button>
                ))}
              </aside>

              <div className="tab-main">
                {loading ? <div className="empty">Loading…</div>
                  : <ClientTable tab={tab} rows={rows} sort={sort} onSort={setSort} onEdit={setEditing} onDelete={remove} />}
              </div>
            </div>
          </>
        )}
      </main>

      {editing && <ClientForm initial={editing} mode={formMode} takenDesks={takenDesks} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  )
}
