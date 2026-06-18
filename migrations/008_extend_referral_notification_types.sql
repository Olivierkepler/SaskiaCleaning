-- Extend referral notification types for admin payout reminders

ALTER TABLE referral_notifications
  DROP CONSTRAINT IF EXISTS referral_notifications_type_check;

ALTER TABLE referral_notifications
  ADD CONSTRAINT referral_notifications_type_check
  CHECK (type IN (
    'referral_completed',
    'referral_rewarded',
    'admin_reward_eligible',
    'admin_rewards_summary'
  ));
