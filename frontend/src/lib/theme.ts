export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'warranty_theme';

export const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
};

export const readStoredTheme = (): Theme => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
};

export const storeTheme = (theme: Theme) => {
    if (theme === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, theme);
};

/** Runs before React mounts so the first paint is already in the right theme.
 *  Without it a dark-mode user sees a light flash on every cold load. */
export const initTheme = () => applyTheme(readStoredTheme());
