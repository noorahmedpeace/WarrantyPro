import { useState } from 'react';
import { CoverageMeter } from '../ui/CoverageMeter';

/**
 * The four-portal preview.
 *
 * Every panel below is a DESIGN, not a screenshot, and the section says so
 * twice: once in the heading area and once on the panel itself. That framing is
 * the whole reason this can exist on a site whose closing line promises nothing
 * invented. What ships today is the consumer product; this is what the platform
 * is being built toward, drawn at full fidelity so a brand can react to it
 * before either of us spends a month on the backend.
 *
 * Each portal is drawn in its own aesthetic on purpose, because they serve four
 * different people: the buyer gets light and white-labelled, the merchant gets
 * dense and dark, the supplier gets an accounting ledger, the operator gets a
 * cockpit. The Brand Admin panel renders the real shipped CoverageMeter, so at
 * least one quarter of this is the actual product.
 */

type PortalKey = 'customer' | 'brand' | 'supplier' | 'platform';

const TABS: { key: PortalKey; n: string; label: string; who: string }[] = [
    { key: 'customer', n: '01', label: 'Customer', who: 'The buyer' },
    { key: 'brand', n: '02', label: 'Brand admin', who: 'Support and ops' },
    { key: 'supplier', n: '03', label: 'Supplier', who: 'Component factories' },
    { key: 'platform', n: '04', label: 'Platform', who: 'Us' },
];

/* ── 01 Customer: light, white-labelled, phone-shaped ──────────────────── */
const CustomerPanel = () => (
    <div className="mx-auto w-full max-w-[320px] overflow-hidden rounded-[1.6rem] border border-white/10 bg-white shadow-overlay">
        <div className="flex items-center justify-between bg-[#2563EB] px-4 py-3">
            <span className="text-[0.8rem] font-semibold text-white">AeroTech</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-medium text-white">
                warranty.aerotech.com
            </span>
        </div>

        <div className="px-4 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A90A0]">
                Claim CLM-9482
            </p>
            <p className="mt-1 text-[0.95rem] font-semibold text-[#141821]">AeroTech Buds Pro</p>

            <ol className="mt-5 grid gap-0">
                {[
                    { label: 'Claim submitted', done: true },
                    { label: 'Approved automatically', done: true },
                    { label: 'Return label issued', done: true },
                    { label: 'Replacement shipped', done: false },
                ].map(({ label, done }, i, arr) => (
                    <li key={label} className="flex gap-3">
                        <div className="flex flex-col items-center">
                            <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                    done ? 'bg-[#2563EB] text-white' : 'border border-[#D4D8E0] bg-white text-[#B0B6C2]'
                                }`}
                            >
                                {done ? '✓' : i + 1}
                            </span>
                            {i < arr.length - 1 && (
                                <span className={`w-px flex-1 ${done ? 'bg-[#2563EB]' : 'bg-[#E2E5EC]'}`} />
                            )}
                        </div>
                        <span
                            className={`pb-4 text-[0.8rem] ${
                                done ? 'font-medium text-[#141821]' : 'text-[#8A90A0]'
                            }`}
                        >
                            {label}
                        </span>
                    </li>
                ))}
            </ol>

            <div className="rounded-control bg-[#2563EB] px-4 py-2.5 text-center text-[0.8rem] font-semibold text-white">
                Download prepaid label
            </div>
        </div>
    </div>
);

/* ── 02 Brand admin: dense, dark, real components ──────────────────────── */
const BrandPanel = () => (
    <div className="grid gap-3 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-surface border border-white/10 bg-black/30">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral">
                    Claims queue
                </span>
                <span className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[9px] text-neutral">
                    ⌘K
                </span>
            </div>
            <table className="w-full text-left">
                <tbody className="font-mono text-[10.5px]">
                    {[
                        { id: 'CLM-9482', item: 'Buds Pro', risk: 'low', act: 'Auto-approved' },
                        { id: 'CLM-9481', item: 'Hub 4K', risk: 'med', act: 'Needs review' },
                        { id: 'CLM-9479', item: 'Watch S2', risk: 'low', act: 'Auto-approved' },
                        { id: 'CLM-9477', item: 'Buds Pro', risk: 'high', act: 'Held' },
                    ].map((r) => (
                        <tr key={r.id} className="border-b border-white/5 last:border-0">
                            <td className="py-2 pl-4 text-ink">{r.id}</td>
                            <td className="py-2 text-neutral">{r.item}</td>
                            <td className="py-2">
                                <span
                                    className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ${
                                        r.risk === 'low'
                                            ? 'bg-covered-wash text-covered'
                                            : r.risk === 'med'
                                              ? 'bg-expiring-wash text-expiring'
                                              : 'bg-expired-wash text-expired'
                                    }`}
                                >
                                    {r.risk}
                                </span>
                            </td>
                            <td className="py-2 pr-4 text-right text-neutral">{r.act}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="border-t border-white/10 px-4 py-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral">
                    Cover on the held unit
                </p>
                <CoverageMeter totalMonths={24} remainingMonths={3} remainingDays={94} />
            </div>
        </div>

        <div className="rounded-surface border border-white/10 bg-black/30 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral">
                Rule builder
            </p>
            <div className="mt-3 grid gap-1.5 font-mono text-[10.5px]">
                {[
                    ['IF', 'claim value', '< $75'],
                    ['AND', 'receipt OCR', 'valid'],
                    ['AND', 'account age', '> 30d'],
                ].map(([kw, field, val]) => (
                    <div
                        key={field}
                        className="flex items-center gap-2 rounded border border-white/10 bg-white/[0.03] px-2.5 py-1.5"
                    >
                        <span className="text-accent">{kw}</span>
                        <span className="text-neutral">{field}</span>
                        <span className="ml-auto text-ink">{val}</span>
                    </div>
                ))}
                <div className="mt-1 rounded border border-accent bg-accent-wash px-2.5 py-1.5">
                    <span className="text-accent">THEN</span>{' '}
                    <span className="text-ink">approve + ship replacement</span>
                </div>
            </div>
        </div>
    </div>
);

/* ── 03 Supplier: accounting ledger ────────────────────────────────────── */
const SupplierPanel = () => (
    <div className="rounded-surface border border-white/10 bg-black/30">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <span className="text-[0.8rem] font-semibold text-ink">Display Division</span>
            <span className="tabular font-mono text-[0.8rem] text-expiring">
                net outstanding $38,400
            </span>
        </div>
        <table className="w-full text-left">
            <thead>
                <tr className="border-b border-white/10">
                    {['Note', 'Batch', 'Defect', 'Units', 'Amount', ''].map((h) => (
                        <th
                            key={h}
                            className="px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral first:pl-4"
                        >
                            {h}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="font-mono text-[10.5px]">
                {[
                    ['DN-4471', '#8920', 'Pixel burn', '84', '$12,600', 'accepted'],
                    ['DN-4468', '#8920', 'Pixel burn', '61', '$9,150', 'accepted'],
                    ['DN-4459', '#8871', 'Backlight', '112', '$16,650', 'disputed'],
                ].map((r) => (
                    <tr key={r[0]} className="border-b border-white/5 last:border-0">
                        <td className="py-2 pl-4 pr-3 text-ink">{r[0]}</td>
                        <td className="px-3 py-2 text-neutral">{r[1]}</td>
                        <td className="px-3 py-2 text-neutral">{r[2]}</td>
                        <td className="tabular px-3 py-2 text-right text-neutral">{r[3]}</td>
                        <td className="tabular px-3 py-2 text-right text-ink">{r[4]}</td>
                        <td className="px-3 py-2 pr-4">
                            <span
                                className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ${
                                    r[5] === 'accepted'
                                        ? 'bg-covered-wash text-covered'
                                        : 'bg-expiring-wash text-expiring'
                                }`}
                            >
                                {r[5]}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        <div className="flex gap-2 border-t border-white/10 px-4 py-3">
            <span className="rounded-control bg-accent px-3 py-1.5 text-[0.72rem] font-semibold text-on-accent">
                Accept and credit
            </span>
            <span className="rounded-control border border-white/10 px-3 py-1.5 text-[0.72rem] font-semibold text-ink-muted">
                File dispute
            </span>
        </div>
    </div>
);

/* ── 04 Platform: operator cockpit ─────────────────────────────────────── */
const PlatformPanel = () => (
    <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
        <div className="rounded-surface border border-white/10 bg-black/30 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral">
                Tenants
            </p>
            <div className="mt-3 grid gap-2.5">
                {[
                    { brand: 'AeroTech', tier: 'Pro', used: 68 },
                    { brand: 'Northbay', tier: 'Starter', used: 91 },
                    { brand: 'Kepler Home', tier: 'Enterprise', used: 34 },
                ].map(({ brand, tier, used }) => (
                    <div key={brand}>
                        <div className="flex items-baseline justify-between gap-3">
                            <span className="text-[0.78rem] font-medium text-ink">{brand}</span>
                            <span className="font-mono text-[9.5px] uppercase text-neutral">{tier}</span>
                        </div>
                        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                            <div
                                className={`h-full rounded-full ${used > 85 ? 'bg-expiring' : 'bg-accent'}`}
                                style={{ width: `${used}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="rounded-surface border border-white/10 bg-black/40 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral">
                Event stream
            </p>
            <div className="mt-3 grid gap-1 font-mono text-[9.5px] leading-relaxed">
                {[
                    ['covered', 'rule.match', 'CLM-9482 auto'],
                    ['neutral', 'shopify.sync', 'AeroTech 412'],
                    ['covered', 'ocr.parsed', 'receipt ok'],
                    ['expiring', 'quota.warn', 'Northbay 91%'],
                ].map(([tone, ev, detail], i) => (
                    <p key={i} className="flex gap-2">
                        <span
                            className={
                                tone === 'covered'
                                    ? 'text-covered'
                                    : tone === 'expiring'
                                      ? 'text-expiring'
                                      : 'text-neutral'
                            }
                        >
                            ●
                        </span>
                        <span className="text-ink-muted">{ev}</span>
                        <span className="ml-auto text-neutral">{detail}</span>
                    </p>
                ))}
            </div>
        </div>
    </div>
);

const PANELS: Record<PortalKey, { title: string; body: string; node: React.ReactNode }> = {
    customer: {
        title: 'Your customer never learns our name',
        body: 'Registration and claims on the brand’s own domain, in the brand’s own colours. Scan, upload the receipt, track the replacement.',
        node: <CustomerPanel />,
    },
    brand: {
        title: 'The support desk stops reading receipts',
        body: 'Claims arrive scored and pre-decided. Rules are written in plain conditions, not code, and every one can be overridden by hand.',
        node: <BrandPanel />,
    },
    supplier: {
        title: 'Bad components stop being your cost',
        body: 'A claim traced to a faulty part raises a debit note against the supplier automatically, with the customer’s photos attached as proof.',
        node: <SupplierPanel />,
    },
    platform: {
        title: 'Every tenant, on one screen',
        body: 'Brands, tiers, quota, custom domains, and the live event stream across all of them.',
        node: <PlatformPanel />,
    },
};

export const PortalSwitcher = () => {
    const [active, setActive] = useState<PortalKey>('customer');
    const panel = PANELS[active];

    return (
        <section
            aria-labelledby="portals-heading"
            className="relative overflow-hidden border-t border-rule bg-[#0B0B0D]"
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(48rem 30rem at 50% 0%, rgba(94,106,210,0.2), transparent 65%)',
                }}
            />

            <div className="relative mx-auto max-w-[1400px] px-5 py-24 sm:px-8 lg:px-14">
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <h2
                            id="portals-heading"
                            className="max-w-[16ch] font-display text-[2.2rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[#F3F4F6] sm:text-[3rem]"
                        >
                            One platform, four rooms.
                        </h2>
                        <p className="mt-4 max-w-[52ch] text-body text-[#F3F4F6]/70">
                            A warranty passes through four sets of hands. Each gets an interface built
                            for the job, not a shared one with permissions bolted on.
                        </p>
                    </div>

                    {/* Said plainly, and said again on the panel below. */}
                    <p className="max-w-[26ch] rounded-control border border-expiring/40 bg-expiring-wash/40 px-3.5 py-2.5 text-label text-expiring">
                        Designed, not shipped. Today WarrantyPro is the consumer app above.
                    </p>
                </div>

                <div
                    role="tablist"
                    aria-label="Portals"
                    className="mt-10 grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
                >
                    {TABS.map(({ key, n, label, who }) => (
                        <button
                            key={key}
                            role="tab"
                            id={`tab-${key}`}
                            aria-selected={active === key}
                            aria-controls="portal-panel"
                            onClick={() => setActive(key)}
                            className={`rounded-surface border px-4 py-3.5 text-left transition-[transform,border-color,background-color] duration-enter ease-enter hover:-translate-y-0.5 ${
                                active === key
                                    ? 'border-accent bg-accent/[0.12]'
                                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                            }`}
                        >
                            <span
                                className={`font-mono text-[10px] ${
                                    active === key ? 'text-accent' : 'text-[#F3F4F6]/40'
                                }`}
                            >
                                {n}
                            </span>
                            <span className="mt-1.5 block text-label font-semibold text-[#F3F4F6]">
                                {label}
                            </span>
                            <span className="mt-0.5 block text-label text-[#F3F4F6]/50">{who}</span>
                        </button>
                    ))}
                </div>

                {/* Fixed minimum height so switching tabs never resizes the page. */}
                <div
                    role="tabpanel"
                    id="portal-panel"
                    aria-labelledby={`tab-${active}`}
                    className="mt-4 rounded-surface border border-white/10 bg-white/[0.02] p-5 sm:p-8"
                >
                    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-12">
                        <div>
                            <h3 className="font-display text-[1.4rem] font-semibold leading-tight tracking-[-0.02em] text-[#F3F4F6]">
                                {panel.title}
                            </h3>
                            <p className="mt-3 max-w-[44ch] text-body text-[#F3F4F6]/65">{panel.body}</p>
                            <p className="mt-5 font-mono text-[11px] text-[#F3F4F6]/40">
                                design preview
                            </p>
                        </div>

                        <div key={active} className="portal-fade min-h-[300px]">
                            {panel.node}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
