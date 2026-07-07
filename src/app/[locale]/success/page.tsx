'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/navigation';

export default function SuccessPage() {
  const t = useTranslations('Success');
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
      <p className="mb-8">{t('description')}</p>
      <Button onClick={() => router.push('/')}>{t('backHome')}</Button>
    </div>
  );
}