import { useState } from 'react'
import { Users, MessageCircle, IndianRupee, BarChart2 } from 'lucide-react'
import { Symbol } from '../components/Symbol'

interface LoginProps {
  onLogin: (gymName: string) => void
  onGoSignup: () => void
}

const features: { icon: React.ReactNode; text: string }[] = [
  { icon: <Users size={14} />, text: 'Member management & tracking' },
  { icon: <MessageCircle size={14} />, text: 'WhatsApp reminders in one tap' },
  { icon: <IndianRupee size={14} />, text: 'Payment & dues tracking' },
  { icon: <BarChart2 size={14} />, text: 'Monthly analytics & insights' },
]

export function Login({ onLogin, onGoSignup }: LoginProps) {
  const [gymName, setGymName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!gymName.trim()) { setError('Please enter your gym name.'); return }
    setError('')
    onLogin(gymName.trim())
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* ── Left branding panel ── */}
      <div
        className="hidden md:flex md:w-[44%] lg:w-[40%] flex-col relative overflow-hidden"
        style={{ background: '#100F1C' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.045) 1px, transparent 0)',
            backgroundSize: '26px 26px',
          }}
          aria-hidden="true"
        />
        <div
          className="absolute -top-20 -right-20 w-96 h-96 pointer-events-none rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 65%)' }}
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-16 -left-16 w-72 h-72 pointer-events-none rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(109,40,217,0.14) 0%, transparent 65%)' }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col h-full p-10 lg:p-14">
          <div className="flex items-center gap-3">
            <Symbol size={36} />
            <span className="text-white font-bold text-xl tracking-tight">GymTrack</span>
          </div>

          <div className="flex-1 flex flex-col justify-center py-10">
            <h1 className="text-3xl lg:text-[2.6rem] font-bold leading-tight" style={{ color: '#FFFFFF' }}>
              Manage your gym,<br />
              <span style={{ color: '#C4B5FD' }}>the smart way.</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed" style={{ color: '#94A3B8', maxWidth: '300px' }}>
              Everything you need to run a successful gym — members, payments, and reminders in one place.
            </p>

            <ul className="mt-9 space-y-3.5">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-3.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(124,58,237,0.18)', color: '#C4B5FD' }}
                    aria-hidden="true"
                  >
                    {f.icon}
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#CBD5E1' }}>{f.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Built for Indian gym owners
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="md:hidden flex items-center gap-3 px-6 py-4 border-b border-slate-100">
          <Symbol size={28} />
          <span className="font-bold text-slate-800 text-base">GymTrack</span>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12 md:py-0">
          <div className="w-full max-w-[360px] animate-fade-in-up">
            <div className="mb-8">
              <h2 className="text-[1.65rem] font-bold text-slate-900 tracking-tight">Welcome back</h2>
              <p className="text-slate-400 text-sm mt-1.5">Sign in to manage your gym</p>
            </div>

            {error && (
              <div role="alert" aria-live="polite" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="loginGymName" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Gym Name <span aria-hidden="true" className="text-violet-500">*</span>
                </label>
                <input
                  id="loginGymName"
                  type="text"
                  required
                  autoComplete="organization"
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  placeholder="e.g. Fitness First Gym"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all duration-200"
                  onFocus={(e) => { e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)' }}
                  onBlur={(e) => { e.target.style.boxShadow = 'none' }}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="loginPassword" className="text-sm font-semibold text-slate-700">Password</label>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-lg" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
                    Demo: any value
                  </span>
                </div>
                <input
                  id="loginPassword"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all duration-200"
                  onFocus={(e) => { e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)' }}
                  onBlur={(e) => { e.target.style.boxShadow = 'none' }}
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl py-3.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 min-h-[48px] mt-1"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', boxShadow: '0 4px 16px rgba(109,40,217,0.4)' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(109,40,217,0.5)' }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(109,40,217,0.4)' }}
              >
                Sign In →
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-300 font-medium tracking-wide">OR</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <p className="text-center text-sm text-slate-400">
              New to GymTrack?{' '}
              <button
                onClick={onGoSignup}
                className="font-bold transition-colors hover:opacity-80 focus:outline-none"
                style={{ color: '#7C3AED' }}
              >
                Create a free account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
