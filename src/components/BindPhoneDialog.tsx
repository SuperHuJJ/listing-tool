'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import Turnstile from 'react-turnstile'

interface Props {
  locale: string
  onSuccess: () => void
}

export default function BindPhoneDialog({ locale, onSuccess }: Props) {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string>('')

  const t = {
    title: locale === 'zh' ? '绑定手机号' : 'Bind Phone',
    desc: locale === 'zh'
      ? '绑定手机号后可获得每个功能 2 次免费试用'
      : 'Get 2 free trials for each feature after binding phone',
    placeholder: locale === 'zh' ? '请输入手机号' : 'Enter phone number',
    button: locale === 'zh' ? '立即绑定' : 'Bind Now',
    binding: locale === 'zh' ? '绑定中...' : 'Binding...',
    success: locale === 'zh' ? '绑定成功，试用次数已到账' : 'Phone bound, trials granted',
    error: locale === 'zh' ? '绑定失败，请重试' : 'Binding failed',
    phoneRequired: locale === 'zh' ? '请输入手机号' : 'Please enter phone number',
    turnstileRequired: locale === 'zh' ? '请完成人机验证' : 'Please complete the captcha',
    phoneDuplicate: locale === 'zh' ? '该手机号已被其他账号绑定' : 'This phone number is already registered',
  }

  const handleBind = async () => {
    if (!phone.trim()) {
      toast.error(t.phoneRequired)
      return
    }
    if (!turnstileToken) {
      toast.error(t.turnstileRequired)
      return
    }
    setLoading(true)
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      const res = await fetch('/api/bind-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone, turnstileToken }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 409) {
          throw new Error(t.phoneDuplicate)
        }
        throw new Error(data.error || t.error)
      }
      toast.success(t.success)
      setOpen(false)
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || t.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-primary">{t.title}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.desc}</DialogDescription>
        </DialogHeader>
        <Input
          className="input-listing mt-2"
          placeholder={t.placeholder}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <div className="flex justify-center mt-4">
          <Turnstile
            sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onVerify={(token) => setTurnstileToken(token)}
            theme="light"
          />
        </div>
        <Button className="btn-primary mt-4 w-full" onClick={handleBind} disabled={loading}>
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.binding}</>
          ) : (
            t.button
          )}
        </Button>
      </DialogContent>
    </Dialog>
  )
}