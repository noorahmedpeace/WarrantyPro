import React from 'react';

interface CategoryFilterProps {
    categories: string[];
    selected: string;
    onSelect: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selected, onSelect }) => {
    return (
        <div className="rounded-[1.8rem] bg-slate-50 px-5 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
            <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-400">Portfolio Filters</p>
                    <p className="mt-1 text-sm text-slate-600">Switch between device groups without leaving the dashboard.</p>
                </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                {categories.map((category) => {
                    const isSelected = selected === category;

                    return (
                        <button
                            key={category}
                            onClick={() => onSelect(category)}
                            className={`whitespace-nowrap rounded-full px-4 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] transition-all duration-200 ${
                                isSelected
                                    ? 'bg-slate-950 text-white shadow-[0_12px_24px_rgba(15,23,42,0.14)]'
                                    : 'bg-white text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.06)] hover:text-slate-950'
                            }`}
                        >
                            {category}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
