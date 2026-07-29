import { useEffect, useState } from 'react';
import { coverageStateOf, type CoverageState } from '../../lib/coverage';

interface CoverageMeterProps {
    /** Whole months of cover the warranty started with. */
    totalMonths: number;
    /** Whole months still remaining. Clamped into range. */
    remainingMonths: number;
    /** Days remaining, used for the label when fewer than two months are left. */
    remainingDays?: number;
    /** Renders the reading next to the meter. Off inside dense table rows. */
    showLabel?: boolean;
    size?: 'sm' | 'md';
    className?: string;
}

/** A warranty is measured in whole months, so the meter is segmented rather than
 *  a smooth fill. Twelve segments maximum, because past that the segments stop
 *  being countable and a bar would be more honest. */
const MAX_SEGMENTS = 12;

const FILL: Record<CoverageState, string> = {
    covered: 'bg-covered',
    expiring: 'bg-expiring',
    expired: 'bg-expired',
    archived: 'bg-archived',
};

const TEXT: Record<CoverageState, string> = {
    covered: 'text-covered',
    expiring: 'text-expiring',
    expired: 'text-expired',
    archived: 'text-archived',
};

export const CoverageMeter = ({
    totalMonths,
    remainingMonths,
    remainingDays,
    showLabel = true,
    size = 'md',
    className = '',
}: CoverageMeterProps) => {
    const total = Math.max(1, Math.round(totalMonths || 1));
    const remaining = Math.min(total, Math.max(0, Math.round(remainingMonths || 0)));
    const days = remainingDays ?? remaining * 30;
    const state = coverageStateOf(days);

    const segments = Math.min(total, MAX_SEGMENTS);
    const filled = Math.round((remaining / total) * segments);

    // The one-off measuring animation. It runs once on mount so the meter reads
    // as an instrument taking a reading, then never moves again.
    const [measured, setMeasured] = useState(false);
    useEffect(() => {
        const id = requestAnimationFrame(() => setMeasured(true));
        return () => cancelAnimationFrame(id);
    }, []);

    const reading =
        state === 'expired'
            ? 'Cover ended'
            : days <= 60
              ? `${days} days left`
              : `${remaining} of ${total} months left`;

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div
                role="meter"
                aria-valuenow={remaining}
                aria-valuemin={0}
                aria-valuemax={total}
                aria-label={`Coverage remaining: ${reading}`}
                className={`flex flex-1 gap-[2px] ${size === 'sm' ? 'h-[3px]' : 'h-1'}`}
            >
                {Array.from({ length: segments }, (_, i) => (
                    <span
                        key={i}
                        aria-hidden="true"
                        className={`flex-1 rounded-[1px] transition-[background-color,opacity] duration-measure ease-out ${
                            i < filled ? FILL[state] : 'bg-rule'
                        }`}
                        style={{
                            opacity: measured || i >= filled ? 1 : 0.2,
                            transitionDelay: `${i * 30}ms`,
                        }}
                    />
                ))}
            </div>

            {showLabel && (
                <span className={`tabular whitespace-nowrap font-mono text-data-s ${TEXT[state]}`}>
                    {reading}
                </span>
            )}
        </div>
    );
};
