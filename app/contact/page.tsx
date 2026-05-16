import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Mail, Gamepad2, Clock } from 'lucide-react'
import AdBanner from '@/components/AdBanner'

export const metadata: Metadata = {
  title: 'Contact — Antbreak',
  description:
    'Get in touch with the Antbreak team. Questions, game submissions, bug reports, and partnership enquiries welcome.',
}

const CONTACT_EMAIL = 'contact@antbreak.com'

export default function ContactPage() {
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
          <li className="font-medium text-zinc-900 dark:text-zinc-100">Contact</li>
        </ol>
      </nav>

      <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
        Contact Us
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        We&apos;re a small team and we read every message. Whether you&apos;ve found a bug,
        have a suggestion, or just want to say hi — we&apos;d love to hear from you.
      </p>

      {/* Contact cards */}
      <div className="mt-10 grid gap-4 sm:grid-cols-1">

        {/* General contact */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/40">
              <Mail className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                General Enquiries
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Bug reports, feedback, feature requests, and anything else — drop us a line.
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                <Mail className="h-3.5 w-3.5" />
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
        </div>

        {/* Game submissions */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
              <Gamepad2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Game Submissions
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Want your game listed on Antbreak? We&apos;re always looking for quality
                browser games to feature. Email us with a link to your game, a short
                description, and your contact details. We review every submission and
                prioritise games that are mobile-friendly, load quickly, and are safe for
                a general audience.
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=Game%20Submission`}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                <Mail className="h-3.5 w-3.5" />
                Submit a game
              </a>
            </div>
          </div>
        </div>

        {/* Response time */}
        <div className="flex items-start gap-4 rounded-2xl border border-zinc-100 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <strong className="font-semibold text-zinc-700 dark:text-zinc-300">Response time:</strong>{' '}
            We aim to reply to all messages within <strong className="font-semibold text-zinc-700 dark:text-zinc-300">2–3 business days</strong>.
            Game submissions may take up to two weeks to review.
          </p>
        </div>

      </div>

      {/* Responsive ad — bottom of page */}
      {/* AdSense Responsive — insert ad unit here */}
      <AdBanner size="responsive" className="mt-10" />
    </div>
  )
}
