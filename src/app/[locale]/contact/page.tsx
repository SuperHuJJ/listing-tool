'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { Loader2, ArrowLeft, Send } from 'lucide-react'

const texts = {
  zh: {
    title: '联系我们',
    subtitle: '遇到问题或有建议？我们很乐意倾听',
    name: '姓名（选填）',
    email: '邮箱（选填）',
    message: '你的反馈或建议',
    submit: '发送反馈',
    submitting: '发送中...',
    success: '感谢你的反馈！我们会尽快处理',
    error: '发送失败，请重试',
    back: '返回主页',
  },
  en: {
    title: 'Contact Us',
    subtitle: 'Problems or suggestions? We would love to hear',
    name: 'Name (optional)',
    email: 'Email (optional)',
    message: 'Your feedback or suggestion',
    submit: 'Send Feedback',
    submitting: 'Sending...',
    success: 'Thank you for your feedback!',
    error: 'Failed to send, please try again',
    back: 'Back to Home',
  },
}

export default function ContactPage() {
  const locale = useLocale()
  const t = texts[locale as keyof typeof texts] || texts.zh
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) {
      toast.error(locale === 'zh' ? '请输入反馈内容' : 'Please enter your message')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })
      if (!res.ok) throw new Error()
      toast.success(t.success)
      setName('')
      setEmail('')
      setMessage('')
    } catch {
      toast.error(t.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen py-10 px-4"
      style={{ background: 'linear-gradient(to bottom, #f8fafc, #ffffff)' }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" className="btn-ghost" onClick={() => router.push('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">{t.title}</h1>
        </div>

        <Card className="card-listing bg-white shadow-sm">
          <CardHeader>
            <CardTitle>{t.title}</CardTitle>
            <p className="text-sm text-slate-500">{t.subtitle}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder={t.name}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-listing"
              />
              <Input
                placeholder={t.email}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-listing"
              />
              <Textarea
                placeholder={t.message}
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-listing"
                required
              />
              <Button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.submitting}</>
                ) : (
                  <><Send className="mr-2 h-4 w-4" /> {t.submit}</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button className="btn-ghost" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> {t.back}
          </Button>
        </div>
      </div>
    </div>
  )
}