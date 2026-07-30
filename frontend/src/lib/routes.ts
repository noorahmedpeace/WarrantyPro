/**
 * Route chunk loaders, in one place so navigation can warm them before the
 * click lands.
 *
 * Without this, every first visit to a tab went: click, unmount, show the
 * skeleton fallback, fetch the chunk, mount. With View Transitions running,
 * the browser captured its snapshot at that moment, so the transition animated
 * into a skeleton and the real content appeared afterwards. That double step is
 * what read as "not smooth". Warming the chunk on hover or focus means the
 * module is almost always resolved before the click, and the transition goes
 * straight to real content.
 */
export const ROUTE_LOADERS: Record<string, () => Promise<unknown>> = {
    '/coverage': () => import('../pages/Dashboard'),
    '/claims': () => import('../pages/ClaimsView'),
    '/warranties/new': () => import('../pages/AddWarranty'),
    '/service-centers': () => import('../pages/ServiceCenters'),
    '/configuration': () => import('../pages/Settings'),
    '/notifications': () => import('../pages/Notifications'),
};

const warmed = new Set<string>();

/** Idempotent, and a failed prefetch is ignored: the real navigation retries. */
export const prefetchRoute = (path: string) => {
    if (warmed.has(path)) return;
    const load = ROUTE_LOADERS[path];
    if (!load) return;
    warmed.add(path);
    void load().catch(() => warmed.delete(path));
};

/** After the first page settles, quietly warm the rest of the product. */
export const prefetchAllRoutes = () => {
    const run = () => Object.keys(ROUTE_LOADERS).forEach(prefetchRoute);
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => void })
        .requestIdleCallback;
    if (idle) idle(run);
    else window.setTimeout(run, 1500);
};
