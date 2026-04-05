import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, Bell, Calendar, CheckCircle2, Clock, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
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

const normalizeNotifications = (payload: unknown): Notification[] => {
    if (!payload || typeof payload !== 'object') {
        return [];
    }

    const candidate = (payload as { notifications?: unknown[] }).notifications;
    if (!Array.isArray(candidate)) {
        return [];
    }

    return candidate.filter((entry): entry is Notification => Boolean(entry) && typeof entry === 'object');
};

const getNotificationGroup = (notification: Notification): 'action' | 'upcoming' | 'reviewed' => {
    if (notification.readAt) {
        return 'reviewed';
    }

    if (notification.type === '0d' || notification.type === '7d') {
        return 'action';
    }

    return 'upcoming';
};

const loopEase = {
    duration: 4.6,
    repeat: Infinity,
    ease: 'easeInOut' as const,
};

const Notifications: React.FC = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | '30d' | '7d' | '0d'>('all');
    const [viewMode, setViewMode] = useState<'all' | 'unread' | 'action' | 'reviewed'>('all');
    const [markingAll, setMarkingAll] = useState(false);
    const [archivedIds, setArchivedIds] = useState<string[]>([]);
    const [snoozedIds, setSnoozedIds] = useState<string[]>([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const data = await notificationsApi.getAll();
                const normalized = normalizeNotifications(data);
                setNotifications(normalized);
                setUnreadCount(typeof data?.unreadCount === 'number' ? data.unreadCount : normalized.filter((entry) => !entry.readAt).length);
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

    const handleMarkVisibleAsRead = async () => {
        const unreadVisible = filteredNotifications.filter((notification) => !notification.readAt);
        if (unreadVisible.length === 0) {
            return;
        }

        try {
            setMarkingAll(true);
            await Promise.all(unreadVisible.map((notification) => notificationsApi.markAsRead(notification._id)));
            const now = new Date().toISOString();
            setNotifications((prev) => prev.map((notification) =>
                unreadVisible.some((entry) => entry._id === notification._id)
                    ? { ...notification, readAt: now }
                    : notification
            ));
            setUnreadCount((prev) => Math.max(0, prev - unreadVisible.length));
        } catch (error) {
            console.error('Failed to mark visible notifications as read:', error);
        } finally {
            setMarkingAll(false);
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

    const visibleNotifications = notifications.filter(
        (notification) => !archivedIds.includes(notification._id) && !snoozedIds.includes(notification._id)
    );

    const filteredNotifications = visibleNotifications
        .filter((notification) => (filter === 'all' ? true : notification.type === filter))
        .filter((notification) => {
            if (viewMode === 'unread') {
                return !notification.readAt;
            }

            if (viewMode === 'action') {
                return !notification.readAt || notification.type === '0d' || notification.type === '7d';
            }

            if (viewMode === 'reviewed') {
                return Boolean(notification.readAt);
            }

            return true;
        });
    const urgentCount = visibleNotifications.filter((notification) => notification.type === '0d' || notification.type === '7d').length;
    const readCount = Math.max(0, visibleNotifications.length - unreadCount);
    const actionReadyCount = visibleNotifications.filter((notification) => !notification.readAt || notification.type === '0d' || notification.type === '7d').length;
    const nextAction = visibleNotifications.find((notification) => !notification.readAt) || visibleNotifications[0];
    const groupedNotifications = useMemo(() => {
        const action = filteredNotifications.filter((notification) => getNotificationGroup(notification) === 'action');
        const upcoming = filteredNotifications.filter((notification) => getNotificationGroup(notification) === 'upcoming');
        const reviewed = filteredNotifications.filter((notification) => getNotificationGroup(notification) === 'reviewed');

        return [
            {
                key: 'action',
                title: 'Action Needed',
                description: 'Coverage windows that need the fastest review.',
                items: action,
            },
            {
                key: 'upcoming',
                title: 'Upcoming',
                description: 'Earlier reminders that keep you ahead of expiry.',
                items: upcoming,
            },
            {
                key: 'reviewed',
                title: 'Reviewed',
                description: 'Alerts you have already checked and kept for reference.',
                items: reviewed,
            },
        ].filter((group) => group.items.length > 0);
    }, [filteredNotifications]);

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

    const archiveNotification = (notificationId: string) => {
        const targetNotification = notifications.find((notification) => notification._id === notificationId);
        const wasUnread = Boolean(targetNotification && !targetNotification.readAt);
        setArchivedIds((current) => current.includes(notificationId) ? current : [...current, notificationId]);
        setNotifications((current) => current.map((notification) =>
            notification._id === notificationId && !notification.readAt
                ? { ...notification, readAt: new Date().toISOString() }
                : notification
        ));
        if (wasUnread) {
            setUnreadCount((current) => Math.max(0, current - 1));
        }
    };

    const snoozeNotification = (notificationId: string) => {
        setSnoozedIds((current) => current.includes(notificationId) ? current : [...current, notificationId]);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="page-shell max-w-5xl">
            <header className="page-header">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="micro-lift rounded-xl border border-slate-200 bg-[#f8fafc] p-2.5 text-slate-600 hover:text-slate-950">
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
                    <motion.div
                        className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sky-600"
                        animate={{ y: [0, -3, 0], boxShadow: ['0 0 0 rgba(56,189,248,0)', '0 12px 28px rgba(56,189,248,0.18)', '0 0 0 rgba(56,189,248,0)'] }}
                        transition={{ ...loopEase, duration: 3.8 }}
                    >
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 6, 0] }}
                            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.8 }}
                        >
                            <Bell className="w-6 h-6" />
                        </motion.div>
                    </motion.div>
                </div>
            </header>

            <div className="mb-8 grid gap-4 md:grid-cols-3">
                <motion.div
                    className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ ...loopEase, duration: 5.2 }}
                >
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-slate-400">Unread</p>
                    <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950">{unreadCount}</div>
                    <p className="mt-2 text-sm text-slate-600">New reminders and protection updates waiting for review.</p>
                </motion.div>
                <motion.div
                    className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ ...loopEase, duration: 5.5, delay: 0.18 }}
                >
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-slate-400">Urgent</p>
                    <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950">{urgentCount}</div>
                    <p className="mt-2 text-sm text-slate-600">Items that are closest to expiry and need action the fastest.</p>
                </motion.div>
                <motion.div
                    className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ ...loopEase, duration: 5.8, delay: 0.32 }}
                >
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-slate-400">Reviewed</p>
                    <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950">{readCount}</div>
                    <p className="mt-2 text-sm text-slate-600">Previously checked notifications kept in one clean audit trail.</p>
                </motion.div>
            </div>

            <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
                {[
                    { key: 'all', label: 'Everything' },
                    { key: 'action', label: `Action Ready (${actionReadyCount})` },
                    { key: 'unread', label: `Unread (${unreadCount})` },
                    { key: 'reviewed', label: `Reviewed (${readCount})` },
                ].map((entry) => (
                    <button
                        key={entry.key}
                        onClick={() => setViewMode(entry.key as 'all' | 'unread' | 'action' | 'reviewed')}
                        className={`micro-lift rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
                            viewMode === entry.key
                                ? 'border-slate-950 bg-slate-950 text-white'
                                : 'border-slate-200 bg-white text-slate-600 hover:text-slate-950'
                        }`}
                    >
                        {entry.label}
                    </button>
                ))}
            </div>

            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                {['all', '30d', '7d', '0d'].map((entry) => (
                    <button
                        key={entry}
                        onClick={() => setFilter(entry as 'all' | '30d' | '7d' | '0d')}
                        className={`micro-lift rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
                            filter === entry
                                ? 'border-sky-200 bg-sky-50 text-sky-700'
                                : 'border-slate-200 bg-white text-slate-600 hover:text-slate-950'
                        }`}
                    >
                        {entry === 'all' ? 'All Alerts' : entry === '30d' ? '30 Days' : entry === '7d' ? '7 Days' : 'Urgent'}
                    </button>
                ))}
                <button
                    onClick={handleMarkVisibleAsRead}
                    disabled={markingAll || filteredNotifications.every((notification) => notification.readAt)}
                    className="micro-lift rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold whitespace-nowrap text-slate-600 transition-all hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {markingAll ? 'Updating...' : 'Mark visible as read'}
                </button>
            </div>

            {nextAction && (
                <div className="mb-6 rounded-[1.6rem] border border-slate-200 bg-white px-5 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-slate-400">Next Action</p>
                            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{nextAction.title}</h2>
                            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">{nextAction.message}</p>
                        </div>
                        <button
                            onClick={() => navigate(`/warranties/${nextAction.warrantyId?._id}`)}
                            className="micro-lift inline-flex items-center justify-center gap-2 rounded-full border border-slate-950 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
                        >
                            Open Warranty
                            <ExternalLink className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            <div className="mb-6 grid gap-4 lg:grid-cols-3">
                <div className="rounded-[1.4rem] border border-red-100 bg-red-50/70 px-5 py-4">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-red-400">Action queue</p>
                    <div className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-slate-950">
                        {groupedNotifications.find((group) => group.key === 'action')?.items.length || 0}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Urgent reminders and unread alerts that deserve attention first.</p>
                </div>
                <div className="rounded-[1.4rem] border border-sky-100 bg-sky-50/70 px-5 py-4">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-sky-500">Upcoming queue</p>
                    <div className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-slate-950">
                        {groupedNotifications.find((group) => group.key === 'upcoming')?.items.length || 0}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Advance reminders that help you act before support gets rushed.</p>
                </div>
                <div className="rounded-[1.4rem] border border-slate-200 bg-white px-5 py-4">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-400">Checked trail</p>
                    <div className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-slate-950">
                        {groupedNotifications.find((group) => group.key === 'reviewed')?.items.length || 0}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Reviewed alerts stay in one clean trail so nothing feels lost.</p>
                </div>
            </div>

            <div className="space-y-8">
                <AnimatePresence mode="popLayout">
                    {filteredNotifications.length === 0 ? (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-empty">
                            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-[#f8fafc]">
                                <Bell className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="mb-2 text-2xl font-bold tracking-tight text-slate-950">All Clear</h3>
                            <p className="mx-auto max-w-sm text-base font-medium text-slate-600">
                                No {filter === 'all' ? '' : filter} alerts right now. Your warranties are safe.
                            </p>
                            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
                                <ShieldCheck className="h-4 w-4 text-sky-600" />
                                Smart monitoring will surface the next alert automatically.
                            </div>
                        </motion.div>
                    ) : (
                        groupedNotifications.map((group, groupIndex) => (
                            <motion.section
                                key={group.key}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: groupIndex * 0.06 }}
                                className="space-y-4"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">{group.title}</h3>
                                            <span className="page-chip">{group.items.length}</span>
                                        </div>
                                        <p className="mt-1 text-sm text-slate-500">{group.description}</p>
                                    </div>
                                    {group.key === 'action' && (
                                        <motion.div
                                            className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-red-500"
                                            animate={{ scale: [1, 1.04, 1] }}
                                            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                                        >
                                            <Sparkles className="h-3.5 w-3.5" />
                                            Focus first
                                        </motion.div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {group.items.map((notification, index) => {
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
                                                    className={`micro-lift relative cursor-pointer rounded-[1.6rem] border p-5 backdrop-blur-xl transition-all ${
                                                        !notification.readAt
                                                            ? 'border-sky-200 bg-sky-50/40'
                                                            : 'border-slate-200 bg-white'
                                                    }`}
                                                    onClick={() => !notification.readAt && markAsRead(notification._id)}
                                                >
                                                    <div className="flex flex-col gap-5 sm:flex-row">
                                                        <div className={`self-start rounded-xl border p-3 ${cfg.iconBg}`}>
                                                            {getUrgencyIcon(notification.type)}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                                <h3 className={`text-lg font-bold leading-tight ${!notification.readAt ? 'text-slate-950' : 'text-slate-700'}`}>
                                                                    {notification.title}
                                                                </h3>
                                                                <span className="self-start whitespace-nowrap rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-400 sm:self-auto">
                                                                    {formatRelativeTime(notification.sentAt)}
                                                                </span>
                                                            </div>

                                                            <p className={`mb-5 text-sm font-medium leading-relaxed ${!notification.readAt ? 'text-slate-700' : 'text-slate-500'}`}>
                                                                {notification.message}
                                                            </p>

                                                    <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4 text-xs font-semibold text-slate-500">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            Expires: {formatDate(notification.expiryDate)}
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                snoozeNotification(notification._id);
                                                            }}
                                                            className="micro-lift inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
                                                        >
                                                            Snooze
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                archiveNotification(notification._id);
                                                            }}
                                                            className="micro-lift inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
                                                        >
                                                            Archive
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                        navigate(`/warranties/${notification.warrantyId?._id}`);
                                                                    }}
                                                                    className="micro-lift ml-auto inline-flex items-center gap-2 rounded-lg border border-slate-950 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white sm:ml-0"
                                                                >
                                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                                    View Details
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {!notification.readAt && (
                                                        <motion.div
                                                            className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-sky-400"
                                                            animate={{ scale: [1, 1.45, 1], opacity: [0.9, 0.45, 0.9] }}
                                                            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                                                        />
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.section>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Notifications;

