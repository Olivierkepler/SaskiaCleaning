import "server-only";

import { sql } from "@/app/lib/db";
import type { CustomerRecord } from "@/app/lib/customer-auth";
import { normalizeCustomerEmail } from "@/app/lib/customer-auth-pure";
import {
  filterReferralCodesForCustomer,
} from "@/app/lib/customer-referral-ownership";
import {
  buildReferralPortalResultFromCodes,
} from "@/app/lib/referral-portal";
import type { ReferralCodeRow } from "@/app/lib/referrals";

export async function getCustomerReferralAccountData(
  customer: Pick<CustomerRecord, "id" | "email">,
) {
  const normalizedEmail = normalizeCustomerEmail(customer.email);
  const candidateRows = await sql`
    SELECT *
    FROM referral_codes
    WHERE customer_id = ${customer.id}
      OR (
        customer_id IS NULL
        AND lower(btrim(referrer_email)) = ${normalizedEmail}
      )
    ORDER BY created_at DESC, id DESC
  `;

  const codes = filterReferralCodesForCustomer(
    candidateRows as ReferralCodeRow[],
    customer,
  );

  return buildReferralPortalResultFromCodes(codes);
}
