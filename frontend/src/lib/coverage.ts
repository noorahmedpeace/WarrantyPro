export type CoverageState = 'covered' | 'expiring' | 'expired' | 'archived';

/** A warranty inside its last two months is the only thing on a dashboard that
 *  needs acting on, so that is where the state changes rather than at some
 *  percentage of an unstated whole. */
export const coverageStateOf = (remainingDays: number): CoverageState => {
    if (remainingDays < 0) return 'expired';
    if (remainingDays <= 60) return 'expiring';
    return 'covered';
};
