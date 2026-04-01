import React from 'react';
import { motion } from 'framer-motion';

interface CategoryFilterProps {
    categories: string[];
    selected: string;
    onSelect: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selected, onSelect }) => {
    return (
        <div className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#a9bfd9]">Portfolio Filters</p>
                    <p className="mt-1 text-sm text-[#c6d7ea]">Switch between device groups without leaving the dashboard.</p>
                </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                {categories.map((category) => {
                    const isSelected = selected === category;

                    return (
                        <motion.button
                            key={category}
                            onClick={() => onSelect(category)}
                            className={`whitespace-nowrap rounded-full border px-4 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] transition-all ${
                                isSelected
                                    ? 'border-[#dfc488]/40 bg-[linear-gradient(180deg,#f7dfaf_0%,#c69034_100%)] text-[#2a1a06] shadow-[0_12px_22px_rgba(198,144,52,0.24)]'
                                    : 'border-white/10 bg-white/5 text-[#edf5ff] hover:-translate-y-0.5 hover:border-[#d8bb7d]/30 hover:text-white'
                            }`}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            {category}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};
