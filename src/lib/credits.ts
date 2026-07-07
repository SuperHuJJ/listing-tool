import { supabaseAdmin } from './supabase/server';

const TRIAL_KEYS: Record<string, string> = {
  generate: 'generate',
  keywords: 'keywords',
  score: 'score',
  competitor: 'competitor',
  versions: 'versions',
};

export async function useCredit(
  userId: string,
  featureKey: string,
  cost: number
): Promise<{
  type: 'trial' | 'credit';
  creditsRemaining: number;
  trialRemaining: number;
  featureKeyInternal: string;
}> {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('credits, trial_usage, phone_verified')
    .eq('id', userId)
    .single();
  if (error || !profile) throw new Error('Profile not found');

  // 检查双认证
  const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
  const emailConfirmed = userData?.user?.email_confirmed_at != null;
  const phoneVerified = profile.phone_verified === true;
  const isDualAuth = emailConfirmed && phoneVerified;

  const trialKey = TRIAL_KEYS[featureKey] || featureKey;
  const trialUsage = (profile.trial_usage as Record<string, number>) || {};
  const currentTrialRemaining = trialUsage[trialKey] || 0;

  if (isDualAuth && currentTrialRemaining > 0) {
    // 使用试用次数
    const updated = { ...trialUsage, [trialKey]: currentTrialRemaining - 1 };
    await supabaseAdmin
      .from('profiles')
      .update({ trial_usage: updated })
      .eq('id', userId);
    return {
      type: 'trial',
      creditsRemaining: profile.credits,
      trialRemaining: currentTrialRemaining - 1,
      featureKeyInternal: trialKey,
    };
  }

  // 积分不足
  if (profile.credits < cost) throw new Error('积分不足');

  // 扣除积分
  const newCredits = profile.credits - cost;
  await supabaseAdmin
    .from('profiles')
    .update({ credits: newCredits })
    .eq('id', userId);

  // 记录积分流水
  await supabaseAdmin.from('credit_logs').insert({
    user_id: userId,
    amount: -cost,
    reason: `${featureKey} 消费`,
  });

  return {
    type: 'credit',
    creditsRemaining: newCredits,
    trialRemaining: currentTrialRemaining,
    featureKeyInternal: trialKey,
  };
}

export async function refundCredit(
  userId: string,
  featureKeyInternal: string,
  type: 'trial' | 'credit',
  cost: number
) {
  if (type === 'credit') {
    // 退还积分
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();
    if (profile) {
      await supabaseAdmin
        .from('profiles')
        .update({ credits: profile.credits + cost })
        .eq('id', userId);
    }
  } else {
    // 恢复试用次数
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('trial_usage')
      .eq('id', userId)
      .single();
    if (profile) {
      const usage = (profile.trial_usage as Record<string, number>) || {};
      const current = usage[featureKeyInternal] || 0;
      usage[featureKeyInternal] = current + 1;
      await supabaseAdmin
        .from('profiles')
        .update({ trial_usage: usage })
        .eq('id', userId);
    }
  }
}