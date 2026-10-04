import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  filterReferralCodesForCustomer,
  findUniqueLegacyReferralOwnerId,
  isReferralCodeOwnedByCustomer,
  resolveReferralCodeOwnerId,
} from "../app/lib/customer-referral-ownership";
import {
  computeReferralRewardWallet,
  parsePublicReferralCodeInput,
  type ReferralCodeRow,
  type ReferralRow,
} from "../app/lib/referrals";

const customerA = { id: "customer-a", email: "ada@example.com" };

function code(
  id: number,
  customerId: string | null,
  email: string | null,
): ReferralCodeRow {
  return {
    id,
    code: `ADA${id}20`,
    referrer_name: "Ada",
    referrer_email: email,
    customer_id: customerId,
    reward_amount: 20,
    friend_discount_amount: 20,
    is_active: true,
    usage_count: 0,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  } as ReferralCodeRow;
}

function referral(
  id: number,
  status: ReferralRow["status"],
  rewardAmount: number,
  payoutAmount: number | null = null,
): ReferralRow {
  return {
    id,
    referral_code_id: 1,
    code: "ADA20",
    booking_request_id: id,
    referred_name: "Friend",
    referred_email: `friend${id}@example.com`,
    reward_amount: rewardAmount,
    friend_discount_amount: 20,
    status,
    payout_amount: payoutAmount,
    payout_method: null,
    payout_notes: null,
    rewarded_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  };
}

describe("authenticated referral account authorization", () => {
  it("keeps customer authentication on the referrals page", () => {
    const source = readFileSync("app/account/referrals/page.tsx", "utf8");
    assert.match(source, /await requireCustomer\("\/login"\)/);
  });

  it("keeps customer authentication on the rewards page", () => {
    const source = readFileSync("app/account/rewards/page.tsx", "utf8");
    assert.match(source, /await requireCustomer\("\/login"\)/);
  });
});

describe("referral code ownership", () => {
  it("includes codes explicitly owned by customer A", () => {
    assert.equal(isReferralCodeOwnedByCustomer(code(1, customerA.id, null), customerA), true);
  });

  it("excludes codes explicitly owned by customer B", () => {
    assert.equal(isReferralCodeOwnedByCustomer(code(1, "customer-b", customerA.email), customerA), false);
  });

  it("includes a legacy unowned code when its email matches customer A", () => {
    assert.equal(isReferralCodeOwnedByCustomer(code(1, null, " ADA@EXAMPLE.COM "), customerA), true);
  });

  it("does not use email fallback when another customer ID is present", () => {
    assert.equal(isReferralCodeOwnedByCustomer(code(1, "customer-b", customerA.email), customerA), false);
  });

  it("excludes legacy codes with unrelated email", () => {
    assert.equal(isReferralCodeOwnedByCustomer(code(1, null, "other@example.com"), customerA), false);
  });

  it("safely returns multiple codes owned by one customer", () => {
    const owned = filterReferralCodesForCustomer(
      [code(1, customerA.id, null), code(2, null, customerA.email), code(3, "customer-b", customerA.email)],
      customerA,
    );
    assert.deepEqual(owned.map((item) => item.id), [1, 2]);
  });

  it("returns a safe empty result when there are no owned codes", () => {
    assert.deepEqual(filterReferralCodesForCustomer([], customerA), []);
  });
});

describe("referral code creation ownership", () => {
  it("keeps anonymous public code creation valid with no owner", () => {
    const parsed = parsePublicReferralCodeInput({ referrerName: "Ada" });
    assert.deepEqual(parsed, {
      data: { referrerName: "Ada", referrerEmail: null },
    });
    assert.equal(resolveReferralCodeOwnerId(null), null);
  });

  it("uses the server-resolved signed-in customer ID", () => {
    assert.equal(resolveReferralCodeOwnerId(customerA), customerA.id);
  });

  it("ignores client-supplied customer ownership", () => {
    const parsed = parsePublicReferralCodeInput({
      referrerName: "Ada",
      referrerEmail: "ada@example.com",
      customerId: "customer-b",
    });
    assert.deepEqual(parsed, {
      data: { referrerName: "Ada", referrerEmail: "ada@example.com" },
    });
    assert.equal(resolveReferralCodeOwnerId(customerA), customerA.id);
  });
});

describe("legacy ownership backfill and reward totals", () => {
  it("resolves a normalized legacy email only when it matches one customer", () => {
    assert.equal(
      findUniqueLegacyReferralOwnerId(" ADA@EXAMPLE.COM ", [customerA]),
      customerA.id,
    );
  });

  it("leaves unmatched or ambiguous legacy email ownership unresolved", () => {
    const duplicateCustomers = [customerA, { id: "customer-a2", email: customerA.email }];
    assert.equal(findUniqueLegacyReferralOwnerId("missing@example.com", [customerA]), null);
    assert.equal(findUniqueLegacyReferralOwnerId(customerA.email, duplicateCustomers), null);
    assert.equal(findUniqueLegacyReferralOwnerId(null, [customerA]), null);
  });

  it("aggregates pending, completed, rewarded, and cancelled amounts by current status rules", () => {
    const wallet = computeReferralRewardWallet([
      referral(1, "pending", 20),
      referral(2, "completed", 20),
      referral(3, "rewarded", 20, 18),
      referral(4, "cancelled", 20),
    ]);

    assert.deepEqual(wallet, {
      pendingRewards: 20,
      availableRewards: 20,
      paidRewards: 18,
      lifetimeEarnings: 40,
      outstandingRewards: 20,
      totalReferrals: 3,
      completedReferrals: 1,
      rewardedReferrals: 1,
      referralsStarted: 3,
      completedCleanings: 2,
      rewardsPaid: 1,
    });
  });
});
