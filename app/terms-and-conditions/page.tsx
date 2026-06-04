import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Saskia Cleaning Services",
  description:
    "Review the terms and conditions for booking cleaning services with Saskia Cleaning Services.",
};

const effectiveDate = "June 4, 2026";

export default function TermsAndConditionsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white px-6 py-24 sm:px-8 sm:py-28 lg:px-16">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[70rem] -translate-x-1/2 rounded-full bg-sky-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-500 transition hover:text-sky-600"
        >
          <span aria-hidden="true">←</span>
          Back to home
        </Link>

        <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.26em] text-sky-500">
          Legal
        </p>

        <h1 className="mt-4 font-[family-name:var(--font-cormorant)] text-[clamp(2.4rem,4vw,3.75rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-slate-950">
          Terms &amp; Conditions
        </h1>

        <p className="mt-5 text-sm leading-7 text-slate-500">
          Effective Date: {effectiveDate}
          <br />
          Last Updated: {effectiveDate}
        </p>

        <p className="mt-8 text-[15px] leading-8 text-slate-600">
          These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your use of
          the Saskia Cleaning Services website and your purchase or receipt of
          cleaning services from Saskia Cleaning Services (&ldquo;Saskia,&rdquo;
          &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By
          requesting a quote, booking a service, or allowing us to perform work
          at your property, you agree to these Terms.
        </p>

        <article className="mt-12 space-y-10 text-[15px] leading-8 text-slate-600">
          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Services
            </h2>
            <p className="mt-4">
              Saskia Cleaning Services provides professional cleaning throughout
              the Boston area and greater Massachusetts, including residential
              cleaning, commercial cleaning, Airbnb and turnover cleaning,
              laundry services, move-in/move-out cleaning, deep cleaning, and
              selected add-on services. Specific tasks included in each visit
              depend on the service type, property condition, and agreed scope
              of work.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Quotes and Estimates
            </h2>
            <p className="mt-4">
              Quotes and estimates are based on information you provide, including
              property size, service type, frequency, and requested add-ons.
              Final pricing may be adjusted if actual conditions differ materially
              from what was disclosed, if additional time or specialty work is
              required, or if the scope of service changes before or during the
              appointment.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Booking and Scheduling
            </h2>
            <p className="mt-4">
              Appointments are confirmed once scheduling details and pricing are
              agreed upon. We strive to arrive within the scheduled service
              window and will communicate if delays occur. Access instructions,
              parking details, and any special requirements should be provided
              before the appointment.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Access to Property
            </h2>
            <p className="mt-4">
              You are responsible for ensuring our team can safely and legally
              enter the property at the scheduled time. This may include providing
              keys, codes, lockbox access, concierge approval, or on-site
              presence where required. If we are unable to access the property,
              the appointment may be treated as a late cancellation or missed
              appointment in accordance with these Terms.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Cancellations and Rescheduling
            </h2>
            <p className="mt-4">
              Please provide reasonable advance notice if you need to cancel or
              reschedule. Late cancellations, same-day changes, or missed
              appointments may result in a cancellation fee or charge for reserved
              time, especially for commercial accounts, move-out services, or
              large appointments. We will communicate any applicable fees before
              they are assessed whenever possible.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Payment
            </h2>
            <p className="mt-4">
              Payment terms are confirmed at booking. Unless otherwise agreed,
              payment is due upon completion of service or according to the
              billing schedule for recurring clients. Late or returned payments
              may pause future service until the account is current. You agree
              to provide accurate billing information and authorize charges for
              approved services.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Satisfaction Policy
            </h2>
            <p className="mt-4">
              We stand behind the quality of our work. If you are not satisfied
              with a completed service, notify us within a reasonable period,
              typically within 24 hours, and describe the concern in detail.
              Where appropriate, we may offer a re-clean of the affected area or
              another reasonable remedy. Satisfaction guarantees apply only to
              tasks included in the booked scope of work and do not cover
              pre-existing damage, missed disclosures, or conditions outside our
              control.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Cleaning Supplies
            </h2>
            <p className="mt-4">
              Unless otherwise agreed, Saskia provides standard professional
              cleaning products and equipment suitable for the booked service.
              If you request eco-only products, specialty solutions, or client-supplied
              products, please inform us in advance. We are not responsible for
              adverse results caused by non-standard, expired, or incompatible
              products supplied by the client.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Pets
            </h2>
            <p className="mt-4">
              Please disclose pets before service. For safety, pets should be
              secured in a separate area during cleaning whenever possible. We
              are not responsible for pets that escape due to doors being opened
              during service if access instructions or containment were not
              provided in advance.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Customer Responsibilities
            </h2>
            <p className="mt-4">You agree to:</p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>Provide accurate property and service information</li>
              <li>Secure valuables, cash, fragile items, and sensitive documents</li>
              <li>Disclose hazards, damage, pests, mold, biohazards, or restricted areas</li>
              <li>Maintain a reasonably safe working environment for our team</li>
              <li>Treat our staff with respect and professionalism</li>
            </ul>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Services Not Included
            </h2>
            <p className="mt-4">
              Unless explicitly added to your booking, services do not include
              hazardous waste removal, biohazard cleanup, exterior window washing
              at height, heavy lifting, pest control, construction cleanup,
              restoration work, repair services, or moving furniture beyond
              light repositioning needed to clean accessible surfaces.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Limitation of Liability
            </h2>
            <p className="mt-4">
              Saskia will perform services with reasonable care and professionalism.
              To the fullest extent permitted by law, we are not liable for
              indirect, incidental, special, consequential, or punitive damages.
              Our total liability for any claim arising out of a service visit
              is limited to the amount paid for that specific visit, except where
              a greater limitation is prohibited by applicable law.
            </p>
            <p className="mt-4">
              Any claim for damage must be reported promptly with supporting
              details. Pre-existing wear, improper installation, defective
              materials, undisclosed conditions, and items not securely stored
              may affect eligibility for remedy.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Right to Refuse Service
            </h2>
            <p className="mt-4">
              We reserve the right to decline, pause, or discontinue service if
              conditions are unsafe, unlawful, abusive, misrepresented, or outside
              our scope of work. If service is stopped for these reasons, applicable
              fees for time spent or scheduled work may still apply.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              SMS and Text Consent
            </h2>
            <p className="mt-4">
              By providing your mobile number and opting in, you consent to receive
              service-related text messages from Saskia Cleaning Services, including
              scheduling confirmations and updates. Message frequency varies.
              Message and data rates may apply. Reply STOP to opt out and HELP
              for assistance. Consent to receive texts is not a condition of
              purchasing services unless expressly stated for a specific program.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Intellectual Property
            </h2>
            <p className="mt-4">
              All website content, branding, logos, text, graphics, and materials
              associated with Saskia Cleaning Services are owned by or licensed
              to us and may not be copied, reproduced, or used without prior
              written permission, except for personal, non-commercial reference.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Changes to Terms
            </h2>
            <p className="mt-4">
              We may update these Terms from time to time. The revised version
              will be posted on this page with an updated &ldquo;Last
              Updated&rdquo; date. Continued use of our website or services
              after changes become effective constitutes acceptance of the revised
              Terms.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Governing Law
            </h2>
            <p className="mt-4">
              These Terms are governed by the laws of the Commonwealth of
              Massachusetts, without regard to conflict-of-law principles. Any
              dispute arising from these Terms or our services shall be handled
              in accordance with applicable Massachusetts law and venue requirements.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Contact Information
            </h2>
            <p className="mt-4">
              For questions about these Terms, contact Saskia Cleaning Services:
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                Phone/Text:{" "}
                <a
                  href="tel:+18573528554"
                  className="text-sky-600 underline-offset-2 hover:underline"
                >
                  (857) 352-8554
                </a>
              </li>
              <li>
                Email:{" "}
                <a
                  href="mailto:cleaningsaskia@gmail.com"
                  className="text-sky-600 underline-offset-2 hover:underline"
                >
                  cleaningsaskia@gmail.com
                </a>
              </li>
              <li>Service Area: Boston area and greater Massachusetts</li>
            </ul>
          </section>
        </article>
      </div>
    </main>
  );
}
