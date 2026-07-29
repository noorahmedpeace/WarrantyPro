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
                return { icon: 'text-expired', iconBg: 'bg-expired/14 border-expired/20' };
            case '7d':
                return { icon: 'text-expiring', iconBg: 'bg-expiring/14 border-expiring/20' };
            case '30d':
                return { icon: 'text-accent', iconBg: 'bg-accent/14 border-accent/20' };
            default:
                return { icon: 'text-rule', iconBg: 'bg-surface border-rule' };
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
                <div className="w-10 h-10 border-4 border-rule border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="page-shell max-w-5xl">
            <header className="page-header">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/coverage')} className="row-interactive rounded-control border border-rule bg-surface-raised p-2.5 text-ink-muted hover:text-ink">
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
                        className="rounded-control border border-accent bg-accent-wash p-3 text-accent"
                    >
                        <motion.div
                        >
                            <Bell className="w-6 h-6" />
                        </motion.div>
                    </motion.div>
                </div>
            </header>

            <div className="mb-8 grid gap-4 md:grid-cols-3">
                <motion.div
                    className="rounded-surface border border-rule bg-surface px-5 py-5 shadow-raised"
                >
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-neutral">Unread</p>
                    <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-ink">{unreadCount}</div>
                    <p className="mt-2 text-sm text-ink-muted">New reminders and protection updates waiting for review.</p>
                </motion.div>
                <motion.div
                    className="rounded-surface border border-rule bg-surface px-5 py-5 shadow-raised"
                >
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-neutral">Urgent</p>
                    <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-ink">{urgentCount}</div>
                    <p className="mt-2 text-sm text-ink-muted">Items that are closest to expiry and need action the fastest.</p>
                </motion.div>
                <motion.div
                    className="rounded-surface border border-rule bg-surface px-5 py-5 shadow-raised"
                >
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-neutral">Reviewed</p>
                    <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-ink">{readCount}</div>
                    <p className="mt-2 text-sm text-ink-muted">Previously checked notifications kept in one clean audit trail.</p>
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
                        className={`row-interactive rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
                            viewMode === entry.key
                                ? 'border-accent bg-accent text-on-accent'
                                : 'border-rule bg-surface text-ink-muted hover:text-ink'
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
                        className={`row-interactive rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
                            filter === entry
                                ? 'border-accent bg-accent-wash text-accent'
                                : 'border-rule bg-surface text-ink-muted hover:text-ink'
                        }`}
                    >
                        {entry === 'all' ? 'All Alerts' : entry === '30d' ? '30 Days' : entry === '7d' ? '7 Days' : 'Urgent'}
                    </button>
                ))}
                <button
                    onClick={handleMarkVisibleAsRead}
                    disabled={markingAll || filteredNotifications.every((notification) => notification.readAt)}
                    className="row-interactive rounded-full border border-rule bg-surface px-4 py-2 text-sm font-semibold whitespace-nowrap text-ink-muted transition-all hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {markingAll ? 'Updating...' : 'Mark visible as read'}
                </button>
            </div>

            {nextAction && (
                <div className="mb-6 rounded-surface border border-rule bg-surface px-5 py-5 shadow-raised">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-neutral">Next Action</p>
                            <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">{nextAction.title}</h2>
                            <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-muted">{nextAction.message}</p>
                        </div>
                        <button
                            onClick={() => navigate(`/warranties/${nextAction.warrantyId?._id}`)}
                            className="row-interactive inline-flex items-center justify-center gap-2 rounded-full border border-accent bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent"
                        >
                            Open Warranty
                            <ExternalLink className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            <div className="mb-6 grid gap-4 lg:grid-cols-3">
                <div className="rounded-surface border border-expired bg-expired-wash/70 px-5 py-4">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-expired">Action queue</p>
                    <div className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-ink">
                        {groupedNotifications.find((group) => group.key === 'action')?.items.length || 0}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-ink-muted">Urgent reminders and unread alerts that deserve attention first.</p>
                </div>
                <div className="rounded-surface border border-accent bg-accent-wash/70 px-5 py-4">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-accent">Upcoming queue</p>
                    <div className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-ink">
                        {groupedNotifications.find((group) => group.key === 'upcoming')?.items.length || 0}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-ink-muted">Advance reminders that help you act before support gets rushed.</p>
                </div>
                <div className="rounded-surface border border-rule bg-surface px-5 py-4">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-neutral">Checked trail</p>
                    <div className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-ink">
                        {groupedNotifications.find((group) => group.key === 'reviewed')?.items.length || 0}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-ink-muted">Reviewed alerts stay in one clean trail so nothing feels lost.</p>
                </div>
            </div>

            <div className="space-y-8">
                <AnimatePresence mode="popLayout">
                    {filteredNotifications.length === 0 ? (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-empty">
                            <div className="empty-icon mb-5">
                                <Bell className="w-8 h-8 text-neutral" />
                            </div>
                            <h3 className="mb-2 text-2xl font-bold tracking-tight text-ink">All Clear</h3>
                            <p className="mx-auto max-w-sm text-base font-medium text-ink-muted">
                                No {filter === 'all' ? '' : filter} alerts right now. Your warranties are safe.
                            </p>
                            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-neutral">
                                <ShieldCheck className="h-4 w-4 text-accent" />
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
                                        <h3 className="text-xl font-semibold tracking-[-0.03em] text-ink">{group.title}</h3>
                                        <span className="page-chip">{group.items.length}</span>
                                    </div>
                                    <p className="mt-1 text-sm text-neutral">{group.description}</p>
                                </div>
                                    {group.key === 'action' && (
                                        <motion.div
                                            className="inline-flex items-center gap-2 rounded-full border border-expired bg-expired-wash px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-expired"
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
                                                    className={`row-interactive relative cursor-pointer rounded-surface border p-5 backdrop-blur-xl transition-all ${
                                                        !notification.readAt
                                                            ? 'border-accent bg-accent-wash/40'
                                                            : 'border-rule bg-surface'
                                                    }`}
                                                    onClick={() => !notification.readAt && markAsRead(notification._id)}
                                                >
                                                    <div className="flex flex-col gap-5 sm:flex-row">
                                                        <div className={`self-start rounded-control border p-3 ${cfg.iconBg}`}>
                                                            {getUrgencyIcon(notification.type)}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                                <h3 className={`text-lg font-bold leading-tight ${!notification.readAt ? 'text-ink' : 'text-ink-muted'}`}>
                                                                    {notification.title}
                                                                </h3>
                                                                <span className="self-start whitespace-nowrap rounded-full border border-rule bg-surface px-2.5 py-1 text-xs font-semibold text-neutral sm:self-auto">
                                                                    {formatRelativeTime(notification.sentAt)}
                                                                </span>
                                                            </div>

                                                            <p className={`mb-5 text-sm font-medium leading-relaxed ${!notification.readAt ? 'text-ink-muted' : 'text-neutral'}`}>
                                                                {notification.message}
                                                            </p>

                                                    <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-rule pt-4 text-xs font-semibold text-neutral">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            Expires: {formatDate(notification.expiryDate)}
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                snoozeNotification(notification._id);
                                                            }}
                                                            className="row-interactive inline-flex items-center gap-2 rounded-control border border-rule bg-surface px-3 py-1.5 text-xs font-semibold text-ink-muted"
                                                        >
                                                            Snooze
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                archiveNotification(notification._id);
                                                            }}
                                                            className="row-interactive inline-flex items-center gap-2 rounded-control border border-rule bg-surface px-3 py-1.5 text-xs font-semibold text-ink-muted"
                                                        >
                                                            Archive
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                        navigate(`/warranties/${notification.warrantyId?._id}`);
                                                                    }}
                                                                    className="row-interactive ml-auto inline-flex items-center gap-2 rounded-control border border-accent bg-accent px-3 py-1.5 text-xs font-semibold text-on-accent sm:ml-0"
                                                                >
                                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                                    View Details
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {!notification.readAt && (
                                                        <motion.div
                                                            className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-accent"
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

