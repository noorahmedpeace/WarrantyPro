import React, { useEffect, useState } from 'react';
import { Bell, Clock, AlertCircle, CheckCircle2, Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationsApi } from '../lib/api';

interface Notification {
    _id: string;
    type: '30d' | '7d' | '0d' | 'expired';
    title: string;
    message: string;
    productName: string;
    expiryDate: string;
    daysUntilExpiry: number;
    sentAt: string;
    readAt?: string;
    warrantyId: {
        _id: string;
        product_name: string;
        brand: string;
    };
}

const Notifications: React.FC = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | '30d' | '7d' | '0d'>('all');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationsApi.getAll();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            await notificationsApi.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n =>
                    n._id === notificationId ? { ...n, readAt: new Date().toISOString() } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const getUrgencyStyles = (type: string) => {
        switch (type) {
            case '0d':
                return 'bg-red-400 border-4 border-dark text-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]';
            case '7d':
                return 'bg-orange-400 border-4 border-dark text-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]';
            case '30d':
                return 'bg-secondary border-4 border-dark text-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]';
            default:
                return 'bg-slate-300 border-4 border-dark text-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]';
        }
    };

    const getUrgencyIcon = (type: string) => {
        switch (type) {
            case '0d':
                return <AlertCircle className="w-6 h-6 text-dark" strokeWidth={3} />;
            case '7d':
                return <Clock className="w-6 h-6 text-dark" strokeWidth={3} />;
            case '30d':
                return <Bell className="w-6 h-6 text-dark" strokeWidth={3} />;
            default:
                return <CheckCircle2 className="w-6 h-6 text-dark" strokeWidth={3} />;
        }
    };

    const filteredNotifications = notifications.filter(n =>
        filter === 'all' ? true : n.type === filter
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return formatDate(dateString);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-12 h-12 border-4 border-dark border-t-primary rounded-none animate-spin shadow-neu" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-32 pt-8 px-4 max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-10 flex items-center justify-between border-b-4 border-dark pb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-3 bg-white border-4 border-dark hover:bg-slate-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <ArrowLeft className="w-6 h-6 text-dark" strokeWidth={3} />
                    </button>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-dark mb-1 uppercase tracking-tighter">Alerts</h1>
                        <p className="text-dark font-bold bg-secondary inline-block px-2 border-2 border-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm">
                            {unreadCount > 0
                                ? `You have ${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}`
                                : "You're all caught up"}
                        </p>
                    </div>
                </div>
                <div className="p-4 bg-primary border-4 border-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Bell className="w-8 h-8 text-dark" strokeWidth={3} />
                </div>
            </header>

            {/* Filter Tabs */}
            <div className="flex gap-4 mb-10 overflow-x-auto pb-4 scrollbar-none snap-x">
                {['all', '30d', '7d', '0d'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-6 py-3 border-4 border-dark text-base font-black uppercase tracking-wider whitespace-nowrap transition-all snap-start ${filter === f
                                ? 'bg-primary text-dark shadow-neu translate-y-[-2px] translate-x-[-2px]'
                                : 'bg-white text-dark hover:bg-slate-100'
                            }`}
                    >
                        {f === 'all' ? 'All Alerts' : f === '30d' ? '30 Days' : f === '7d' ? '7 Days' : 'Urgent'}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {filteredNotifications.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20 bg-white border-4 border-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                        >
                            <div className="inline-flex p-6 bg-slate-200 border-4 border-dark mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <Bell className="w-12 h-12 text-dark" strokeWidth={2} />
                            </div>
                            <h3 className="text-3xl font-black text-dark mb-4 uppercase tracking-tighter">Internal Peace</h3>
                            <p className="text-dark font-bold text-lg max-w-sm mx-auto">
                                No {filter === 'all' ? '' : filter} alerts at the moment. Your warranties are safe.
                            </p>
                        </motion.div>
                    ) : (
                        filteredNotifications.map((notification, index) => (
                            <motion.div
                                key={notification._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                layout
                            >
                                <div
                                    className={`neu-card bg-white transition-all duration-300 relative group cursor-pointer hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] ${!notification.readAt ? 'border-primary' : 'border-dark'
                                        }`}
                                    onClick={() => !notification.readAt && markAsRead(notification._id)}
                                >
                                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5">
                                        {/* Urgency Icon Wrapper */}
                                        <div className={`p-4 flex-shrink-0 self-start ${getUrgencyStyles(notification.type)}`}>
                                            {getUrgencyIcon(notification.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
                                                <h3 className={`font-black text-xl uppercase tracking-tight leading-tight ${!notification.readAt ? 'text-dark' : 'text-slate-500'}`}>
                                                    {notification.title}
                                                </h3>
                                                <span className="text-xs sm:text-sm text-dark font-black uppercase tracking-wider whitespace-nowrap bg-slate-200 px-2 py-1 border-2 border-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] self-start sm:self-auto">
                                                    {formatRelativeTime(notification.sentAt)}
                                                </span>
                                            </div>

                                            <p className={`text-base font-bold leading-relaxed mb-6 ${!notification.readAt ? 'text-dark' : 'text-slate-600'}`}>
                                                {notification.message}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-black uppercase tracking-wider text-dark mt-auto pt-4 border-t-4 border-dark">
                                                <div className="flex items-center gap-2 px-3 py-2 bg-secondary border-2 border-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                    <Calendar className="w-4 h-4" strokeWidth={3} />
                                                    EXPIRES: {formatDate(notification.expiryDate)}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/warranties/${notification.warrantyId._id}`);
                                                    }}
                                                    className="bg-primary text-dark px-4 py-2 border-2 border-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all ml-auto sm:ml-0"
                                                >
                                                    VIEW DETAILS →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {!notification.readAt && (
                                        <div className="absolute -top-3 -right-3 w-6 h-6 bg-primary border-4 border-dark rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-ping" />
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Notifications;
