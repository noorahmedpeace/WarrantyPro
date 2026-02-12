import React from 'react';
import { twMerge } from 'tailwind-merge';

export const BentoGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    return (
        <div className={twMerge("grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto px-4", className)}>
            {children}
        </div>
    );
};

export const BentoItem: React.FC<{ children: React.ReactNode; className?: string; span?: number }> = ({ children, className, span = 1 }) => {
    return (
        <div className={twMerge(
            `row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none bg-white/5 border-white/10 border justify-between flex flex-col space-y-4`,
            span === 2 ? "md:col-span-2" : "md:col-span-1",
            span === 3 ? "md:col-span-3" : "",
            className
        )}>
            {children}
        </div>
    );
};
