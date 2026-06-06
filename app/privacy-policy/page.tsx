import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Saskia Cleaning Services",
  description:
    "Learn how Saskia Cleaning Services collects, uses, and protects your personal information.",
};

const effectiveDate = "June 4, 2026";

export default function PrivacyPolicyPage() {
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

        <h1 className="font-heading mt-4 text-[clamp(2.4rem,4vw,3.75rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-slate-950">
          Privacy Policy
        </h1>

        <p className="mt-5 text-sm leading-7 text-slate-500">
          Effective Date: {effectiveDate}
          <br />
          Last Updated: {effectiveDate}
        </p>

        <p className="mt-8 text-[15px] leading-8 text-slate-600">
          Saskia Cleaning Services, we respect your privacy. This
          Privacy Policy explains how we collect, use, share, and safeguard
          information when you visit our website, request a quote, book a
          service, or communicate with us by phone, email, or text message.
        </p>

        <article className="mt-12 space-y-10 text-[15px] leading-8 text-slate-600">
          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Information We Collect
            </h2>
            <p className="mt-4">
              We may collect the following categories of information, depending
              on how you interact with us:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>
                Contact details such as your name, phone number, and email
                address
              </li>
              <li>
                Service-related details such as property address, access
                instructions, service preferences, and scheduling notes
              </li>
              <li>
                Billing and payment-related information needed to process
                transactions
              </li>
              <li>
                Communications you send us, including quote requests, service
                feedback, and support messages
              </li>
              <li>
                Technical information such as browser type, device data, IP
                address, and pages viewed on our website
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              How We Use Information
            </h2>
            <p className="mt-4">We use personal information to:</p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>Provide residential, commercial, Airbnb, laundry, and related cleaning services</li>
              <li>Prepare quotes, estimates, and service proposals</li>
              <li>Schedule, confirm, reschedule, or follow up on appointments</li>
              <li>Respond to inquiries and provide customer support</li>
              <li>Process payments and maintain billing records</li>
              <li>Improve our website, operations, and client experience</li>
              <li>Comply with legal, regulatory, and safety obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              SMS and Text Message Consent
            </h2>
            <p className="mt-4">
              If you provide your mobile number and opt in to receive text
              messages from Saskia Cleaning Services, you consent to receive
              service-related communications such as appointment confirmations,
              scheduling updates, arrival notices, and customer support messages.
            </p>
            <p className="mt-4">
              Message frequency may vary. Message and data rates may apply
              depending on your carrier plan. You may opt out of marketing texts
              at any time by replying STOP. For help, reply HELP or contact us
              using the information below. We do not sell your phone number or
              text consent to third parties for their own marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              How Information Is Shared
            </h2>
            <p className="mt-4">
              We do not sell your personal information. We may share information
              only as reasonably necessary to operate our business, including
              with:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>Team members and authorized contractors who perform services on our behalf</li>
              <li>
                Payment processors, scheduling tools, and other service providers
                that help us deliver and manage our operations
              </li>
              <li>Professional advisors such as accountants or legal counsel when required</li>
              <li>Law enforcement or government authorities when required by law</li>
            </ul>
            <p className="mt-4">
              Any third party that receives information on our behalf is expected
              to use it only for the purpose for which it was provided and to
              protect it appropriately.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Cookies and Analytics
            </h2>
            <p className="mt-4">
              Our website may use cookies, pixels, and similar technologies to
              remember preferences, understand site traffic, and improve
              performance. Analytics tools may collect aggregated usage data
              such as pages visited, time on site, and referral sources.
            </p>
            <p className="mt-4">
              You can adjust cookie settings through your browser. Disabling
              certain cookies may affect website functionality.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Data Security
            </h2>
            <p className="mt-4">
              We use reasonable administrative, technical, and organizational
              safeguards designed to protect personal information against
              unauthorized access, loss, misuse, or alteration. No method of
              transmission or storage is completely secure, and we cannot
              guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Your Choices
            </h2>
            <p className="mt-4">
              Depending on your location and applicable law, you may request
              access to, correction of, or deletion of certain personal
              information we maintain. You may also opt out of marketing
              communications and manage text message preferences as described
              above.
            </p>
            <p className="mt-4">
              To make a privacy-related request, contact us using the details
              below. We may need to verify your identity before responding.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Children&apos;s Privacy
            </h2>
            <p className="mt-4">
              Our services and website are not directed to children under 13,
              and we do not knowingly collect personal information from
              children under 13. If you believe a child has provided us with
              personal information, please contact us so we can take appropriate
              steps to remove it.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Policy Updates
            </h2>
            <p className="mt-4">
              We may update this Privacy Policy from time to time. When we do,
              we will revise the &ldquo;Last Updated&rdquo; date at the top of
              this page. Material changes may also be communicated through our
              website or by direct notice where appropriate. Continued use of our
              services after an update constitutes acceptance of the revised
              policy.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Contact Us
            </h2>
            <p className="mt-4">
              If you have questions about this Privacy Policy or our data
              practices, contact Saskia Cleaning Services:
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
