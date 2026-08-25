import { useState } from 'react'
import {
  Phone, ArrowLeft, X, CreditCard, User, ChevronRight, Search,
  Info, TrendingUp, IndianRupee, Check, AlertCircle, CheckCircle,
  Clock, CalendarDays, Banknote, SearchX,
} from 'lucide-react'
import type { Member, MemberFilter, GymSettings, MemberStatus } from '../types'
import {
  getMemberStatus, getDaysUntilExpiry, formatDate, formatCurrency,
  pendingAmount, planLabel, getRelativeExpiry,
} from '../utils'
import { StatusBadge } from '../components/StatusBadge'
import { RemindButton } from '../components/RemindButton'
import { BulkReminderSheet } from '../components/BulkReminderSheet'
import { WhatsAppIcon } from '../components/WhatsAppIcon'

interface MembersProps {
  members: Member[]
  settings: GymSettings
  onUpdateMember: (member: Member) => void
  initialSelectedId?: string | null
}

export function Members({ members, settings, onUpdateMember, initialSelectedId = null }: MembersProps) {
  const [filter, setFilter]       = useState<MemberFilter>('all')
  const [search, setSearch]       = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId)
  const [showPayment, setShowPayment] = useState(false)
  const [bulkTarget, setBulkTarget] = useState<MemberStatus | null>(null)

  const filtered = members.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) || m.mobile.includes(search)
    const status = getMemberStatus(m)
    const matchFilter =
      filter === 'all' ||
      (filter === 'active'   && status === 'active') ||
      (filter === 'expiring' && status === 'expiring') ||
      (filter === 'expired'  && status === 'expired')
    return matchSearch && matchFilter
  })

  const selectedMember = members.find((m) => m.id === selectedId) ?? null

  function handleRecordPayment(amount: number, date: string) {
    if (!selectedMember) return
    const newPayment  = { id: Math.random().toString(36).slice(2, 10), date, amount }
    const newPaid     = selectedMember.amountPaid + amount
    const fullyPaid   = newPaid >= selectedMember.totalAmount
    const newExpiry   = fullyPaid
      ? new Date(new Date(selectedMember.expiryDate).getTime() + selectedMember.planDuration * 30 * 86400000)
          .toISOString().split('T')[0]
      : selectedMember.expiryDate
    onUpdateMember({ ...selectedMember, amountPaid: newPaid, expiryDate: newExpiry, payments: [...selectedMember.payments, newPayment] })
    setShowPayment(false)
  }

  const filterTabs: { value: MemberFilter; label: string }[] = [
    { value: 'all',      label: 'All' },
    { value: 'active',   label: 'Active' },
    { value: 'expiring', label: 'Expiring' },
    { value: 'expired',  label: 'Expired' },
  ]

  const counts: Record<MemberFilter, number> = {
    all:      members.length,
    active:   members.filter((m) => getMemberStatus(m) === 'active').length,
    expiring: members.filter((m) => getMemberStatus(m) === 'expiring').length,
    expired:  members.filter((m) => getMemberStatus(m) === 'expired').length,
  }

  const bulkMembers =
    bulkTarget === 'expiring'
      ? members.filter((m) => getMemberStatus(m) === 'expiring')
      : bulkTarget === 'expired'
      ? members.filter((m) => getMemberStatus(m) === 'expired')
      : []

  return (
    <div className="flex h-full overflow-hidden">

      {/* ══════════ List pane ══════════ */}
      <div className={`flex flex-col ${selectedMember ? 'hidden md:flex' : 'flex'} w-full md:w-[340px] lg:w-[380px] md:border-r border-slate-200/60 flex-shrink-0 overflow-hidden`} style={{ background: '#F4F5FB' }}>

        {/* Search + filters */}
        <div className="p-3 border-b border-slate-200/70 space-y-2.5 flex-shrink-0 bg-white">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              aria-label="Search members"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or mobile…"
              className="input-field pl-8 !py-2 text-sm"
            />
          </div>
          <div role="tablist" aria-label="Filter members" className="flex gap-1.5">
            {filterTabs.map((t) => (
              <button
                key={t.value}
                role="tab"
                aria-selected={filter === t.value}
                onClick={() => setFilter(t.value)}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all duration-200 min-h-[34px] ${
                  filter === t.value ? 'text-white shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
                style={filter === t.value ? { background: 'linear-gradient(135deg,#6366F1,#A855F7)' } : {}}
              >
                {t.label}
                <span className={`ml-0.5 ${filter === t.value ? 'opacity-70' : 'opacity-50'}`}>{counts[t.value]}</span>
              </button>
            ))}
          </div>

          {/* Bulk remind actions — shown only when not searching and relevant */}
          {!search && (filter === 'all' || filter === 'expiring' || filter === 'expired') && (counts.expiring > 0 || counts.expired > 0) && (
            <div className="flex gap-2">
              {counts.expiring > 0 && (filter === 'all' || filter === 'expiring') && (
                <button
                  onClick={() => setBulkTarget('expiring')}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold py-2 rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors min-h-[36px]"
                  aria-label={`Bulk remind ${counts.expiring} expiring members`}
                >
                  <WhatsAppIcon size={11} /> Remind Expiring ({counts.expiring})
                </button>
              )}
              {counts.expired > 0 && (filter === 'all' || filter === 'expired') && (
                <button
                  onClick={() => setBulkTarget('expired')}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold py-2 rounded-xl text-red-700 bg-red-50 hover:bg-red-100 transition-colors min-h-[36px]"
                  aria-label={`Bulk remind ${counts.expired} overdue members`}
                >
                  <WhatsAppIcon size={11} /> Remind Overdue ({counts.expired})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Member list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="text-center py-16 px-4">
              <SearchX size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No members found.</p>
            </div>
          ) : (
            <>
              {/* ── Desktop table ── */}
              <table className="hidden md:table w-full text-sm bg-white">
                <thead className="sticky top-0 bg-white z-10 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Member</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m, i) => {
                    const status     = getMemberStatus(m)
                    const isSelected = selectedId === m.id
                    const pending    = pendingAmount(m)
                    return (
                      <tr
                        key={m.id}
                        onClick={() => setSelectedId(m.id)}
                        className={`border-b border-slate-50 cursor-pointer transition-all duration-150 animate-fade-in-up relative ${
                          isSelected ? 'bg-indigo-50' : 'hover:bg-slate-50/80'
                        }`}
                        style={{ animationDelay: `${i * 25}ms` }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            {isSelected && (
                              <div className="absolute left-0 w-0.5 h-10 rounded-r-full bg-indigo-500" aria-hidden="true" />
                            )}
                            <img src={m.photo} alt="" aria-hidden="true" className="w-8 h-8 rounded-xl object-cover shadow-sm flex-shrink-0" />
                            <div className="min-w-0">
                              <p className={`font-semibold text-sm truncate ${isSelected ? 'text-indigo-700' : 'text-slate-800'}`}>{m.name}</p>
                              <p className="text-[11px] text-slate-400 truncate">{m.mobile}</p>
                              {pending > 0 && <p className="text-[10px] text-red-500 font-semibold">Due: {formatCurrency(pending)}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg font-medium">{planLabel(m.planDuration)}</span>
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge status={status} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* ── Mobile cards ── */}
              <ul className="md:hidden p-3 space-y-2.5">
                {filtered.map((m, i) => {
                  const status  = getMemberStatus(m)
                  const pending = pendingAmount(m)
                  return (
                    <li key={m.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 35}ms` }}>
                      <div
                        className="bg-white rounded-2xl overflow-hidden border border-slate-200 transition-shadow duration-200 hover:shadow-md"
                        style={{ boxShadow: '0 2px 8px rgba(99,102,241,0.07), 0 1px 3px rgba(0,0,0,0.07)' }}
                      >
                        <button
                          onClick={() => setSelectedId(m.id)}
                          className="w-full flex items-start gap-3.5 p-4 text-left active:bg-slate-50 transition-colors"
                          aria-label={`View ${m.name}`}
                        >
                          <img
                            src={m.photo}
                            alt=""
                            aria-hidden="true"
                            className="w-11 h-11 rounded-xl object-cover flex-shrink-0 shadow-sm mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-sm text-slate-800 leading-tight">{m.name}</span>
                              <StatusBadge status={status} />
                            </div>
                            <p className="text-xs text-slate-400 mt-1 truncate">{m.mobile}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {planLabel(m.planDuration)} · {getRelativeExpiry(m)}
                            </p>
                            {pending > 0 && (
                              <p className="text-xs font-bold text-red-500 mt-1">Due: {formatCurrency(pending)}</p>
                            )}
                          </div>
                          <ChevronRight size={14} className="text-slate-300 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        </button>

                        {/* Quick remind — only for expiring/expired */}
                        {(status === 'expiring' || status === 'expired') && (
                          <div className="border-t border-slate-50 px-4 py-2.5 flex justify-end">
                            <RemindButton member={m} settings={settings} compact />
                          </div>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* ══════════ Detail pane ══════════ */}
      <div className={`flex-1 overflow-y-auto scrollbar-thin bg-app ${selectedMember ? 'block' : 'hidden md:flex md:items-center md:justify-center'}`}>
        {selectedMember ? (
          <MemberDetail
            member={selectedMember}
            settings={settings}
            onBack={() => setSelectedId(null)}
            onRecordPayment={() => setShowPayment(true)}
          />
        ) : (
          <div className="text-center p-10">
            <div
              className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#EEF2FF,#E0E7FF)' }}
              aria-hidden="true"
            >
              <User size={36} className="text-indigo-300" />
            </div>
            <p className="text-slate-500 font-medium text-sm">Select a member</p>
            <p className="text-slate-400 text-xs mt-1">Choose from the list to view details</p>
          </div>
        )}
      </div>

      {/* Record payment modal */}
      {showPayment && selectedMember && (
        <RecordPaymentModal member={selectedMember} onRecord={handleRecordPayment} onClose={() => setShowPayment(false)} />
      )}

      {/* Bulk reminder sheet */}
      {bulkTarget && (
        <BulkReminderSheet
          members={bulkMembers}
          settings={settings}
          title={bulkTarget === 'expiring' ? 'Expiring Soon Reminders' : 'Overdue Reminders'}
          subtitle={`Send WhatsApp reminders to ${bulkMembers.length} member${bulkMembers.length !== 1 ? 's' : ''}`}
          onClose={() => setBulkTarget(null)}
        />
      )}
    </div>
  )
}

/* ─── Member Detail ─────────────────────────────────────────── */
function MemberDetail({
  member, settings, onBack, onRecordPayment,
}: {
  member: Member
  settings: GymSettings
  onBack: () => void
  onRecordPayment: () => void
}) {
  const status  = getMemberStatus(member)
  const pending = pendingAmount(member)
  const daysLeft = getDaysUntilExpiry(member)
  const paidPct  = member.totalAmount > 0 ? Math.min(100, Math.round((member.amountPaid / member.totalAmount) * 100)) : 100

  const heroGradient =
    status === 'active'    ? 'linear-gradient(135deg,#1E1B4B,#312E81,#4338CA)'
    : status === 'expiring' ? 'linear-gradient(135deg,#78350F,#B45309,#D97706)'
    : 'linear-gradient(135deg,#7F1D1D,#991B1B,#DC2626)'

  return (
    <div className="animate-fade-in pb-8">
      {/* Hero */}
      <div className="relative h-36 overflow-hidden" style={{ background: heroGradient }}>
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10" aria-hidden="true" />
        <div className="absolute top-6 -left-6 w-28 h-28 rounded-full bg-white/8" aria-hidden="true" />
        <div className="absolute -bottom-6 right-20 w-20 h-20 rounded-full bg-white/10" aria-hidden="true" />
        <button
          onClick={onBack}
          className="md:hidden absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-xl bg-white/15 text-white hover:bg-white/25 transition-colors"
          aria-label="Back to members list"
        >
          <ArrowLeft size={17} />
        </button>
        <div className="absolute top-4 right-4">
          <StatusBadge status={status} size="md" />
        </div>
      </div>

      {/* Profile card */}
      <div className="mx-4 md:mx-6 -mt-14 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100/80 p-5">
          <div className="flex items-end gap-4">
            <img src={member.photo} alt={member.name} className="w-20 h-20 rounded-2xl object-cover shadow-lg ring-4 ring-white flex-shrink-0" />
            <div className="flex-1 min-w-0 pb-1">
              <h2 className="text-xl font-bold text-slate-800 truncate">{member.name}</h2>
              <p className="text-slate-500 text-sm flex items-center gap-1.5 mt-0.5">
                <Phone size={12} className="text-slate-400" aria-hidden="true" />
                {member.mobile}
              </p>
              <p className="text-slate-400 text-xs mt-1">{planLabel(member.planDuration)} Plan</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 mt-4 space-y-3">
        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-2.5">
          <MiniStat label="Amount Paid" value={formatCurrency(member.amountPaid)} gradient="linear-gradient(135deg,#059669,#10B981)" icon={<Banknote size={15} strokeWidth={2} />} />
          <MiniStat
            label={pending > 0 ? 'Pending Due' : 'No Dues'}
            value={pending > 0 ? formatCurrency(pending) : 'Cleared'}
            gradient={pending > 0 ? 'linear-gradient(135deg,#DC2626,#F87171)' : 'linear-gradient(135deg,#6366F1,#818CF8)'}
            icon={pending > 0 ? <AlertCircle size={15} strokeWidth={2} /> : <CheckCircle size={15} strokeWidth={2} />}
          />
          <MiniStat
            label={daysLeft >= 0 ? 'Days Left' : 'Overdue By'}
            value={`${Math.abs(daysLeft)}d`}
            gradient={daysLeft < 0 ? 'linear-gradient(135deg,#DC2626,#F87171)' : daysLeft <= 7 ? 'linear-gradient(135deg,#D97706,#FBBF24)' : 'linear-gradient(135deg,#0891B2,#38BDF8)'}
            icon={daysLeft < 0 ? <AlertCircle size={15} strokeWidth={2} /> : daysLeft <= 7 ? <Clock size={15} strokeWidth={2} /> : <CalendarDays size={15} strokeWidth={2} />}
          />
        </div>

        {/* Membership info */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-50 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366F1,#A855F7)' }} aria-hidden="true">
              <Info size={12} className="text-white" />
            </div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Membership Info</h3>
          </div>
          <div className="grid grid-cols-2 divide-x divide-y divide-slate-50">
            <InfoCell label="Join Date"      value={formatDate(member.joinDate)} />
            <InfoCell label="Expiry Date"    value={formatDate(member.expiryDate)} />
            <InfoCell label="Plan Duration"  value={planLabel(member.planDuration)} />
            <InfoCell label="Expiry Status"  value={getRelativeExpiry(member)} colored={status !== 'active'} color={status === 'expiring' ? 'text-amber-600' : 'text-red-600'} />
            <InfoCell label="Total Charged"  value={formatCurrency(member.totalAmount)} />
            <InfoCell label="Balance Due"    value={formatCurrency(pending)} colored={pending > 0} color="text-red-600" />
          </div>
        </div>

        {/* Payment progress */}
        {member.totalAmount > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366F1,#A855F7)' }} aria-hidden="true">
                  <TrendingUp size={12} className="text-white" />
                </div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Progress</h3>
              </div>
              <span className="text-lg font-bold" style={{ background: 'linear-gradient(135deg,#6366F1,#A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {paidPct}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${paidPct}%`, background: 'linear-gradient(90deg,#6366F1,#A855F7)', boxShadow: '0 0 8px rgba(99,102,241,0.5)' }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>Paid: <span className="font-semibold text-emerald-600">{formatCurrency(member.amountPaid)}</span></span>
              <span>Total: <span className="font-semibold text-slate-600">{formatCurrency(member.totalAmount)}</span></span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <RemindButton member={member} settings={settings} />
          <button onClick={onRecordPayment} className="btn-primary justify-center text-sm">
            <IndianRupee size={15} strokeWidth={2.5} />
            Record Payment
          </button>
        </div>

        {/* Payment history */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#059669,#10B981)' }} aria-hidden="true">
                <IndianRupee size={12} className="text-white" />
              </div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment History</h3>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {member.payments.length} record{member.payments.length !== 1 ? 's' : ''}
            </span>
          </div>

          {member.payments.length === 0 ? (
            <div className="py-8 text-center">
              <CreditCard size={32} className="text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm mt-1">No payments recorded yet</p>
            </div>
          ) : (
            <div className="relative px-4">
              <div className="absolute left-[28px] top-0 bottom-0 w-px" style={{ background: 'linear-gradient(to bottom,#E0E7FF,transparent)' }} aria-hidden="true" />
              <ul className="py-2">
                {[...member.payments].reverse().map((p, i) => (
                  <li key={p.id} className="flex items-center gap-4 py-3 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white shadow-md z-10" style={{ background: 'linear-gradient(135deg,#6366F1,#A855F7)' }} aria-hidden="true">
                      <Check size={13} strokeWidth={3} />
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2.5 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 font-medium">{formatDate(p.date)}</p>
                        <p className="text-sm font-bold text-emerald-600">{formatCurrency(p.amount)}</p>
                      </div>
                      <div className="text-[10px] text-slate-300 font-bold">#{member.payments.length - i}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Sub-components ────────────────────────────────────────── */
function MiniStat({ label, value, gradient, icon }: { label: string; value: string; gradient: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-3 text-white relative overflow-hidden" style={{ background: gradient }}>
      <div className="absolute -top-3 -right-3 w-14 h-14 rounded-full bg-white/15" aria-hidden="true" />
      <p className="text-white/70 text-[10px] font-semibold leading-tight">{label}</p>
      <p className="text-sm font-bold mt-0.5 leading-snug">{value}</p>
      <div className="absolute bottom-2 right-2 opacity-70" aria-hidden="true">{icon}</div>
    </div>
  )
}

function InfoCell({ label, value, colored, color }: { label: string; value: string; colored?: boolean; color?: string }) {
  return (
    <div className="px-4 py-3">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-semibold mt-0.5 ${colored && color ? color : 'text-slate-700'}`}>{value}</p>
    </div>
  )
}

/* ─── Record Payment Modal ──────────────────────────────────── */
function RecordPaymentModal({ member, onRecord, onClose }: {
  member: Member
  onRecord: (amount: number, date: string) => void
  onClose: () => void
}) {
  const [amount, setAmount] = useState('')
  const [date, setDate]     = useState(new Date().toISOString().split('T')[0])
  const pending = pendingAmount(member)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    onRecord(amt, date)
  }

  const quickAmounts = [500, 1000, 2000, 5000]

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Record Payment"
        className="fixed inset-x-0 bottom-0 z-50 animate-slide-up md:inset-0 md:flex md:items-center md:justify-center"
      >
        <div className="bg-white rounded-t-3xl md:rounded-2xl md:w-[440px] shadow-2xl overflow-hidden">
          <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg,#6366F1,#A855F7)' }} aria-hidden="true" />
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-slate-800 text-lg">Record Payment</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  For <span className="font-semibold text-slate-700">{member.name}</span>
                  {pending > 0 && <> · Due: <span className="font-semibold text-red-600">{formatCurrency(pending)}</span></>}
                </p>
              </div>
              <button onClick={onClose} aria-label="Close" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Quick amounts</p>
                <div className="flex gap-2">
                  {quickAmounts.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setAmount(String(q))}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all duration-150 ${
                        amount === String(q) ? 'border-indigo-500 text-white' : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                      }`}
                      style={amount === String(q) ? { background: 'linear-gradient(135deg,#6366F1,#A855F7)' } : {}}
                    >
                      {formatCurrency(q)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="payAmount" className="block text-sm font-bold text-slate-700 mb-1.5">Amount (₹) <span aria-hidden="true">*</span></label>
                <input id="payAmount" type="number" required min={1} value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field text-lg font-bold" placeholder="0" autoFocus />
              </div>
              <div>
                <label htmlFor="payDate" className="block text-sm font-bold text-slate-700 mb-1.5">Payment Date <span aria-hidden="true">*</span></label>
                <input id="payDate" type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" className="btn-primary flex-1 justify-center">
                  Save ₹{amount ? parseFloat(amount).toLocaleString('en-IN') : '0'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
