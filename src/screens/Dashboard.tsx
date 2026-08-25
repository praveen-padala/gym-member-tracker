import { useState } from 'react'
import { UserCheck, Clock, AlertCircle, IndianRupee } from 'lucide-react'
import type { Member, GymSettings, MemberStatus } from '../types'
import {
  getMemberStatus, getDaysUntilExpiry, formatCurrency,
  getRelativeExpiry, pendingAmount, formatDate,
} from '../utils'
import { StatusBadge } from '../components/StatusBadge'
import { RemindButton } from '../components/RemindButton'
import { BulkReminderSheet } from '../components/BulkReminderSheet'
import { WhatsAppIcon } from '../components/WhatsAppIcon'
import { useCountUp } from '../hooks/useCountUp'

interface DashboardProps {
  members: Member[]
  settings: GymSettings
  onSelectMember: (id: string) => void
}

interface StatTileProps {
  label: string
  value: number
  isCurrency?: boolean
  gradient: string
  icon: React.ReactNode
  delay: number
}

function StatTile({ label, value, isCurrency, gradient, icon, delay }: StatTileProps) {
  const count = useCountUp(value, 1100, delay)
  const display = isCurrency ? formatCurrency(count) : String(count)

  return (
    <div
      className="rounded-2xl p-4 md:p-5 text-white relative overflow-hidden animate-fade-in-up"
      style={{ background: gradient, animationDelay: `${delay}ms` }}
    >
      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white opacity-10" aria-hidden="true" />
      <div className="absolute top-8 -right-2 w-12 h-12 rounded-full bg-white opacity-10" aria-hidden="true" />
      <p className="text-white/70 text-xs font-medium uppercase tracking-wide">{label}</p>
      <p
        className="mt-2 font-bold tabular-nums leading-none"
        style={{ fontSize: isCurrency ? 'clamp(1.3rem, 4vw, 2.4rem)' : 'clamp(1.8rem, 5vw, 3rem)' }}
      >
        {display}
      </p>
      <div className="absolute bottom-3.5 right-3.5 opacity-75" aria-hidden="true">{icon}</div>
    </div>
  )
}

export function Dashboard({ members, settings, onSelectMember }: DashboardProps) {
  const [bulkTarget, setBulkTarget] = useState<MemberStatus | null>(null)

  const activeCount   = members.filter((m) => getMemberStatus(m) === 'active').length
  const expiringCount = members.filter((m) => getMemberStatus(m) === 'expiring').length
  const overdueCount  = members.filter((m) => getMemberStatus(m) === 'expired').length
  const totalPending  = members.reduce((sum, m) => sum + pendingAmount(m), 0)

  const needsAttention = members
    .filter((m) => { const s = getMemberStatus(m); return s === 'expired' || s === 'expiring' })
    .sort((a, b) => getDaysUntilExpiry(a) - getDaysUntilExpiry(b))

  const bulkMembers =
    bulkTarget === 'expiring'
      ? members.filter((m) => getMemberStatus(m) === 'expiring')
      : bulkTarget === 'expired'
      ? members.filter((m) => getMemberStatus(m) === 'expired')
      : []

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1100px] mx-auto">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Good {greeting()},{' '}
          <span className="text-gradient">{settings.ownerName || settings.gymName}</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">Here's what's happening at {settings.gymName} today</p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <StatTile label="Active Members" value={activeCount} gradient="linear-gradient(135deg,#059669,#10B981)" icon={<UserCheck size={22} strokeWidth={2} />} delay={0} />
        <StatTile label="Expiring in 7 days" value={expiringCount} gradient="linear-gradient(135deg,#D97706,#FBBF24)" icon={<Clock size={22} strokeWidth={2} />} delay={100} />
        <StatTile label="Overdue" value={overdueCount} gradient="linear-gradient(135deg,#DC2626,#F87171)" icon={<AlertCircle size={22} strokeWidth={2} />} delay={200} />
        <StatTile label="Total Pending" value={totalPending} isCurrency gradient="linear-gradient(135deg,#4F46E5,#A855F7)" icon={<IndianRupee size={22} strokeWidth={2} />} delay={300} />
      </div>

      {/* Needs attention */}
      <div className="card animate-fade-in-up" style={{ animationDelay: '400ms' }}>

        {/* Card header with bulk action buttons */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 flex-1">
            <h2 className="font-bold text-slate-800 text-base">Needs Attention</h2>
            {needsAttention.length > 0 && (
              <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                {needsAttention.length} members
              </span>
            )}
          </div>

          {/* Bulk reminder buttons */}
          {(expiringCount > 0 || overdueCount > 0) && (
            <div className="flex gap-2 flex-shrink-0">
              {expiringCount > 0 && (
                <button
                  onClick={() => setBulkTarget('expiring')}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors min-h-[36px]"
                  aria-label={`Send bulk reminder to ${expiringCount} expiring members`}
                >
                  <WhatsAppIcon size={12} />
                  Expiring ({expiringCount})
                </button>
              )}
              {overdueCount > 0 && (
                <button
                  onClick={() => setBulkTarget('expired')}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-red-700 bg-red-50 hover:bg-red-100 transition-colors min-h-[36px]"
                  aria-label={`Send bulk reminder to ${overdueCount} overdue members`}
                >
                  <WhatsAppIcon size={12} />
                  Overdue ({overdueCount})
                </button>
              )}
            </div>
          )}
        </div>

        {needsAttention.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <span className="text-4xl" aria-hidden="true">🎉</span>
            <p className="text-slate-500 text-sm mt-3">All members are up to date!</p>
          </div>
        ) : (
          <ul>
            {needsAttention.map((m, i) => {
              const status  = getMemberStatus(m)
              const pending = pendingAmount(m)
              return (
                <li
                  key={m.id}
                  className={`flex items-center gap-3 px-5 py-4 ${i < needsAttention.length - 1 ? 'border-b border-slate-50' : ''} hover:bg-slate-50/80 transition-colors animate-fade-in-up`}
                  style={{ animationDelay: `${500 + i * 60}ms` }}
                >
                  <button
                    onClick={() => onSelectMember(m.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    aria-label={`View details for ${m.name}`}
                  >
                    <img
                      src={m.photo}
                      alt=""
                      aria-hidden="true"
                      className="w-10 h-10 rounded-xl object-cover flex-shrink-0 shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-slate-800 truncate">{m.name}</span>
                        <StatusBadge status={status} />
                      </div>
                      <p className={`text-xs mt-0.5 font-medium ${status === 'expired' ? 'text-red-600' : 'text-amber-600'}`}>
                        {getRelativeExpiry(m)} · {formatDate(m.expiryDate)}
                      </p>
                      {pending > 0 && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          Pending: <span className="font-medium text-red-600">{formatCurrency(pending)}</span>
                        </p>
                      )}
                    </div>
                  </button>

                  <RemindButton member={m} settings={settings} compact />
                </li>
              )
            })}
          </ul>
        )}
      </div>

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

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
