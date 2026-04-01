import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, hoverEffect = true }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={hoverEffect ? { scale: 1.01, boxShadow: "0 18px 38px rgba(15, 23, 42, 0.08)" } : {}}
            transition={{ duration: 0.3 }}
            className={twMerge(
                "glass-card rounded-2xl p-6 relative overflow-hidden group",
                className
            )}
        >
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};
