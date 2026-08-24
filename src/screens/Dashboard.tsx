import { UserCheck, Clock, AlertCircle, IndianRupee } from 'lucide-react'
import type { Member, GymSettings } from '../types'
import {
  getMemberStatus, getDaysUntilExpiry, formatCurrency,
  getRelativeExpiry, buildWhatsAppUrl, pendingAmount, formatDate,
} from '../utils'
import { StatusBadge } from '../components/StatusBadge'
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
  const activeCount = members.filter((m) => getMemberStatus(m) === 'active').length
  const expiringCount = members.filter((m) => getMemberStatus(m) === 'expiring').length
  const overdueCount = members.filter((m) => getMemberStatus(m) === 'expired').length
  const totalPending = members.reduce((sum, m) => sum + pendingAmount(m), 0)

  const needsAttention = members
    .filter((m) => {
      const s = getMemberStatus(m)
      return s === 'expired' || s === 'expiring'
    })
    .sort((a, b) => getDaysUntilExpiry(a) - getDaysUntilExpiry(b))

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
        <StatTile
          label="Active Members"
          value={activeCount}
          gradient="linear-gradient(135deg,#059669,#10B981)"
          icon={<UserCheck size={22} strokeWidth={2} />}
          delay={0}
        />
        <StatTile
          label="Expiring in 7 days"
          value={expiringCount}
          gradient="linear-gradient(135deg,#D97706,#FBBF24)"
          icon={<Clock size={22} strokeWidth={2} />}
          delay={100}
        />
        <StatTile
          label="Overdue"
          value={overdueCount}
          gradient="linear-gradient(135deg,#DC2626,#F87171)"
          icon={<AlertCircle size={22} strokeWidth={2} />}
          delay={200}
        />
        <StatTile
          label="Total Pending"
          value={totalPending}
          isCurrency
          gradient="linear-gradient(135deg,#4F46E5,#A855F7)"
          icon={<IndianRupee size={22} strokeWidth={2} />}
          delay={300}
        />
      </div>

      {/* Needs attention */}
      <div className="card animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-base">Needs Attention</h2>
          {needsAttention.length > 0 && (
            <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {needsAttention.length} members
            </span>
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
              const status = getMemberStatus(m)
              const pending = pendingAmount(m)
              return (
                <li
                  key={m.id}
                  className={`flex items-center gap-3 px-5 py-4 ${i < needsAttention.length - 1 ? 'border-b border-slate-50' : ''} hover:bg-slate-50 transition-colors animate-fade-in-up`}
                  style={{ animationDelay: `${500 + i * 60}ms` }}
                >
                  <div
                    className={`w-1 h-10 rounded-full flex-shrink-0 ${status === 'expired' ? 'bg-red-500' : 'bg-amber-500'}`}
                    aria-hidden="true"
                  />
                  <button
                    onClick={() => onSelectMember(m.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    aria-label={`View details for ${m.name}`}
                  >
                    <img
                      src={m.photo}
                      alt=""
                      aria-hidden="true"
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-white shadow-sm"
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

                  <a
                    href={buildWhatsAppUrl(m, settings.gymName, settings.reminderTemplate)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Send WhatsApp reminder to ${m.name}`}
                    className="btn-whatsapp text-xs px-3 py-2 flex-shrink-0"
                  >
                    <WhatsAppIcon size={14} />
                    <span className="hidden sm:inline">Remind</span>
                  </a>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
