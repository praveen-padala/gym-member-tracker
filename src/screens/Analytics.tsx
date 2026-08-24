import { useState, useMemo, useEffect } from 'react'
import {
  TrendingUp, TrendingDown, Users, IndianRupee, Star, CalendarDays,
} from 'lucide-react'
import type { Member } from '../types'
import { formatCurrency } from '../utils'

interface AnalyticsProps {
  members: Member[]
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/* ─── Desktop: vertical bar chart ───────────────────────────── */
interface BarChartProps {
  bars: { label: string; value: number }[]
  color: string
  formatVal?: (v: number) => string
  height?: number
}

function AnimatedBarChart({ bars, color, formatVal, height = 140 }: BarChartProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [bars])

  const max = Math.max(...bars.map((b) => b.value), 1)

  return (
    <div style={{ height: height + 28 }} className="flex flex-col">
      <div className="flex items-end gap-1.5 flex-1">
        {bars.map((bar, i) => {
          const pct = bar.value > 0 ? Math.max((bar.value / max) * 100, 5) : 0
          return (
            <div key={i} className="flex-1 flex flex-col items-center h-full min-w-0">
              <div className="w-full flex-1 flex flex-col justify-end">
                <div
                  className="w-full rounded-t-md relative group"
                  style={{
                    height: mounted ? `${pct}%` : '0%',
                    background: color,
                    transition: `height 650ms cubic-bezier(0.34,1.56,0.64,1) ${i * 30}ms`,
                    minHeight: bar.value > 0 && mounted ? '4px' : '0',
                  }}
                >
                  {bar.value > 0 && (
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {formatVal ? formatVal(bar.value) : bar.value}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex gap-1.5 mt-1.5">
        {bars.map((bar, i) => (
          <div key={i} className="flex-1 text-center min-w-0">
            <span className="text-[10px] text-slate-400 font-medium">{bar.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Mobile: horizontal row list ───────────────────────────── */
function MobileBarList({ bars, color, formatVal }: Omit<BarChartProps, 'height'>) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [bars])

  const max = Math.max(...bars.map((b) => b.value), 1)

  return (
    <div className="space-y-2">
      {bars.map((bar, i) => {
        const pct = bar.value > 0 ? Math.max((bar.value / max) * 100, 3) : 0
        const label = formatVal ? formatVal(bar.value) : String(bar.value)
        return (
          <div key={i} className="flex items-center gap-2.5">
            {/* Month label */}
            <span className="text-[11px] font-semibold text-slate-400 w-7 flex-shrink-0">{bar.label}</span>
            {/* Bar track */}
            <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: mounted ? `${pct}%` : '0%',
                  background: color,
                  transition: `width 550ms cubic-bezier(0.34,1.56,0.64,1) ${i * 25}ms`,
                  minWidth: bar.value > 0 && mounted ? '8px' : '0',
                }}
              />
            </div>
            {/* Value — always visible, no hover needed */}
            <span
              className="text-[11px] font-bold w-[68px] text-right flex-shrink-0"
              style={{ color: bar.value > 0 ? '#1E293B' : '#CBD5E1' }}
            >
              {bar.value > 0 ? label : '—'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Summary stat card ─────────────────────────────────────── */
interface SummaryCardProps {
  label: string
  value: string
  sub: string
  gradient: string
  icon: React.ReactNode
  delay: number
}

function SummaryCard({ label, value, sub, gradient, icon, delay }: SummaryCardProps) {
  return (
    <div
      className="rounded-2xl p-3.5 text-white relative overflow-hidden animate-fade-in-up"
      style={{ background: gradient, animationDelay: `${delay}ms` }}
    >
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" aria-hidden="true" />
      <p className="text-white/70 text-[10px] font-semibold uppercase tracking-wide leading-tight">{label}</p>
      <p className="text-base md:text-xl font-bold mt-1 leading-tight break-words">{value}</p>
      <p className="text-white/60 text-[10px] mt-0.5 leading-tight">{sub}</p>
      <div className="absolute bottom-2.5 right-2.5 opacity-70" aria-hidden="true">{icon}</div>
    </div>
  )
}

/* ─── Main ──────────────────────────────────────────────────── */
export function Analytics({ members }: AnalyticsProps) {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)

  const monthlyRevenue = useMemo(() => {
    const data = new Array(12).fill(0) as number[]
    members.forEach((m) =>
      m.payments.forEach((p) => {
        const d = new Date(p.date)
        if (d.getFullYear() === selectedYear) data[d.getMonth()] += p.amount
      })
    )
    return MONTHS.map((label, i) => ({ label, value: data[i] }))
  }, [members, selectedYear])

  const monthlyNewMembers = useMemo(() => {
    const data = new Array(12).fill(0) as number[]
    members.forEach((m) => {
      const d = new Date(m.joinDate)
      if (d.getFullYear() === selectedYear) data[d.getMonth()]++
    })
    return MONTHS.map((label, i) => ({ label, value: data[i] }))
  }, [members, selectedYear])

  const prevYearRevenue = useMemo(() => {
    let total = 0
    members.forEach((m) =>
      m.payments.forEach((p) => {
        if (new Date(p.date).getFullYear() === selectedYear - 1) total += p.amount
      })
    )
    return total
  }, [members, selectedYear])

  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.value, 0)
  const totalNewMembers = monthlyNewMembers.reduce((s, m) => s + m.value, 0)
  const avgMonthlyRevenue = totalRevenue > 0 ? Math.round(totalRevenue / 12) : 0
  const peakMonth = monthlyRevenue.reduce<{ label: string; value: number; index: number }>(
    (best, cur, i) => (cur.value > best.value ? { ...cur, index: i } : best),
    { label: '', value: 0, index: 0 },
  )

  const revenueGrowth = prevYearRevenue > 0
    ? Math.round(((totalRevenue - prevYearRevenue) / prevYearRevenue) * 100)
    : null
  const growthUp = revenueGrowth !== null && revenueGrowth >= 0

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1100px] mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 mb-5 animate-fade-in-up">
        <div className="min-w-0">
          <h1 className="text-xl md:text-3xl font-bold text-slate-800 leading-tight">Analytics</h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5 leading-snug">Revenue &amp; member growth</p>
        </div>
        {/* Year toggle */}
        <div className="flex bg-white border border-slate-200 rounded-xl p-1 gap-1 flex-shrink-0 shadow-sm">
          {[currentYear - 1, currentYear].map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              aria-pressed={selectedYear === year}
              className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 min-h-[32px] min-w-[48px] ${
                selectedYear === year ? 'text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              style={selectedYear === year ? { background: 'linear-gradient(135deg,#6366F1,#A855F7)' } : {}}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <SummaryCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          sub={String(selectedYear)}
          gradient="linear-gradient(135deg,#4F46E5,#7C3AED)"
          icon={<IndianRupee size={20} strokeWidth={2} />}
          delay={0}
        />
        <SummaryCard
          label="New Members"
          value={String(totalNewMembers)}
          sub="joined this year"
          gradient="linear-gradient(135deg,#059669,#10B981)"
          icon={<Users size={20} strokeWidth={2} />}
          delay={80}
        />
        <SummaryCard
          label="Avg Monthly"
          value={formatCurrency(avgMonthlyRevenue)}
          sub="per month"
          gradient="linear-gradient(135deg,#0891B2,#06B6D4)"
          icon={<TrendingUp size={20} strokeWidth={2} />}
          delay={160}
        />
        <SummaryCard
          label="Peak Month"
          value={peakMonth.value > 0 ? MONTHS[peakMonth.index] : '—'}
          sub={peakMonth.value > 0 ? formatCurrency(peakMonth.value) : 'No data'}
          gradient="linear-gradient(135deg,#D97706,#F59E0B)"
          icon={<Star size={20} strokeWidth={2} />}
          delay={240}
        />
      </div>

      {/* ── Charts ── */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">

        {/* Revenue chart */}
        <div className="card p-4 animate-fade-in-up" style={{ animationDelay: '320ms' }}>
          <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Monthly Revenue</p>
              <p className="text-indigo-600 font-bold text-xl leading-tight mt-0.5">{formatCurrency(totalRevenue)}</p>
            </div>
            {revenueGrowth !== null && (
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                  growthUp ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {growthUp
                  ? <TrendingUp size={12} strokeWidth={2.5} />
                  : <TrendingDown size={12} strokeWidth={2.5} />}
                {Math.abs(revenueGrowth)}%
              </span>
            )}
          </div>
          {/* Mobile: horizontal rows (no hover needed) */}
          <div className="md:hidden">
            <MobileBarList
              key={`rev-mob-${selectedYear}`}
              bars={monthlyRevenue}
              color="linear-gradient(to right,#4F46E5,#818CF8)"
              formatVal={(v) => formatCurrency(v)}
            />
          </div>
          {/* Desktop: vertical bars with hover tooltips */}
          <div className="hidden md:block">
            <AnimatedBarChart
              key={`rev-${selectedYear}`}
              bars={monthlyRevenue}
              color="linear-gradient(to top,#4F46E5,#818CF8)"
              formatVal={(v) => formatCurrency(v)}
            />
          </div>
        </div>

        {/* Members chart */}
        <div className="card p-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="mb-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">New Members</p>
            <p className="text-purple-600 font-bold text-xl leading-tight mt-0.5">
              {totalNewMembers} member{totalNewMembers !== 1 ? 's' : ''}
            </p>
          </div>
          {/* Mobile */}
          <div className="md:hidden">
            <MobileBarList
              key={`mem-mob-${selectedYear}`}
              bars={monthlyNewMembers}
              color="linear-gradient(to right,#7C3AED,#C084FC)"
              formatVal={(v) => `${v} member${v !== 1 ? 's' : ''}`}
            />
          </div>
          {/* Desktop */}
          <div className="hidden md:block">
            <AnimatedBarChart
              key={`mem-${selectedYear}`}
              bars={monthlyNewMembers}
              color="linear-gradient(to top,#7C3AED,#C084FC)"
              formatVal={(v) => `${v} member${v !== 1 ? 's' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* ── Month-by-month table ── */}
      <div className="card overflow-hidden animate-fade-in-up" style={{ animationDelay: '480ms' }}>
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <CalendarDays size={15} className="text-indigo-500 flex-shrink-0" />
          <h2 className="font-bold text-slate-800 text-sm">Month-by-Month</h2>
          <span className="text-xs text-slate-400 font-medium">{selectedYear}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: '320px' }}>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wide">Month</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wide">Revenue</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wide">Members</th>
                <th className="text-right px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Rev/Member</th>
              </tr>
            </thead>
            <tbody>
              {MONTHS.map((month, i) => {
                const rev = monthlyRevenue[i].value
                const mem = monthlyNewMembers[i].value
                const revPerMem = mem > 0 ? Math.round(rev / mem) : null
                const isNow =
                  new Date().getMonth() === i && new Date().getFullYear() === selectedYear
                return (
                  <tr
                    key={month}
                    className={`border-b border-slate-50 last:border-0 ${
                      isNow ? 'bg-indigo-50/60' : 'hover:bg-slate-50/60'
                    } transition-colors`}
                  >
                    <td className="px-4 py-2.5 font-medium text-slate-700">
                      <span className="flex items-center gap-1.5">
                        {month}
                        {isNow && (
                          <span className="text-[9px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full">
                            NOW
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={rev > 0 ? 'font-semibold text-slate-800 text-xs' : 'text-slate-300 text-xs'}>
                        {rev > 0 ? formatCurrency(rev) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={mem > 0 ? 'font-semibold text-slate-800 text-xs' : 'text-slate-300 text-xs'}>
                        {mem > 0 ? mem : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right hidden sm:table-cell">
                      <span className="text-slate-400 text-xs">
                        {revPerMem !== null ? formatCurrency(revPerMem) : '—'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-200">
                <td className="px-4 py-2.5 font-bold text-slate-800 text-xs">Total</td>
                <td className="px-4 py-2.5 text-right font-bold text-indigo-600 text-xs">{formatCurrency(totalRevenue)}</td>
                <td className="px-4 py-2.5 text-right font-bold text-purple-600 text-xs">{totalNewMembers}</td>
                <td className="px-4 py-2.5 text-right hidden sm:table-cell text-slate-400 text-xs">
                  {totalNewMembers > 0 ? formatCurrency(Math.round(totalRevenue / totalNewMembers)) : '—'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
