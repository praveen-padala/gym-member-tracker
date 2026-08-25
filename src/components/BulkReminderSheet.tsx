import { useState } from 'react'
import { X, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'
import type { Member, GymSettings } from '../types'
import { sendWhatsAppReminder, formatCurrency, pendingAmount } from '../utils'
import { WhatsAppIcon } from './WhatsAppIcon'

type Status = 'pending' | 'sending' | 'sent' | 'failed'

interface BulkReminderSheetProps {
  members: Member[]
  settings: GymSettings
  title: string
  subtitle: string
  onClose: () => void
}

export function BulkReminderSheet({ members, settings, title, subtitle, onClose }: BulkReminderSheetProps) {
  const [statuses, setStatuses] = useState<Record<string, Status>>(
    () => Object.fromEntries(members.map((m) => [m.id, 'pending' as Status])),
  )
  const [sending, setSending] = useState(false)
  const [started, setStarted] = useState(false)

  const vals = Object.values(statuses)
  const sentCount   = vals.filter((s) => s === 'sent').length
  const failedCount = vals.filter((s) => s === 'failed').length
  const allDone     = started && vals.every((s) => s === 'sent' || s === 'failed')

  async function sendAll() {
    setStarted(true)
    setSending(true)
    for (const m of members) {
      setStatuses((p) => ({ ...p, [m.id]: 'sending' }))
      const ok = await sendWhatsAppReminder(m, settings.gymName, settings.reminderTemplate)
      setStatuses((p) => ({ ...p, [m.id]: ok ? 'sent' : 'failed' }))
    }
    setSending(false)
  }

  async function retrySingle(id: string) {
    const m = members.find((x) => x.id === id)
    if (!m) return
    setStatuses((p) => ({ ...p, [id]: 'sending' }))
    const ok = await sendWhatsAppReminder(m, settings.gymName, settings.reminderTemplate)
    setStatuses((p) => ({ ...p, [id]: ok ? 'sent' : 'failed' }))
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col md:items-center md:justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={!sending ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative bg-white w-full md:w-[480px] rounded-t-3xl md:rounded-2xl mt-auto md:mt-0 max-h-[88vh] flex flex-col shadow-2xl animate-slide-up md:animate-scale-in"
      >
        {/* Top accent */}
        <div className="h-1 rounded-t-3xl md:rounded-t-2xl" style={{ background: 'linear-gradient(90deg,#25D366,#128C7E)' }} aria-hidden="true" />

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)' }}
            aria-hidden="true"
          >
            <WhatsAppIcon size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-slate-800 text-base">{title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            disabled={sending}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors disabled:opacity-40"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress bar when sending */}
        {started && (
          <div
            className="px-5 py-3 border-b border-slate-100 flex items-center gap-4"
            style={{ background: 'linear-gradient(135deg,#F0FFF4,#ECFDF5)' }}
            role="status"
            aria-live="polite"
          >
            <span className="text-sm font-bold text-emerald-700">✓ {sentCount} sent</span>
            {failedCount > 0 && <span className="text-sm font-bold text-red-600">✗ {failedCount} failed</span>}
            {sending && <span className="text-xs text-slate-500 ml-auto">Sending…</span>}
            {allDone && <span className="text-xs text-slate-500 ml-auto font-semibold">All done</span>}
          </div>
        )}

        {/* Member list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {members.map((m) => {
            const st      = statuses[m.id]
            const pending = pendingAmount(m)
            return (
              <div key={m.id} className="flex items-center gap-3.5 px-5 py-3.5 border-b border-slate-50">
                <img
                  src={m.photo}
                  alt=""
                  aria-hidden="true"
                  className="w-10 h-10 rounded-xl object-cover flex-shrink-0 shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-800 truncate">{m.name}</p>
                  <p className="text-xs text-slate-400 truncate">+91 {m.mobile}</p>
                  {pending > 0 && (
                    <p className="text-xs font-semibold text-red-500">Due {formatCurrency(pending)}</p>
                  )}
                </div>
                <StatusIcon status={st} onRetry={() => retrySingle(m.id)} />
              </div>
            )
          })}
        </div>

        {/* CTA footer */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100">
          {!started ? (
            <button
              onClick={sendAll}
              className="btn-whatsapp w-full justify-center min-h-[50px] text-base"
            >
              <WhatsAppIcon size={16} />
              Send to All {members.length} Members
            </button>
          ) : allDone ? (
            <button onClick={onClose} className="btn-secondary w-full justify-center min-h-[50px]">
              Done
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 text-sm text-slate-400 min-h-[50px]" role="status">
              <Loader2 size={16} className="animate-spin" />
              Sending reminders one by one…
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusIcon({ status, onRetry }: { status: Status; onRetry: () => void }) {
  if (status === 'pending') {
    return <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex-shrink-0" aria-label="Pending" />
  }
  if (status === 'sending') {
    return <Loader2 size={20} className="text-indigo-500 animate-spin flex-shrink-0" aria-label="Sending" />
  }
  if (status === 'sent') {
    return <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" aria-label="Sent" />
  }
  return (
    <button
      onClick={onRetry}
      aria-label="Retry"
      className="flex items-center gap-1 text-red-500 text-xs font-bold flex-shrink-0 hover:text-red-700 transition-colors"
    >
      <XCircle size={16} />
      <RefreshCw size={12} />
    </button>
  )
}
