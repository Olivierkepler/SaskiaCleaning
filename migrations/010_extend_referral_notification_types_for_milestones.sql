-- Extend referral notification types for referral milestone recognition emails

ALTER TABLE referral_notifications
  DROP CONSTRAINT IF EXISTS referral_notifications_type_check;

ALTER TABLE referral_notifications
  ADD CONSTRAINT referral_notifications_type_check
  CHECK (type IN (
    'referral_completed',
    'referral_rewarded',
    'admin_reward_eligible',
    'admin_rewards_summary',
    'referral_milestone_first',
    'referral_milestone_champion',
    'referral_milestone_vip'
  ));
