import React from 'react';
import { motion } from 'framer-motion';

interface CategoryFilterProps {
    categories: string[];
    selected: string;
    onSelect: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selected, onSelect }) => {
    return (
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {categories.map((category) => (
                <motion.button
                    key={category}
                    onClick={() => onSelect(category)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${selected === category
                            ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                            : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-slate-200 shadow-sm'
                        }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {category}
                </motion.button>
            ))}
        </div>
    );
};
