export type PlanDuration = 1 | 3 | 6 | 12

export interface Payment {
  id: string
  date: string
  amount: number
}

export interface Member {
  id: string
  name: string
  photo: string
  mobile: string
  joinDate: string
  planDuration: PlanDuration
  expiryDate: string
  totalAmount: number
  amountPaid: number
  payments: Payment[]
}

export type Screen = 'login' | 'signup' | 'dashboard' | 'members' | 'analytics' | 'settings'
export type MemberFilter = 'all' | 'active' | 'expiring' | 'expired'

export interface GymSettings {
  gymName: string
  ownerName: string
  ownerMobile: string
  reminderTemplate: string
}

export type MemberStatus = 'active' | 'expiring' | 'expired'
