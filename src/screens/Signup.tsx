import { useState } from 'react'
import { Users, MessageCircle, IndianRupee, BarChart2 } from 'lucide-react'
import { Symbol } from '../components/Symbol'
import type { GymSettings } from '../types'

interface SignupProps {
  onSignup: (settings: GymSettings) => void
  onGoLogin: () => void
}

const features: { icon: React.ReactNode; text: string }[] = [
  { icon: <Users size={14} />, text: 'Member management & tracking' },
  { icon: <MessageCircle size={14} />, text: 'WhatsApp reminders in one tap' },
  { icon: <IndianRupee size={14} />, text: 'Payment & dues tracking' },
  { icon: <BarChart2 size={14} />, text: 'Monthly analytics & insights' },
]

export function Signup({ onSignup, onGoLogin }: SignupProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [gymName, setGymName] = useState('')
  const [password, setPassword] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [ownerMobile, setOwnerMobile] = useState('')

  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    if (!gymName.trim()) return
    setStep(2)
  }

  function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    onSignup({
      gymName: gymName.trim(),
      ownerName: ownerName.trim(),
      ownerMobile: ownerMobile.trim(),
      reminderTemplate:
        'Hi {name}, your {gymName} membership expires on {expiryDate}. Pending amount: {pending}. Please renew to continue. Thank you!',
    })
  }

  const focusStyle = {
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)' },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.boxShadow = 'none' },
  }

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all duration-200'

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
              Set up your gym<br />
              <span style={{ color: '#C4B5FD' }}>in 60 seconds.</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed" style={{ color: '#94A3B8', maxWidth: '300px' }}>
              Join thousands of gym owners who track members and payments effortlessly.
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

            <div
              className="mt-8 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl self-start"
              style={{ background: 'rgba(124,58,237,0.14)', border: '1px solid rgba(196,181,253,0.2)' }}
            >
              <span className="text-base" aria-hidden="true">🎉</span>
              <span className="text-sm font-semibold" style={{ color: '#C4B5FD' }}>Free forever · No credit card needed</span>
            </div>
          </div>

          <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Built for Indian gym owners
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="md:hidden flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Symbol size={28} />
            <span className="font-bold text-slate-800">GymTrack</span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
            Step {step} of 2
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12 md:py-0">
          <div className="w-full max-w-[360px]">

            {/* Step indicators — desktop */}
            <div className="hidden md:flex items-center gap-0 mb-8">
              {([1, 2] as const).map((n, i) => (
                <div key={n} className="flex items-center flex-1">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 flex-shrink-0"
                      style={
                        step > n
                          ? { background: '#10B981', color: '#fff' }
                          : step === n
                          ? { background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff' }
                          : { background: '#F1F5F9', color: '#94A3B8' }
                      }
                    >
                      {step > n ? '✓' : n}
                    </div>
                    <span className="text-xs font-semibold whitespace-nowrap" style={{ color: step >= n ? '#1E293B' : '#94A3B8' }}>
                      {n === 1 ? 'Gym details' : 'Owner info'}
                    </span>
                  </div>
                  {i === 0 && (
                    <div
                      className="flex-1 h-px mx-3 transition-all duration-500"
                      style={{ background: step > 1 ? '#10B981' : '#E2E8F0' }}
                    />
                  )}
                </div>
              ))}
            </div>

            {step === 1 ? (
              <div className="animate-scale-in">
                <div className="mb-7">
                  <h2 className="text-[1.65rem] font-bold text-slate-900 tracking-tight">Create your account</h2>
                  <p className="text-slate-400 text-sm mt-1.5">Start with your gym details</p>
                </div>
                <form onSubmit={handleNext} className="space-y-4">
                  <div>
                    <label htmlFor="sgGymName" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Gym Name <span aria-hidden="true" className="text-violet-500">*</span>
                    </label>
                    <input
                      id="sgGymName"
                      type="text"
                      required
                      autoFocus
                      value={gymName}
                      onChange={(e) => setGymName(e.target.value)}
                      placeholder="e.g. Fitness First Gym"
                      className={inputClass}
                      {...focusStyle}
                    />
                  </div>
                  <div>
                    <label htmlFor="sgPassword" className="block text-sm font-semibold text-slate-700 mb-1.5">Create Password</label>
                    <input
                      id="sgPassword"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Choose a password"
                      className={inputClass}
                      {...focusStyle}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl py-3.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 min-h-[48px] mt-1"
                    style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', boxShadow: '0 4px 16px rgba(109,40,217,0.4)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(109,40,217,0.5)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(109,40,217,0.4)' }}
                  >
                    Continue →
                  </button>
                </form>
              </div>
            ) : (
              <div className="animate-scale-in">
                <div className="mb-7">
                  <h2 className="text-[1.65rem] font-bold text-slate-900 tracking-tight">Almost done!</h2>
                  <p className="text-slate-400 text-sm mt-1.5">Tell us about yourself</p>
                </div>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <label htmlFor="sgOwnerName" className="block text-sm font-semibold text-slate-700 mb-1.5">Your Name</label>
                    <input
                      id="sgOwnerName"
                      type="text"
                      autoFocus
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. Rajesh Kumar"
                      className={inputClass}
                      {...focusStyle}
                    />
                  </div>
                  <div>
                    <label htmlFor="sgMobile" className="block text-sm font-semibold text-slate-700 mb-1.5">Mobile Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium select-none pointer-events-none">
                        +91
                      </span>
                      <input
                        id="sgMobile"
                        type="tel"
                        value={ownerMobile}
                        onChange={(e) => setOwnerMobile(e.target.value)}
                        placeholder="10-digit mobile"
                        maxLength={10}
                        className={`${inputClass} pl-12`}
                        {...focusStyle}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 rounded-xl py-3.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all duration-200 min-h-[48px]"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-xl py-3.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 min-h-[48px]"
                      style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', boxShadow: '0 4px 16px rgba(109,40,217,0.4)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(109,40,217,0.5)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(109,40,217,0.4)' }}
                    >
                      Create Account ✓
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-300 font-medium tracking-wide">OR</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <p className="text-center text-sm text-slate-400">
              Already have an account?{' '}
              <button
                onClick={onGoLogin}
                className="font-bold transition-colors hover:opacity-80 focus:outline-none"
                style={{ color: '#7C3AED' }}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
