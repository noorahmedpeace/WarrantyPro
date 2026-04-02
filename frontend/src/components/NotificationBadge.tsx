import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { notificationsApi } from '../lib/api';

interface NotificationBadgeProps {
    className?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ className = '' }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        fetchUnreadCount();

        // Poll for new notifications every 60 seconds
        const interval = setInterval(fetchUnreadCount, 60000);

        return () => clearInterval(interval);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const data = await notificationsApi.getUnreadCount();
            const newCount = data.count;

            // Trigger pulse animation if count increased
            if (newCount > unreadCount) {
                setPulse(true);
                setTimeout(() => setPulse(false), 1000);
            }

            setUnreadCount(newCount);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    if (unreadCount === 0) {
        return null;
    }

    return (
        <div className={`relative ${className}`}>
            <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg ${pulse ? 'animate-bounce' : ''
                    }`}
            >
                {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
        </div>
    );
};

export default NotificationBadge;
