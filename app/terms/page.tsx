import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service — Antbreak',
  description:
    'Read the Antbreak Terms of Service. By using this site you agree to these terms governing access, content, and acceptable use.',
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

export default function TermsPage() {
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
          <li className="font-medium text-zinc-900 dark:text-zinc-100">Terms of Service</li>
        </ol>
      </nav>

      <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Last updated: {LAST_UPDATED}
      </p>

      <div className="mt-8 space-y-8">

        <Section title="Acceptance of Terms">
          <p>
            By accessing or using Antbreak, you agree to be bound by these
            Terms of Service. If you do not agree to these terms, please do not use the
            Site. These terms may be updated from time to time; continued use of the Site
            constitutes acceptance of any revised terms.
          </p>
        </Section>

        <Section title="Use of the Site">
          <p>
            Antbreak is provided for personal, non-commercial entertainment purposes.
            You agree to use the Site only for lawful purposes and in a manner that does
            not infringe the rights of others or restrict or inhibit their use of the Site.
          </p>
          <p>Prohibited conduct includes but is not limited to:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="font-semibold text-zinc-900 dark:text-zinc-100">Scraping or automated access.</strong>{' '}
              You must not use bots, scrapers, crawlers, or other automated tools to
              access, index, or harvest content from the Site without our express written
              permission.
            </li>
            <li>
              <strong className="font-semibold text-zinc-900 dark:text-zinc-100">Abuse or overloading.</strong>{' '}
              You must not attempt to overload, disrupt, or damage the Site&apos;s
              infrastructure, including through denial-of-service attacks or excessive
              automated requests.
            </li>
            <li>
              <strong className="font-semibold text-zinc-900 dark:text-zinc-100">Ad circumvention.</strong>{' '}
              You must not use technical means to bypass, block, or manipulate the
              advertising systems that fund the Site.
            </li>
            <li>
              <strong className="font-semibold text-zinc-900 dark:text-zinc-100">Malicious use.</strong>{' '}
              You must not use the Site to distribute malware, conduct phishing attacks,
              or engage in any other harmful or illegal activity.
            </li>
          </ul>
        </Section>

        <Section title="Content and Intellectual Property">
          <p>
            <strong className="font-semibold text-zinc-900 dark:text-zinc-100">Antbreak Originals.</strong>{' '}
            All original games, artwork, code, and written content created by Antbreak
            are the intellectual property of Antbreak and are protected by applicable
            copyright and trademark laws. You may not reproduce, redistribute, or create
            derivative works without express written permission.
          </p>
          <p>
            <strong className="font-semibold text-zinc-900 dark:text-zinc-100">Third-party games.</strong>{' '}
            Games on the Site that are not Antbreak Originals are the property of their
            respective creators and are embedded under licence or with permission. All
            third-party trademarks, game names, and associated intellectual property
            remain the property of their owners.
          </p>
          <p>
            <strong className="font-semibold text-zinc-900 dark:text-zinc-100">User content.</strong>{' '}
            Antbreak does not currently allow user-generated content. If this changes,
            separate terms will apply.
          </p>
        </Section>

        <Section title="Disclaimer of Warranties">
          <p>
            The Site is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any
            kind, either express or implied. Antbreak does not warrant that the Site
            will be uninterrupted, error-free, or free of viruses or other harmful
            components.
          </p>
          <p>
            <strong className="font-semibold text-zinc-900 dark:text-zinc-100">No warranty on game availability.</strong>{' '}
            Games may be added, modified, or removed at any time without notice. We make
            no guarantee that any specific game will remain available on the platform.
          </p>
        </Section>

        <Section title="Limitation of Liability">
          <p>
            To the fullest extent permitted by law, Antbreak and its operators shall not
            be liable for any indirect, incidental, special, consequential, or punitive
            damages arising from your use of, or inability to use, the Site — including
            loss of data, loss of profits, or loss of goodwill.
          </p>
        </Section>

        <Section title="Third-Party Links and Services">
          <p>
            The Site may contain links to third-party websites or embed third-party
            services (including games and advertising). Antbreak is not responsible for
            the content, privacy practices, or terms of any third-party site or service.
            Your use of third-party services is at your own risk.
          </p>
        </Section>

        <Section title="Changes to These Terms">
          <p>
            We reserve the right to modify these Terms of Service at any time. Changes
            will be posted on this page with an updated &ldquo;Last updated&rdquo; date. Your
            continued use of the Site after changes are posted constitutes acceptance of
            the revised terms.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about these Terms? Contact us at{' '}
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
