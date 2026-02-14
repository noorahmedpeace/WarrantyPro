import React, { useEffect, useState } from 'react';
import { Bell, Clock, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';
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
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
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

    const getUrgencyColor = (type: string) => {
        switch (type) {
            case '0d':
                return 'bg-red-500';
            case '7d':
                return 'bg-orange-500';
            case '30d':
                return 'bg-blue-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getUrgencyIcon = (type: string) => {
        switch (type) {
            case '0d':
                return <AlertCircle className="w-5 h-5" />;
            case '7d':
                return <Clock className="w-5 h-5" />;
            case '30d':
                return <Bell className="w-5 h-5" />;
            default:
                return <CheckCircle2 className="w-5 h-5" />;
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

    const formatTime = (dateString: string) => {
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
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Notifications</h1>
                        <p className="text-purple-100 text-sm mt-1">
                            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Bell className="w-8 h-8 opacity-80" />
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mt-4 overflow-x-auto">
                    {['all', '30d', '7d', '0d'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${filter === f
                                    ? 'bg-white text-purple-600 shadow-md'
                                    : 'bg-purple-500/30 text-white hover:bg-purple-500/50'
                                }`}
                        >
                            {f === 'all' ? 'All' : f === '30d' ? '30 Days' : f === '7d' ? '7 Days' : 'Urgent'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notifications List */}
            <div className="p-4 space-y-3">
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-16">
                        <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Notifications</h3>
                        <p className="text-gray-400">
                            {filter === 'all'
                                ? "You're all caught up!"
                                : `No ${filter} notifications`}
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map((notification) => (
                        <div
                            key={notification._id}
                            onClick={() => !notification.readAt && markAsRead(notification._id)}
                            className={`bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg cursor-pointer ${!notification.readAt ? 'border-l-4 border-purple-500' : ''
                                }`}
                        >
                            <div className="p-4">
                                <div className="flex items-start gap-3">
                                    {/* Icon */}
                                    <div className={`${getUrgencyColor(notification.type)} text-white p-2 rounded-lg flex-shrink-0`}>
                                        {getUrgencyIcon(notification.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-semibold text-gray-900 text-sm">
                                                {notification.title}
                                            </h3>
                                            {!notification.readAt && (
                                                <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-1"></span>
                                            )}
                                        </div>

                                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                                            {notification.message}
                                        </p>

                                        {/* Product Info */}
                                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(notification.expiryDate)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatTime(notification.sentAt)}
                                            </span>
                                        </div>

                                        {/* CTA Button */}
                                        {notification.type !== 'expired' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.location.href = `/warranties/${notification.warrantyId._id}`;
                                                }}
                                                className="mt-3 text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1"
                                            >
                                                View Warranty →
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
