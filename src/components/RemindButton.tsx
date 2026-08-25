import { useState } from 'react'
import { Loader2, Check, RefreshCw } from 'lucide-react'
import type { Member, GymSettings } from '../types'
import { sendWhatsAppReminder } from '../utils'
import { WhatsAppIcon } from './WhatsAppIcon'

interface RemindButtonProps {
  member: Member
  settings: GymSettings
  compact?: boolean
}

export function RemindButton({ member, settings, compact = false }: RemindButtonProps) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle')

  async function handleSend(e: React.MouseEvent) {
    e.stopPropagation()
    if (state === 'sending' || state === 'sent') return
    setState('sending')
    const ok = await sendWhatsAppReminder(member, settings.gymName, settings.reminderTemplate)
    setState(ok ? 'sent' : 'failed')
    if (ok) setTimeout(() => setState('idle'), 4000)
  }

  const sz = compact ? 12 : 14
  const cls = compact
    ? 'text-[11px] px-3 py-1.5 rounded-lg min-h-[30px]'
    : 'text-sm px-4 py-2.5 rounded-xl min-h-[44px]'

  if (state === 'sent') {
    return (
      <div className={`inline-flex items-center gap-1.5 font-semibold bg-emerald-50 text-emerald-700 ${cls}`}>
        <Check size={sz} />
        Sent!
      </div>
    )
  }

  if (state === 'failed') {
    return (
      <button
        onClick={handleSend}
        aria-label="Retry sending reminder"
        className={`inline-flex items-center gap-1.5 font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors ${cls}`}
      >
        <RefreshCw size={sz} />
        Retry
      </button>
    )
  }

  return (
    <button
      onClick={handleSend}
      disabled={state === 'sending'}
      aria-label={`Send WhatsApp reminder to ${member.name}`}
      className={`inline-flex items-center gap-1.5 font-semibold text-white transition-all duration-200 disabled:opacity-60 ${cls}`}
      style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)', boxShadow: '0 2px 8px rgba(37,211,102,0.25)' }}
    >
      {state === 'sending'
        ? <Loader2 size={sz} className="animate-spin" />
        : <WhatsAppIcon size={sz} />}
      {state === 'sending' ? 'Sending…' : 'Remind'}
    </button>
  )
}
