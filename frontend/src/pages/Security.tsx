import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Replaces the "Bank-level encryption" chip that used to sit on the login page.
 * That claim was unverifiable and, at the time it was written, untrue in the
 * ways that mattered: several endpoints were accepting unauthenticated
 * requests. A page that names what is actually done is worth more than a badge,
 * and it can be corrected when the answer changes.
 *
 * Every line below is a statement about the running system. Do not add one that
 * is not.
 */

const FACTS: { q: string; a: string }[] = [
    {
        q: 'How is my password stored?',
        a: 'It is not. We store a bcrypt hash of it, at cost factor 10. Nobody at WarrantyPro can read your password, and a copy of the database does not reveal it.',
    },
    {
        q: 'Who can see my records?',
        a: 'Only your account. Every warranty, claim and notification is filtered by the signed-in user on the server, not hidden in the interface. Requesting another account\'s record returns a 404 rather than a redirect.',
    },
    {
        q: 'Is the connection encrypted?',
        a: 'Yes. The site is served over HTTPS only, and the database connection uses TLS.',
    },
    {
        q: 'Where does the receipt image go?',
        a: 'To Google Gemini, which reads it and returns the product, date and price as text. The image is used for that one request and is not kept by us afterwards.',
    },
    {
        q: 'What does the claim assistant see?',
        a: 'The product, brand, purchase date, warranty length and whatever you type about the fault. It is sent to Google Gemini to draft the email. It does not see your email address, your other records or your password.',
    },
    {
        q: 'Can I delete everything?',
        a: 'Deleting a warranty removes the record, its reminders and any claims filed against it. There is no soft delete and no archive copy.',
    },
];

const HONEST = [
    'WarrantyPro is a small project, not a certified provider. There is no SOC 2 report and it would be misleading to imply one.',
    "Receipt images and fault descriptions are both sent to Google Gemini. Their handling is governed by Google's terms, not ours.",
    'If that is not acceptable for a particular purchase, type the details in by hand instead of photographing the receipt.',
];

export const Security = () => (
    <div className="min-h-[100dvh] bg-paper">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
            <Link to="/" className="page-back">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back
            </Link>

            <h1 className="max-w-[18ch] font-display text-display-l text-ink">
                What we do with your data
            </h1>
            <p className="mt-5 max-w-[58ch] text-body text-ink-muted">
                Written as answers rather than assurances, so you can check them against what the
                product actually does.
            </p>

            <dl className="mt-12 grid gap-8">
                {FACTS.map(({ q, a }) => (
                    <div key={q} className="border-t border-rule pt-5">
                        <dt className="font-display text-heading text-ink">{q}</dt>
                        <dd className="mt-2 max-w-[62ch] text-body text-ink-muted">{a}</dd>
                    </div>
                ))}
            </dl>

            <section className="mt-14 rounded-surface border border-rule bg-surface p-6">
                <h2 className="font-display text-heading text-ink">Where we would rather be honest</h2>
                <ul className="mt-4 grid gap-3">
                    {HONEST.map((line) => (
                        <li key={line} className="max-w-[62ch] text-body text-ink-muted">
                            {line}
                        </li>
                    ))}
                </ul>
            </section>

            <p className="mt-10 text-label text-neutral">
                Something here out of date or wrong? It should be fixed rather than reworded.
            </p>
        </div>
    </div>
);
