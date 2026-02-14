import React, { useEffect, useState } from 'react';
import { Bell, Clock, AlertCircle, CheckCircle2, Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationsApi } from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';

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
                return 'from-red-500/20 to-orange-500/20 text-red-400 border-red-500/30';
            case '7d':
                return 'from-orange-500/20 to-yellow-500/20 text-orange-400 border-orange-500/30';
            case '30d':
                return 'from-blue-500/20 to-purple-500/20 text-blue-400 border-blue-500/30';
            default:
                return 'from-slate-500/20 to-slate-600/20 text-slate-400 border-slate-500/30';
        }
    };

    const getUrgencyIcon = (type: string) => {
        switch (type) {
            case '0d':
                return <AlertCircle className="w-5 h-5 text-red-400" />;
            case '7d':
                return <Clock className="w-5 h-5 text-orange-400" />;
            case '30d':
                return <Bell className="w-5 h-5 text-blue-400" />;
            default:
                return <CheckCircle2 className="w-5 h-5 text-slate-400" />;
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-32 pt-8 px-4 max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Alerts</h1>
                        <p className="text-slate-400 text-sm">
                            {unreadCount > 0
                                ? `You have ${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}`
                                : "You're all caught up"}
                        </p>
                    </div>
                </div>
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Bell className="w-6 h-6" />
                </div>
            </header>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
                {['all', '30d', '7d', '0d'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 border ${filter === f
                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                            }`}
                    >
                        {f === 'all' ? 'All Alerts' : f === '30d' ? '30 Days' : f === '7d' ? '7 Days' : 'Urgent'}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredNotifications.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20"
                        >
                            <div className="inline-flex p-6 rounded-full bg-white/5 border border-white/10 mb-6">
                                <Bell className="w-12 h-12 text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Internal Peace</h3>
                            <p className="text-slate-500 max-w-xs mx-auto">
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
                                <GlassCard
                                    className={`relative transition-all duration-300 group ${!notification.readAt ? 'border-l-4 border-l-blue-500' : 'border-white/5'
                                        }`}
                                >
                                    <div
                                        onClick={() => !notification.readAt && markAsRead(notification._id)}
                                        className="p-5 flex gap-4 cursor-pointer"
                                    >
                                        {/* Urgency Icon Wrapper */}
                                        <div className={`p-3 rounded-2xl bg-gradient-to-br border flex-shrink-0 self-start ${getUrgencyStyles(notification.type)}`}>
                                            {getUrgencyIcon(notification.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className={`font-bold truncate ${!notification.readAt ? 'text-white' : 'text-slate-400'}`}>
                                                    {notification.title}
                                                </h3>
                                                <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap ml-2">
                                                    {formatRelativeTime(notification.sentAt)}
                                                </span>
                                            </div>

                                            <p className={`text-sm leading-relaxed mb-4 ${!notification.readAt ? 'text-slate-300' : 'text-slate-500'}`}>
                                                {notification.message}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    Expires: {formatDate(notification.expiryDate)}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/warranties/${notification.warrantyId._id}`);
                                                    }}
                                                    className="text-blue-400 hover:text-blue-300 transition-colors"
                                                >
                                                    View Details →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Notifications;
