export interface CreditPlan {
  id: string
  name: { zh: string; en: string }
  credits: number
  price: { zh: number; en: number }
  popular?: boolean
}

export interface CreditPlan {
  id: string
  name: { zh: string; en: string }
  credits: number
  price: { zh: number; en: number }
  popular?: boolean
}

export const creditPlans: CreditPlan[] = [
  {
    id: 'starter',
    name: { zh: '体验包', en: 'Starter' },
    credits: 20,
    price: { zh: 0.01, en: 0.01 },
  },
  {
    id: 'standard',
    name: { zh: '标准包', en: 'Standard' },
    credits: 200,
    price: { zh: 0.01, en: 0.01 },
    popular: true,
  },
  {
    id: 'pro',
    name: { zh: '专业包', en: 'Pro' },
    credits: 500,
    price: { zh: 0.01, en: 0.01 },
  },
  {
    id: 'enterprise',
    name: { zh: '企业包', en: 'Enterprise' },
    credits: 1500,
    price: { zh: 0.01, en: 0.01 },
  },
]