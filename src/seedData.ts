import type { Member, GymSettings } from './types'
import { avatarUrl, daysAgo, daysFromNow } from './utils'

function makeId(): string {
  return Math.random().toString(36).slice(2, 10)
}

function member(
  name: string,
  mobile: string,
  joinDaysAgo: number,
  planDuration: 1 | 3 | 6 | 12,
  expiryDaysFromNow: number,
  totalAmount: number,
  paidFraction: number,
): Member {
  const id = makeId()
  const joinDate = daysAgo(joinDaysAgo)
  const expiryDate = daysFromNow(expiryDaysFromNow)
  const amountPaid = Math.round(totalAmount * paidFraction)
  const photo = avatarUrl(name)

  const payments = amountPaid > 0
    ? [{ id: makeId(), date: joinDate, amount: amountPaid }]
    : []

  return { id, name, photo, mobile, joinDate, planDuration, expiryDate, totalAmount, amountPaid, payments }
}

export function buildSeedMembers(): Member[] {
  return [
    // Members 1-3 with placeholder mobile for demo
    member('Arjun Sharma',      '9999999999', 40,  3,  50,  2400, 1),
    member('Priya Mehta',       '9999999999', 20,  1,  10,  800,  1),
    member('Rohit Verma',       '9999999999', 90,  6,  90,  4200, 1),
    // Active members
    member('Sunita Nair',       '9876543210', 180, 12, 180, 6000, 1),
    member('Karan Patel',       '9876543211', 60,  3,  30,  2400, 1),
    member('Deepika Reddy',     '9876543212', 45,  3,  45,  2400, 1),
    member('Anil Kumar',        '9876543213', 200, 12, 160, 6000, 1),
    member('Meena Iyer',        '9876543214', 30,  1,  20,  800,  1),
    member('Vikram Singh',      '9876543215', 120, 6,  60,  4200, 1),
    member('Kavya Krishnan',    '9876543216', 75,  3,  15,  2400, 1), // expiring
    member('Ravi Tiwari',       '9876543217', 55,  3,  40,  2400, 1),
    member('Anjali Gupta',      '9876543218', 365, 12, 100, 6000, 1),
    member('Suresh Bhat',       '9876543219', 90,  6,  90,  4200, 1),
    member('Pooja Desai',       '9876543220', 15,  1,  25,  700,  1),
    // Expiring soon (within 7 days)
    member('Rahul Joshi',       '9876543221', 30,  1,   5,  800,  1),
    member('Sita Pillai',       '9876543222', 90,  3,   3,  2400, 1),
    member('Manish Yadav',      '9876543223', 180, 6,   6,  4200, 1),
    member('Lakshmi Rajan',     '9876543224', 365, 12,  2,  6000, 1),
    // Expired
    member('Gautam Das',        '9876543225', 60,  1,  -5,  800,  1),
    member('Neha Chopra',       '9876543226', 120, 3,  -12, 2400, 1),
    member('Dinesh Rao',        '9876543227', 200, 6,  -20, 4200, 1),
    member('Bhavna Saxena',     '9876543228', 400, 12, -30, 6000, 1),
    // Partially paid (active, pending balance)
    member('Tarun Mishra',      '9876543229', 10,  1,  20,  800,  0.5),
    member('Geeta Kulkarni',    '9876543230', 25,  3,  65,  2400, 0.5),
  ]
}

export const DEFAULT_SETTINGS: GymSettings = {
  gymName: 'Demo Gym',
  ownerName: 'Owner',
  ownerMobile: '',
  reminderTemplate:
    'Hi {name}, your {gymName} membership expires on {expiryDate}. Pending amount: {pending}. Please renew to continue. Thank you!',
}

export const STORAGE_KEY = 'gym_members'
export const SETTINGS_KEY = 'gym_settings'
