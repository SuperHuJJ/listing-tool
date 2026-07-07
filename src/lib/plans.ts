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
    price: { zh: 19, en: 2.99 },
  },
  {
    id: 'standard',
    name: { zh: '标准包', en: 'Standard' },
    credits: 200,
    price: { zh: 129, en: 18.99 },
    popular: true,
  },
  {
    id: 'pro',
    name: { zh: '专业包', en: 'Pro' },
    credits: 500,
    price: { zh: 249, en: 34.99 },
  },
  {
    id: 'enterprise',
    name: { zh: '企业包', en: 'Enterprise' },
    credits: 1500,
    price: { zh: 599, en: 79.99 },
  },
]