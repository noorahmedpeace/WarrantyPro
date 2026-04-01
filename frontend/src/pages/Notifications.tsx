import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, Bell, Calendar, CheckCircle2, Clock } from 'lucide-react';
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
    warrantyId: { _id: string; product_name: string; brand: string };
}

const Notifications: React.FC = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | '30d' | '7d' | '0d'>('all');

    useEffect(() => {
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

        fetchNotifications();
    }, []);

    const markAsRead = async (notificationId: string) => {
        try {
            await notificationsApi.markAsRead(notificationId);
            setNotifications((prev) => prev.map((notification) => (
                notification._id === notificationId
                    ? { ...notification, readAt: new Date().toISOString() }
                    : notification
            )));
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const getUrgencyConfig = (type: string) => {
        switch (type) {
            case '0d':
                return { icon: 'text-red-200', iconBg: 'bg-red-500/14 border-red-300/20' };
            case '7d':
                return { icon: 'text-amber-200', iconBg: 'bg-amber-500/14 border-amber-300/20' };
            case '30d':
                return { icon: 'text-sky-200', iconBg: 'bg-sky-500/14 border-sky-300/20' };
            default:
                return { icon: 'text-slate-200', iconBg: 'bg-white/5 border-white/10' };
        }
    };

    const getUrgencyIcon = (type: string) => {
        const cfg = getUrgencyConfig(type);
        const iconClass = `w-5 h-5 ${cfg.icon}`;
        switch (type) {
            case '0d': return <AlertCircle className={iconClass} />;
            case '7d': return <Clock className={iconClass} />;
            case '30d': return <Bell className={iconClass} />;
            default: return <CheckCircle2 className={iconClass} />;
        }
    };

    const filteredNotifications = notifications.filter((notification) => (filter === 'all' ? true : notification.type === filter));

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const formatRelativeTime = (dateString: string) => {
        const diffMs = new Date().getTime() - new Date(dateString).getTime();
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-white/10 border-t-[#f0ddb0] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="page-shell max-w-5xl">
            <header className="page-header">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-200 hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="page-title">Alerts</h1>
                            <p className="page-subtitle">
                                {unreadCount > 0
                                    ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                                    : "You're all caught up"}
                            </p>
                        </div>
                    </div>
                    <div className="rounded-xl border border-[#dabb7c]/25 bg-[linear-gradient(180deg,rgba(245,211,119,0.16),rgba(245,211,119,0.05))] p-3 text-[#f0ddb0]">
                        <Bell className="w-6 h-6" />
                    </div>
                </div>
            </header>

            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                {['all', '30d', '7d', '0d'].map((entry) => (
                    <button
                        key={entry}
                        onClick={() => setFilter(entry as 'all' | '30d' | '7d' | '0d')}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
                            filter === entry
                                ? 'border-[#dfc488]/40 bg-[linear-gradient(180deg,#f7dfaf_0%,#c69034_100%)] text-[#2a1a06]'
                                : 'border-white/10 bg-white/5 text-slate-200 hover:text-white'
                        }`}
                    >
                        {entry === 'all' ? 'All Alerts' : entry === '30d' ? '30 Days' : entry === '7d' ? '7 Days' : 'Urgent'}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredNotifications.length === 0 ? (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-empty">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-5 border border-white/10">
                                <Bell className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">All Clear</h3>
                            <p className="text-slate-300 font-medium text-base max-w-sm mx-auto">
                                No {filter === 'all' ? '' : filter} alerts right now. Your warranties are safe.
                            </p>
                        </motion.div>
                    ) : (
                        filteredNotifications.map((notification, index) => {
                            const cfg = getUrgencyConfig(notification.type);
                            return (
                                <motion.div
                                    key={notification._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    layout
                                >
                                    <div
                                        className={`relative rounded-[1.6rem] border p-5 backdrop-blur-xl transition-all hover:-translate-y-0.5 cursor-pointer ${
                                            !notification.readAt
                                                ? 'border-[#dabb7c]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))]'
                                                : 'border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]'
                                        }`}
                                        onClick={() => !notification.readAt && markAsRead(notification._id)}
                                    >
                                        <div className="flex flex-col gap-5 sm:flex-row">
                                            <div className={`self-start rounded-xl border p-3 ${cfg.iconBg}`}>
                                                {getUrgencyIcon(notification.type)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                    <h3 className={`text-lg font-bold leading-tight ${!notification.readAt ? 'text-white' : 'text-slate-300'}`}>
                                                        {notification.title}
                                                    </h3>
                                                    <span className="text-xs text-slate-400 font-semibold whitespace-nowrap bg-white/5 px-2.5 py-1 rounded-full border border-white/10 self-start sm:self-auto">
                                                        {formatRelativeTime(notification.sentAt)}
                                                    </span>
                                                </div>

                                                <p className={`text-sm font-medium leading-relaxed mb-5 ${!notification.readAt ? 'text-slate-200' : 'text-slate-400'}`}>
                                                    {notification.message}
                                                </p>

                                                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-300 mt-auto pt-4 border-t border-white/10">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        Expires: {formatDate(notification.expiryDate)}
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/warranties/${notification.warrantyId._id}`);
                                                        }}
                                                        className="ml-auto sm:ml-0 rounded-lg border border-[#dfc488]/30 bg-[linear-gradient(180deg,#f7dfaf_0%,#c69034_100%)] px-3 py-1.5 text-xs font-semibold text-[#2a1a06]"
                                                    >
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {!notification.readAt && (
                                            <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#f0ddb0] rounded-full shadow-[0_0_10px_rgba(240,221,176,0.8)]" />
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Notifications;
