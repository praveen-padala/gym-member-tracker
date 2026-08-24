import { useState, useEffect, useRef } from 'react'
import {
  LayoutDashboard, Users, BarChart2, Settings as SettingsIcon,
  ChevronUp, LogOut, Plus, UserPlus,
} from 'lucide-react'
import type { Member, Screen, GymSettings } from './types'
import { buildSeedMembers, DEFAULT_SETTINGS, STORAGE_KEY, SETTINGS_KEY } from './seedData'
import { Login } from './screens/Login'
import { Signup } from './screens/Signup'
import { Dashboard } from './screens/Dashboard'
import { Members } from './screens/Members'
import { Analytics } from './screens/Analytics'
import { AddMember } from './screens/AddMember'
import { Settings } from './screens/Settings'
import { getMemberStatus } from './utils'

export default function App() {
  const [hydrated, setHydrated] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [settings, setSettings] = useState<GymSettings>(DEFAULT_SETTINGS)
  const [screen, setScreen] = useState<Screen>('login')
  const [showAddMember, setShowAddMember] = useState(false)
  const [focusedMemberId, setFocusedMemberId] = useState<string | null>(null)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const storedSettings = localStorage.getItem(SETTINGS_KEY)
    const storedMembers = localStorage.getItem(STORAGE_KEY)
    if (storedSettings) {
      try { setSettings(JSON.parse(storedSettings) as GymSettings) } catch { /* */ }
    }
    if (storedMembers) {
      try { setMembers(JSON.parse(storedMembers) as Member[]) } catch { setMembers(buildSeedMembers()) }
    } else {
      setMembers(buildSeedMembers())
    }
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings) as GymSettings
        if (parsed.gymName) setScreen('dashboard')
      } catch { /* */ }
    }
    setHydrated(true)
  }, [])

  // Close account menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setShowAccountMenu(false)
      }
    }
    if (showAccountMenu) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showAccountMenu])

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(members))
  }, [members, hydrated])

  useEffect(() => {
    if (hydrated) localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings, hydrated])

  if (!hydrated) return null

  function handleLogout() {
    localStorage.removeItem(SETTINGS_KEY)
    setSettings(DEFAULT_SETTINGS)
    setScreen('login')
    setShowAccountMenu(false)
  }

  // ── Auth screens ──
  if (screen === 'login') {
    return (
      <Login
        onLogin={(gymName) => {
          setSettings((s) => ({ ...s, gymName }))
          setScreen('dashboard')
        }}
        onGoSignup={() => setScreen('signup')}
      />
    )
  }

  if (screen === 'signup') {
    return (
      <Signup
        onSignup={(newSettings) => {
          setSettings(newSettings)
          if (members.length === 0) setMembers(buildSeedMembers())
          setScreen('dashboard')
        }}
        onGoLogin={() => setScreen('login')}
      />
    )
  }

  // ── Main app ──
  const navItems: { key: Screen; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { key: 'members', label: 'Members', icon: <Users size={16} /> },
    { key: 'analytics', label: 'Analytics', icon: <BarChart2 size={16} /> },
    { key: 'settings', label: 'Settings', icon: <SettingsIcon size={16} /> },
  ]

  const attentionCount = members.filter((m) => {
    const s = getMemberStatus(m)
    return s === 'expiring' || s === 'expired'
  }).length

  function navigate(s: Screen) {
    if (s !== 'members') setFocusedMemberId(null)
    setScreen(s)
  }

  const ownerInitial = (settings.ownerName || settings.gymName || 'G')[0].toUpperCase()

  return (
    <div className="min-h-screen bg-app flex">

      {/* ══════════ DESKTOP SIDEBAR ══════════ */}
      <aside
        className="hidden md:flex flex-col w-[240px] flex-shrink-0 fixed top-0 left-0 h-screen z-20"
        style={{ background: 'linear-gradient(180deg,#1E1B4B 0%,#0F172A 100%)' }}
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="min-w-0">
            <p className="font-bold text-white text-sm truncate">{settings.gymName}</p>
            <p className="text-white/40 text-[10px] truncate">Gym Management</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto" aria-label="App sections">
          <p className="text-white/25 text-[10px] font-bold uppercase tracking-widest px-3 mb-2 mt-1">Menu</p>
          <ul className="space-y-0.5">
            {navItems.map((item, i) => {
              const isActive = screen === item.key
              return (
                <li key={item.key} className="animate-slide-in-left" style={{ animationDelay: `${i * 50}ms` }}>
                  <button
                    onClick={() => navigate(item.key)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 relative group ${
                      isActive ? 'text-white' : 'text-white/45 hover:text-white/75 hover:bg-white/6'
                    }`}
                    style={isActive ? { background: 'linear-gradient(135deg,rgba(99,102,241,0.35),rgba(168,85,247,0.25))' } : {}}
                  >
                    {/* Active left bar */}
                    {isActive && (
                      <div
                        className="absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-r-full"
                        style={{ background: 'linear-gradient(to bottom,#818CF8,#C084FC)' }}
                        aria-hidden="true"
                      />
                    )}
                    <span className="w-5 flex items-center justify-center flex-shrink-0" aria-hidden="true">{item.icon}</span>
                    {item.label}
                    {item.key === 'dashboard' && attentionCount > 0 && (
                      <span
                        className="ml-auto w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold text-white animate-pulse"
                        style={{ background: 'linear-gradient(135deg,#EF4444,#DC2626)' }}
                        aria-label={`${attentionCount} need attention`}
                      >
                        {attentionCount}
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Add member */}
        <div className="px-3 pb-2">
          <button
            onClick={() => setShowAddMember(true)}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 min-h-[44px]"
            style={{ background: 'linear-gradient(135deg,#6366F1,#A855F7)', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}
          >
            <UserPlus size={15} aria-hidden="true" /> Add Member
          </button>
        </div>

        {/* ── Account section ── */}
        <div className="px-3 pb-4 border-t border-white/10 pt-3 relative" ref={accountMenuRef}>
          {/* Account popup menu */}
          {showAccountMenu && (
            <div
              className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
              role="menu"
              aria-label="Account options"
            >
              {/* Account info header */}
              <div
                className="px-4 py-3 border-b border-slate-100"
                style={{ background: 'linear-gradient(135deg,#F8FAFF,#EEF2FF)' }}
              >
                <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                <p className="font-bold text-slate-800 text-sm truncate">{settings.ownerName || 'Gym Owner'}</p>
                <p className="text-xs text-indigo-600 truncate">{settings.gymName}</p>
              </div>

              {/* Menu items */}
              <button
                role="menuitem"
                onClick={() => { navigate('settings'); setShowAccountMenu(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium border-b border-slate-50"
              >
                <SettingsIcon size={15} aria-hidden="true" />
                Account Settings
              </button>
              <button
                role="menuitem"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold"
              >
                <LogOut size={15} aria-hidden="true" />
                Sign Out
              </button>
            </div>
          )}

          {/* Account trigger button */}
          <button
            onClick={() => setShowAccountMenu((v) => !v)}
            aria-expanded={showAccountMenu}
            aria-haspopup="menu"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 transition-all duration-200 group"
          >
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md"
              style={{ background: 'linear-gradient(135deg,#6366F1,#A855F7)' }}
              aria-hidden="true"
            >
              {ownerInitial}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-white text-xs font-semibold truncate">{settings.ownerName || 'Gym Owner'}</p>
              <p className="text-white/40 text-[10px] truncate">{settings.gymName}</p>
            </div>
            <ChevronUp
              size={14}
              className={`text-white/40 transition-transform duration-200 flex-shrink-0 ${showAccountMenu ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </aside>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <div className="flex-1 md:ml-[240px] flex flex-col min-h-screen">

        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-slate-800 text-sm truncate max-w-[160px]">{settings.gymName}</span>
          </div>
          <div className="flex items-center gap-2">
            {attentionCount > 0 && (
              <span
                className="w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold text-white animate-pulse"
                style={{ background: '#EF4444' }}
                aria-label={`${attentionCount} need attention`}
              >
                {attentionCount}
              </span>
            )}
            <button
              onClick={() => setShowAddMember(true)}
              aria-label="Add new member"
              className="w-9 h-9 flex items-center justify-center rounded-xl text-white"
              style={{ background: 'linear-gradient(135deg,#6366F1,#A855F7)' }}
            >
              <Plus size={20} strokeWidth={2.5} />
            </button>
          </div>
        </header>

        {/* Screen content */}
        <main
          key={screen}
          className="flex-1 overflow-y-auto scrollbar-thin animate-fade-in"
          id="main-content"
          tabIndex={-1}
        >
          {screen === 'dashboard' && (
            <Dashboard members={members} settings={settings} onSelectMember={(id) => { setFocusedMemberId(id); setScreen('members') }} />
          )}
          {screen === 'members' && (
            <Members
              members={members}
              settings={settings}
              onUpdateMember={(updated) => setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))}
              initialSelectedId={focusedMemberId}
            />
          )}
          {screen === 'analytics' && <Analytics members={members} />}
          {screen === 'settings' && (
            <Settings
              settings={settings}
              onSave={setSettings}
              onResetDemo={() => { setMembers(buildSeedMembers()); localStorage.removeItem(STORAGE_KEY) }}
              onLogout={handleLogout}
            />
          )}
        </main>

        {/* Mobile bottom tab bar */}
        <nav
          aria-label="Bottom navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200/60 flex z-10"
        >
          {navItems.map((item) => {
            const isActive = screen === item.key
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.key)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-bold transition-colors min-h-[56px] relative ${
                  isActive ? 'text-indigo-600' : 'text-slate-400'
                }`}
              >
                {isActive && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-b-full"
                    style={{ background: 'linear-gradient(90deg,#6366F1,#A855F7)' }}
                    aria-hidden="true"
                  />
                )}
                <span className="mb-0.5 flex items-center justify-center" aria-hidden="true">{item.icon}</span>
                {item.label}
                {item.key === 'dashboard' && attentionCount > 0 && (
                  <span
                    className="absolute top-1.5 right-[calc(50%-14px)] w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-bold text-white"
                    style={{ background: '#EF4444' }}
                    aria-label={`${attentionCount} need attention`}
                  >
                    {attentionCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Mobile bottom spacer */}
        <div className="md:hidden h-14 flex-shrink-0" aria-hidden="true" />
      </div>

      {/* Add member modal */}
      {showAddMember && (
        <AddMember
          onAdd={(member) => setMembers((prev) => [...prev, member])}
          onClose={() => setShowAddMember(false)}
        />
      )}
    </div>
  )
}
