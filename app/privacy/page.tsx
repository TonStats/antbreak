import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy — Antbreak',
  description:
    'Read the Antbreak privacy policy. Learn what data we collect, how we use Google AdSense, and how to control your information.',
}

const CONTACT_EMAIL = 'contact@antbreak.com'
const LAST_UPDATED  = 'May 15, 2026'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-base font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        {children}
      </div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
          <li>
            <Link href="/" className="transition-colors hover:text-zinc-800 dark:hover:text-zinc-200">
              Home
            </Link>
          </li>
          <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
          <li className="font-medium text-zinc-900 dark:text-zinc-100">Privacy Policy</li>
        </ol>
      </nav>

      <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Last updated: {LAST_UPDATED}
      </p>

      <div className="mt-8 space-y-8">

        <Section title="Overview">
          <p>
            Antbreak is committed to protecting your privacy. This policy explains what
            information is collected when you use our site, how it is used, and your
            choices regarding that information.
          </p>
        </Section>

        <Section title="Information We Collect">
          <p>
            <strong className="font-semibold text-zinc-900 dark:text-zinc-100">Locally stored data (your device only).</strong>{' '}
            Antbreak stores the following data exclusively in your browser&apos;s
            localStorage — it never leaves your device and is never sent to our servers:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Your favorite games (list of game identifiers)</li>
            <li>Your recently played history (game identifiers and timestamps)</li>
            <li>Your high scores per game</li>
            <li>Your theme preference (light or dark mode)</li>
          </ul>
          <p>
            <strong className="font-semibold text-zinc-900 dark:text-zinc-100">Anonymous analytics.</strong>{' '}
            We may collect aggregated, anonymous usage data — such as which pages are
            visited and how long sessions last — using privacy-respecting analytics tools.
            This data contains no personally identifiable information and is used solely
            to understand how the site is used and to improve it.
          </p>
          <p>
            <strong className="font-semibold text-zinc-900 dark:text-zinc-100">Server-side play counts.</strong>{' '}
            We track how many times each game has been played in aggregate (a single
            counter per game). No user identity is associated with this count.
          </p>
        </Section>

        <Section title="Google AdSense and Third-Party Advertising">
          <p>
            Antbreak displays advertisements served by Google AdSense. Google may use
            cookies and similar technologies to show you ads based on your interests and
            your prior visits to this site and other sites on the web.
          </p>
          <p>
            Google&apos;s use of advertising cookies enables it and its partners to serve ads
            based on your visit to Antbreak and/or other sites on the Internet. These
            cookies are set by Google, not by Antbreak, and are subject to{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              Google&apos;s Privacy Policy
            </a>
            .
          </p>
          <p>
            For more information about how Google uses data when you use our site, visit{' '}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              How Google uses data from sites that use Google services
            </a>
            .
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            Antbreak itself sets only functional cookies necessary for the site to
            operate (such as your theme preference). Third-party cookies may be set by
            Google AdSense as described above. You can manage cookie preferences through
            your browser settings.
          </p>
        </Section>

        <Section title="Children's Privacy">
          <p>
            Antbreak is not directed at children under the age of 13. We do not
            knowingly collect personal information from children. If you believe a child
            has provided personal information through this site, please contact us and we
            will promptly delete it.
          </p>
        </Section>

        <Section title="Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. When we do, we will
            update the &ldquo;Last updated&rdquo; date at the top of this page. Continued use of
            Antbreak after any changes constitutes acceptance of the revised policy.
          </p>
        </Section>

        <Section title="Contact Us">
          <p>
            If you have any questions or concerns about this Privacy Policy, please
            contact us at{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>

      </div>
    </div>
  )
}
