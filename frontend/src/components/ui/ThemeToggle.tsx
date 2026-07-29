import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { applyTheme, readStoredTheme, storeTheme, type Theme } from '../../lib/theme';

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', Icon: Sun },
    { value: 'system', label: 'System', Icon: Monitor },
    { value: 'dark', label: 'Dark', Icon: Moon },
];

export const ThemeToggle = () => {
    const [theme, setTheme] = useState<Theme>(() => readStoredTheme());

    useEffect(() => {
        applyTheme(theme);
        storeTheme(theme);
    }, [theme]);

    return (
        <div
            role="radiogroup"
            aria-label="Colour theme"
            className="inline-flex rounded-control border border-rule bg-surface p-0.5"
        >
            {OPTIONS.map(({ value, label, Icon }) => (
                <button
                    key={value}
                    role="radio"
                    aria-checked={theme === value}
                    aria-label={label}
                    onClick={() => setTheme(value)}
                    className={`flex h-7 w-8 items-center justify-center rounded-[4px] transition-colors duration-feedback ${
                        theme === value ? 'bg-surface-raised text-ink' : 'text-neutral hover:text-ink'
                    }`}
                >
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                </button>
            ))}
        </div>
    );
};
