import React from 'react';
import { motion } from 'framer-motion';

interface CategoryFilterProps {
    categories: string[];
    selected: string;
    onSelect: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selected, onSelect }) => {
    return (
        <div className="rounded-[1.8rem] border border-[#c6a25f]/55 bg-[linear-gradient(180deg,rgba(255,248,229,0.1),rgba(255,226,171,0.04))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                    <p
                        className="text-[0.62rem] font-semibold uppercase tracking-[0.38em] text-[#dfcaa2]"
                        style={{ fontFamily: '"Cinzel", serif' }}
                    >
                        Cabinet Filters
                    </p>
                    <p className="mt-1 text-sm text-[#cdb68c]">Sort your ivory plates by family collection.</p>
                </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                {categories.map((category) => {
                    const isSelected = selected === category;

                    return (
                        <motion.button
                            key={category}
                            onClick={() => onSelect(category)}
                            className={`whitespace-nowrap rounded-full border px-4 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.28em] transition-all ${
                                isSelected
                                    ? 'border-[#d5b26d] bg-[linear-gradient(180deg,#fff0c7_0%,#d7a54d_100%)] text-[#654315] shadow-[0_12px_20px_rgba(88,56,10,0.2)]'
                                    : 'border-[#bb9552]/55 bg-[linear-gradient(180deg,rgba(255,248,226,0.14),rgba(255,228,177,0.05))] text-[#ebdbb5] hover:-translate-y-0.5 hover:border-[#d0ad69] hover:text-[#fff0ca]'
                            }`}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            style={{ fontFamily: '"Cinzel", serif' }}
                        >
                            {category}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};
