import { useState } from 'react'
import type { Member, PlanDuration } from '../types'
import { addMonths, todayISO, formatDate } from '../utils'

interface AddMemberProps {
  onAdd: (member: Member) => void
  onClose: () => void
}

export function AddMember({ onAdd, onClose }: AddMemberProps) {
  const [name, setName] = useState('')
  const [photo, setPhoto] = useState('')
  const [mobile, setMobile] = useState('')
  const [joinDate, setJoinDate] = useState(todayISO())
  const [planDuration, setPlanDuration] = useState<PlanDuration>(1)
  const [totalAmount, setTotalAmount] = useState('')
  const [amountPaid, setAmountPaid] = useState('')

  const expiryDate = addMonths(joinDate, planDuration)

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') setPhoto(ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const initials = name.trim().split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    const photoSrc =
      photo ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=15171C&color=ffffff&size=128&bold=true`
    const paid = parseFloat(amountPaid) || 0
    const total = parseFloat(totalAmount) || 0
    const id = Math.random().toString(36).slice(2, 10)
    const payments = paid > 0 ? [{ id: Math.random().toString(36).slice(2, 10), date: joinDate, amount: paid }] : []
    onAdd({ id, name: name.trim(), photo: photoSrc, mobile: mobile.trim(), joinDate, planDuration, expiryDate, totalAmount: total, amountPaid: paid, payments })
    onClose()
  }

  const planOptions: { value: PlanDuration; label: string; sublabel: string }[] = [
    { value: 1, label: '1 Month', sublabel: '30 days' },
    { value: 3, label: '3 Months', sublabel: '90 days' },
    { value: 6, label: '6 Months', sublabel: '180 days' },
    { value: 12, label: '12 Months', sublabel: '1 year' },
  ]

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add Member"
        className="fixed inset-x-0 bottom-0 z-50 animate-slide-up md:inset-0 md:flex md:items-center md:justify-center"
      >
        <div className="bg-white rounded-t-3xl md:rounded-2xl md:w-[520px] md:max-h-[92vh] overflow-y-auto shadow-2xl scrollbar-thin">
          <div className="sticky top-0 bg-white border-b border-slate-100 flex items-center justify-between px-6 py-4 rounded-t-3xl md:rounded-t-2xl z-10">
            <h2 className="font-bold text-slate-800 text-lg">Add New Member</h2>
            <button onClick={onClose} aria-label="Close" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors text-lg">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Photo */}
            <div className="flex flex-col items-center gap-3">
              <label htmlFor="photoInput" className="relative cursor-pointer group" aria-label="Upload member photo">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-slate-100 shadow-md group-hover:border-indigo-300 transition-all duration-200">
                  {photo ? (
                    <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                      <span className="text-2xl" aria-hidden="true">📷</span>
                      <span className="text-[10px] mt-1">Upload</span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs shadow-sm" style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)' }} aria-hidden="true">+</div>
              </label>
              <input id="photoInput" type="file" accept="image/*" onChange={handlePhoto} className="sr-only" />
              <p className="text-xs text-slate-400">Tap to upload photo</p>
            </div>

            {/* Fields */}
            <Field id="name" label="Full Name" required>
              <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Arjun Sharma" className="input-field" />
            </Field>

            <Field id="mobile" label="Mobile Number" required>
              <input id="mobile" type="tel" required value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="10-digit number" maxLength={10} className="input-field" />
            </Field>

            <Field id="joinDate" label="Join Date" required>
              <input id="joinDate" type="date" required value={joinDate} onChange={(e) => setJoinDate(e.target.value)} className="input-field" />
            </Field>

            {/* Plan duration */}
            <fieldset>
              <legend className="block text-sm font-semibold text-slate-700 mb-2">Plan Duration <span aria-hidden="true">*</span></legend>
              <div className="grid grid-cols-2 gap-2">
                {planOptions.map((o) => (
                  <label
                    key={o.value}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      planDuration === o.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="planDuration"
                      value={o.value}
                      checked={planDuration === o.value}
                      onChange={() => setPlanDuration(o.value)}
                      className="sr-only"
                    />
                    <span className="font-bold text-sm">{o.label}</span>
                    <span className="text-xs opacity-70 mt-0.5">{o.sublabel}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Auto-computed expiry */}
            <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
              <span className="text-lg" aria-hidden="true">📅</span>
              <div>
                <p className="text-xs text-indigo-500 font-medium">Expiry Date</p>
                <p className="text-sm font-bold text-indigo-700">{formatDate(expiryDate)}</p>
              </div>
            </div>

            <Field id="totalAmount" label="Total Amount (₹)" required>
              <input id="totalAmount" type="number" required min={0} value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="e.g. 2400" className="input-field" />
            </Field>

            <Field id="amountPaid" label="Amount Paid Now (₹)">
              <input id="amountPaid" type="number" min={0} value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="0 (can pay later)" className="input-field" />
            </Field>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button type="submit" className="btn-primary flex-1 justify-center">Add Member</button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

function Field({ id, label, required, children }: { id: string; label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label}{required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
    </div>
  )
}
