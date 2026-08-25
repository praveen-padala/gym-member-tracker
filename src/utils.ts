import type { Member, MemberStatus, PlanDuration } from './types'

export function getMemberStatus(member: Member): MemberStatus {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(member.expiryDate)
  expiry.setHours(0, 0, 0, 0)
  const diffDays = Math.floor((expiry.getTime() - today.getTime()) / 86400000)
  if (diffDays < 0) return 'expired'
  if (diffDays <= 7) return 'expiring'
  return 'active'
}

export function getDaysUntilExpiry(member: Member): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(member.expiryDate)
  expiry.setHours(0, 0, 0, 0)
  return Math.floor((expiry.getTime() - today.getTime()) / 86400000)
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatCurrency(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN')
}

export function getRelativeExpiry(member: Member): string {
  const days = getDaysUntilExpiry(member)
  if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''}`
  if (days === 0) return 'Expires today'
  if (days === 1) return 'Expires tomorrow'
  if (days <= 7) return `Expires in ${days} days`
  return `Expires on ${formatDate(member.expiryDate)}`
}

export function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split('T')[0]
}

export function pendingAmount(member: Member): number {
  return Math.max(0, member.totalAmount - member.amountPaid)
}

export function buildWhatsAppUrl(member: Member, gymName: string, template: string): string {
  const message = template
    .replace('{name}', member.name)
    .replace('{gymName}', gymName)
    .replace('{expiryDate}', formatDate(member.expiryDate))
    .replace('{pending}', formatCurrency(pendingAmount(member)))
  return `https://wa.me/91${member.mobile}?text=${encodeURIComponent(message)}`
}

// Production: POST https://graph.facebook.com/v18.0/{phoneId}/messages
export async function sendWhatsAppReminder(
  _member: Member,
  _gymName: string,
  _template: string,
): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 500 + Math.random() * 500))
  return true
}

export function avatarUrl(name: string): string {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=15171C&color=ffffff&size=128&bold=true`
}

export function planLabel(months: PlanDuration): string {
  if (months === 1) return '1 Month'
  if (months === 3) return '3 Months'
  if (months === 6) return '6 Months'
  return '12 Months'
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

export function daysFromNow(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}
