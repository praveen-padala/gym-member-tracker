import { useState } from 'react'
import { Dumbbell, MessageCircle, User, LogOut, AlertTriangle } from 'lucide-react'
import type { GymSettings } from '../types'

interface SettingsProps {
  settings: GymSettings
  onSave: (settings: GymSettings) => void
  onResetDemo: () => void
  onLogout?: () => void
}

export function Settings({ settings, onSave, onResetDemo, onLogout }: SettingsProps) {
  const [gymName, setGymName] = useState(settings.gymName)
  const [ownerName, setOwnerName] = useState(settings.ownerName)
  const [reminderTemplate, setReminderTemplate] = useState(settings.reminderTemplate)
  const [saved, setSaved] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    onSave({ ...settings, gymName: gymName.trim(), ownerName: ownerName.trim(), reminderTemplate })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const previewVars: Record<string, string> = {
    name: 'Arjun Sharma',
    gymName: gymName || 'Your Gym',
    expiryDate: '12 Aug 2026',
    pending: '₹800',
  }
  const previewText = reminderTemplate.replace(/\{(\w+)\}/g, (_, key) => previewVars[key] ?? `{${key}}`)

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[680px] mx-auto">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your gym profile and preferences</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 mb-6">
        {/* Gym details */}
        <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#6366F1,#A855F7)' }}
              aria-hidden="true"
            >
              <Dumbbell size={14} className="text-white" />
            </span>
            Gym Details
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="sGymName" className="block text-sm font-semibold text-slate-700 mb-1.5">Gym Name</label>
              <input id="sGymName" type="text" value={gymName} onChange={(e) => setGymName(e.target.value)} className="input-field" />
            </div>
            <div>
              <label htmlFor="sOwnerName" className="block text-sm font-semibold text-slate-700 mb-1.5">Owner Name</label>
              <input id="sOwnerName" type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="input-field" placeholder="Your name" />
            </div>
          </div>
        </div>

        {/* WhatsApp template */}
        <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h2 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center" aria-hidden="true">
              <MessageCircle size={14} className="text-white" />
            </span>
            WhatsApp Reminder Template
          </h2>
          <p className="text-xs text-slate-400 mb-4 ml-9">Customise the message sent to members</p>
          <div className="space-y-3">
            <div>
              <label htmlFor="sTemplate" className="block text-sm font-semibold text-slate-700 mb-1.5">Message</label>
              <textarea
                id="sTemplate"
                rows={4}
                value={reminderTemplate}
                onChange={(e) => setReminderTemplate(e.target.value)}
                className="input-field resize-none"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['{name}', '{gymName}', '{expiryDate}', '{pending}'].map((v) => (
                  <span key={v} className="bg-indigo-50 text-indigo-700 text-xs font-mono px-2 py-0.5 rounded-lg border border-indigo-100">{v}</span>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-400 font-semibold mb-1.5 uppercase tracking-wide">Preview</p>
              <p className="text-sm text-slate-700 leading-relaxed">{previewText}</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className={`btn-primary w-full justify-center transition-all duration-300 animate-fade-in-up ${saved ? '!bg-emerald-500' : ''}`}
          style={{ animationDelay: '300ms' }}
        >
          {saved ? '✓ Settings Saved!' : 'Save Settings'}
        </button>
      </form>

      {/* Account card — mobile only */}
      {onLogout && (
        <div className="card p-5 animate-fade-in-up md:hidden" style={{ animationDelay: '400ms' }}>
          <h2 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
            <User size={16} className="text-slate-600" aria-hidden="true" /> Account
          </h2>
          <div className="flex items-center gap-3 mt-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#6366F1,#A855F7)' }}
              aria-hidden="true"
            >
              {(settings.ownerName || settings.gymName || 'G')[0].toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-slate-800">{settings.ownerName || 'Gym Owner'}</p>
              <p className="text-sm text-slate-500">{settings.gymName}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl py-2.5 text-sm hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all duration-200 min-h-[44px]"
          >
            <LogOut size={15} aria-hidden="true" /> Sign Out
          </button>
        </div>
      )}

      {/* Danger zone */}
      <div className="card p-5 border border-red-100 animate-fade-in-up" style={{ animationDelay: '450ms' }}>
        <h2 className="font-bold text-red-700 mb-1 flex items-center gap-2">
          <AlertTriangle size={16} aria-hidden="true" /> Danger Zone
        </h2>
        <p className="text-xs text-slate-500 mb-4">This will wipe all members and reload the 24 demo members. This cannot be undone.</p>

        {confirmReset ? (
          <div className="space-y-3" role="alert" aria-live="polite">
            <p className="text-sm font-semibold text-red-700 bg-red-50 rounded-xl px-4 py-3">
              Are you sure? All current data will be replaced with demo data.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmReset(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={() => { onResetDemo(); setConfirmReset(false) }} className="btn-danger flex-1 justify-center">
                Yes, Reset Data
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="w-full border-2 border-red-200 text-red-600 font-semibold rounded-xl py-2.5 text-sm hover:bg-red-50 hover:border-red-400 transition-all duration-200 min-h-[44px]"
          >
            Reset Demo Data
          </button>
        )}
      </div>
    </div>
  )
}
