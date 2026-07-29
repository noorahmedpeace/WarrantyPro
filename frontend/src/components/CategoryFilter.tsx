import React from 'react';
import { motion } from 'framer-motion';

interface CategoryFilterProps {
    categories: string[];
    selected: string;
    onSelect: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selected, onSelect }) => {
    return (
        <div className="rounded-surface bg-surface-raised px-4 py-4 shadow-raised sm:rounded-surface sm:px-5 sm:py-5">
            <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-neutral">Portfolio Filters</p>
                    <p className="mt-1 text-sm text-ink-muted">Switch between device groups without leaving the dashboard.</p>
                </div>
            </div>

            <div className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1 no-scrollbar sm:gap-3">
                {categories.map((category) => {
                    const isSelected = selected === category;

                    return (
                        <motion.button
                            key={category}
                            onClick={() => onSelect(category)}
                            whileTap={{ scale: 0.97 }}
                            className={`min-h-11 snap-start whitespace-nowrap rounded-full px-4 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] transition-all duration-200 ${
                                isSelected
                                    ? 'bg-accent text-on-accent shadow-raised'
                                    : 'bg-surface text-ink-muted shadow-raised hover:text-ink'
                            }`}
                        >
                            {category}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};
