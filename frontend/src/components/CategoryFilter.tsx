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
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selected === category
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
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
