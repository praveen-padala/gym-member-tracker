import { useState } from 'react'
import { X, ArrowLeft, Camera, CalendarDays, IndianRupee, UserPlus } from 'lucide-react'
import type { Member, PlanDuration } from '../types'
import { addMonths, todayISO, formatDate } from '../utils'

interface AddMemberProps {
  onAdd: (member: Member) => void
  onClose: () => void
}

const PLANS: { value: PlanDuration; label: string; sub: string }[] = [
  { value: 1,  label: '1 Month',   sub: '30 days' },
  { value: 3,  label: '3 Months',  sub: '90 days' },
  { value: 6,  label: '6 Months',  sub: '180 days' },
  { value: 12, label: '12 Months', sub: '1 year' },
]

export function AddMember({ onAdd, onClose }: AddMemberProps) {
  const [step, setStep]               = useState<1 | 2>(1)
  const [name, setName]               = useState('')
  const [photo, setPhoto]             = useState('')
  const [mobile, setMobile]           = useState('')
  const [joinDate, setJoinDate]       = useState(todayISO())
  const [plan, setPlan]               = useState<PlanDuration>(1)
  const [totalAmount, setTotalAmount] = useState('')
  const [amountPaid, setAmountPaid]   = useState('')

  const expiryDate = addMonths(joinDate, plan)

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') setPhoto(ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    setStep(2)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const initials = name.trim().split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    const photoSrc =
      photo ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=6366F1&color=ffffff&size=128&bold=true`
    const paid  = parseFloat(amountPaid) || 0
    const total = parseFloat(totalAmount) || 0
    const id    = Math.random().toString(36).slice(2, 10)
    const payments = paid > 0 ? [{ id: Math.random().toString(36).slice(2, 10), date: joinDate, amount: paid }] : []
    onAdd({ id, name: name.trim(), photo: photoSrc, mobile: mobile.trim(), joinDate, planDuration: plan, expiryDate, totalAmount: total, amountPaid: paid, payments })
    onClose()
  }

  /* ── shared step header (mobile) ── */
  function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
    return (
      <div className="flex-shrink-0">
        {/* Nav row */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <button
            type="button"
            onClick={step === 1 ? onClose : () => setStep(1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
            aria-label={step === 1 ? 'Close' : 'Back'}
          >
            {step === 1 ? <X size={18} /> : <ArrowLeft size={18} />}
          </button>
          <div className="text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Step {step} of 2</p>
          </div>
          {/* Spacer */}
          <div className="w-9" />
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-slate-100">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: step === 1 ? '50%' : '100%',
              background: 'linear-gradient(90deg,#6366F1,#A855F7)',
            }}
          />
        </div>

        {/* Title */}
        <div className="px-5 pt-6 pb-2">
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          <p className="text-slate-400 text-sm mt-1">{subtitle}</p>
        </div>
      </div>
    )
  }

  /* ════════════════════════════════════════════════
     MOBILE — full screen, two steps
  ════════════════════════════════════════════════ */
  const mobileView = (
    <div className="md:hidden fixed inset-0 z-50 bg-white flex flex-col">

      {step === 1 && (
        <>
          <StepHeader title="Personal Details" subtitle="Start with the member's basic info" />

          <form onSubmit={handleStep1} className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex-1 px-5 py-4 space-y-5">

              {/* Photo */}
              <div className="flex flex-col items-center gap-3 py-2">
                <label htmlFor="m-photo" className="relative cursor-pointer group" aria-label="Upload member photo">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-slate-100 shadow group-hover:border-indigo-300 transition-all duration-200">
                    {photo ? (
                      <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-300">
                        <Camera size={28} />
                        <span className="text-[10px] mt-1 text-slate-400">Upload</span>
                      </div>
                    )}
                  </div>
                  <div
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md"
                    style={{ background: 'linear-gradient(135deg,#6366F1,#A855F7)' }}
                    aria-hidden="true"
                  >
                    <Camera size={12} />
                  </div>
                </label>
                <input id="m-photo" type="file" accept="image/*" onChange={handlePhoto} className="sr-only" />
                <p className="text-xs text-slate-400">Tap to upload photo (optional)</p>
              </div>

              <FormField id="m-name" label="Full Name" required>
                <input
                  id="m-name"
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Arjun Sharma"
                  className="input-field"
                />
              </FormField>

              <FormField id="m-mobile" label="Mobile Number" required>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium select-none pointer-events-none">+91</span>
                  <input
                    id="m-mobile"
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="10-digit number"
                    maxLength={10}
                    className="input-field pl-12"
                  />
                </div>
              </FormField>
            </div>

            {/* Sticky CTA */}
            <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100 bg-white">
              <button type="submit" className="btn-primary w-full justify-center text-base min-h-[52px]">
                Continue →
              </button>
            </div>
          </form>
        </>
      )}

      {step === 2 && (
        <>
          <StepHeader title="Membership Details" subtitle="Set up the plan and payment" />

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex-1 px-5 py-4 space-y-5">

              <FormField id="m-joinDate" label="Join Date" required>
                <input
                  id="m-joinDate"
                  type="date"
                  required
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  className="input-field"
                />
              </FormField>

              <fieldset>
                <legend className="block text-sm font-semibold text-slate-700 mb-2">
                  Plan Duration <span aria-hidden="true">*</span>
                </legend>
                <div className="grid grid-cols-2 gap-2.5">
                  {PLANS.map((o) => (
                    <label
                      key={o.value}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        plan === o.value
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="m-plan"
                        value={o.value}
                        checked={plan === o.value}
                        onChange={() => setPlan(o.value)}
                        className="sr-only"
                      />
                      <span className="font-bold text-sm">{o.label}</span>
                      <span className="text-xs opacity-60 mt-0.5">{o.sub}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Expiry preview */}
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: 'linear-gradient(135deg,#EEF2FF,#F5F3FF)', border: '1px solid #E0E7FF' }}
              >
                <CalendarDays size={18} className="text-indigo-400 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-xs text-indigo-400 font-semibold">Membership Expires</p>
                  <p className="text-sm font-bold text-indigo-700">{formatDate(expiryDate)}</p>
                </div>
              </div>

              <FormField id="m-total" label="Total Amount (₹)" required>
                <div className="relative">
                  <IndianRupee size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    id="m-total"
                    type="number"
                    required
                    min={0}
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="e.g. 2400"
                    className="input-field pl-9"
                  />
                </div>
              </FormField>

              <FormField id="m-paid" label="Amount Paid Now (₹)">
                <div className="relative">
                  <IndianRupee size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    id="m-paid"
                    type="number"
                    min={0}
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="0 — can pay later"
                    className="input-field pl-9"
                  />
                </div>
              </FormField>
            </div>

            {/* Sticky CTA */}
            <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100 bg-white flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary flex-1 justify-center"
              >
                ← Back
              </button>
              <button type="submit" className="btn-primary flex-1 justify-center">
                <UserPlus size={16} /> Add Member
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  )

  /* ════════════════════════════════════════════════
     DESKTOP — centered modal (single-page, unchanged)
  ════════════════════════════════════════════════ */
  const desktopView = (
    <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add Member"
        className="relative bg-white rounded-2xl w-[520px] max-h-[92vh] overflow-y-auto shadow-2xl scrollbar-thin animate-scale-in"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 flex items-center justify-between px-6 py-4 rounded-t-2xl z-10">
          <div>
            <h2 className="font-bold text-slate-800 text-lg">Add New Member</h2>
            <p className="text-xs text-slate-400 mt-0.5">Fill in the details below</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Photo */}
          <div className="flex flex-col items-center gap-3">
            <label htmlFor="d-photo" className="relative cursor-pointer group" aria-label="Upload member photo">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-slate-100 shadow-md group-hover:border-indigo-300 transition-all duration-200">
                {photo ? (
                  <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-300">
                    <Camera size={28} />
                    <span className="text-[10px] mt-1 text-slate-400">Upload</span>
                  </div>
                )}
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm"
                style={{ background: 'linear-gradient(135deg,#6366F1,#A855F7)' }}
                aria-hidden="true"
              >
                <Camera size={12} />
              </div>
            </label>
            <input id="d-photo" type="file" accept="image/*" onChange={handlePhoto} className="sr-only" />
            <p className="text-xs text-slate-400">Click to upload photo (optional)</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField id="d-name" label="Full Name" required>
              <input id="d-name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Arjun Sharma" className="input-field" />
            </FormField>
            <FormField id="d-mobile" label="Mobile" required>
              <input id="d-mobile" type="tel" required value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="10 digits" maxLength={10} className="input-field" />
            </FormField>
          </div>

          <FormField id="d-joinDate" label="Join Date" required>
            <input id="d-joinDate" type="date" required value={joinDate} onChange={(e) => setJoinDate(e.target.value)} className="input-field" />
          </FormField>

          <fieldset>
            <legend className="block text-sm font-semibold text-slate-700 mb-2">Plan Duration <span aria-hidden="true">*</span></legend>
            <div className="grid grid-cols-4 gap-2">
              {PLANS.map((o) => (
                <label
                  key={o.value}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    plan === o.value ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                  }`}
                >
                  <input type="radio" name="d-plan" value={o.value} checked={plan === o.value} onChange={() => setPlan(o.value)} className="sr-only" />
                  <span className="font-bold text-sm">{o.label}</span>
                  <span className="text-xs opacity-60 mt-0.5">{o.sub}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: 'linear-gradient(135deg,#EEF2FF,#F5F3FF)', border: '1px solid #E0E7FF' }}
          >
            <CalendarDays size={16} className="text-indigo-400 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs text-indigo-400 font-semibold">Membership Expires</p>
              <p className="text-sm font-bold text-indigo-700">{formatDate(expiryDate)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField id="d-total" label="Total Amount (₹)" required>
              <div className="relative">
                <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input id="d-total" type="number" required min={0} value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="2400" className="input-field pl-9" />
              </div>
            </FormField>
            <FormField id="d-paid" label="Amount Paid Now (₹)">
              <div className="relative">
                <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input id="d-paid" type="number" min={0} value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="0" className="input-field pl-9" />
              </div>
            </FormField>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" className="btn-primary flex-1 justify-center">
              <UserPlus size={15} /> Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {mobileView}
      {desktopView}
    </>
  )
}

function FormField({ id, label, required, children }: { id: string; label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label}{required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
    </div>
  )
}
