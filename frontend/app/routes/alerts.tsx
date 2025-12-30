import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Bell,
    ShieldCheck,
    AlertTriangle,
    Info,
    CheckCircle,
    X,
    Eye
} from "lucide-react";
import { alertsApi } from "~/lib/api";
import { cn, formatDate } from "~/lib/utils";
import { ClientOnly } from "~/components/ClientOnly";
import { useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
    try {
        const alerts = await alertsApi.getAll("temp-user-id");
        return json({ alerts });
    } catch (error) {
        return json({ alerts: [], error: "Failed to load alerts" });
    }
}

export default function AlertsCenter() {
    const { alerts: initialAlerts, error } = useLoaderData<typeof loader>();
    const [alerts, setAlerts] = useState(initialAlerts);

    const handleMarkAsRead = async (id: string) => {
        try {
            await alertsApi.markAsRead(id);
            setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a));
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    const handleDismiss = async (id: string) => {
        try {
            await alertsApi.dismiss(id);
            setAlerts(alerts.filter(a => a.id !== id));
        } catch (err) {
            console.error("Failed to dismiss", err);
        }
    };

    const unreadCount = alerts.filter(a => !a.read).length;
    const criticalAlerts = alerts.filter(a => a.severity === "CRITICAL");
    const warningAlerts = alerts.filter(a => a.severity === "WARNING");
    const infoAlerts = alerts.filter(a => a.severity === "INFO");

    return (
        <div className="min-h-screen mesh-gradient text-slate-100">
            <nav className="sticky top-0 z-30 bg-white/[0.02] backdrop-blur-3xl border-b border-white/5">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/" className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Dashboard
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/20">
                                <Bell className="h-4 w-4 text-blue-400" />
                            </div>
                            <span className="text-xs font-bold text-white tracking-tight uppercase">Alerts Center</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
                <motion.header
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Notification Hub</h1>
                    <p className="text-slate-400 font-medium">
                        {unreadCount > 0 ? (
                            <>You have <span className="text-blue-400 font-bold">{unreadCount}</span> unread notification{unreadCount !== 1 ? 's' : ''}.</>
                        ) : (
                            "All caught up! No new notifications."
                        )}
                    </p>
                </motion.header>

                {error && (
                    <div className="mb-8 glass-card rounded-2xl p-4 border-red-500/20 bg-red-500/10 flex items-center gap-3 text-red-400">
                        <AlertTriangle className="h-5 w-5" />
                        <p className="text-sm font-bold">{error}</p>
                    </div>
                )}

                <div className="space-y-8">
                    {criticalAlerts.length > 0 && (
                        <AlertSection
                            title="Critical Alerts"
                            severity="CRITICAL"
                            alerts={criticalAlerts}
                            onMarkAsRead={handleMarkAsRead}
                            onDismiss={handleDismiss}
                        />
                    )}

                    {warningAlerts.length > 0 && (
                        <AlertSection
                            title="Warnings"
                            severity="WARNING"
                            alerts={warningAlerts}
                            onMarkAsRead={handleMarkAsRead}
                            onDismiss={handleDismiss}
                        />
                    )}

                    {infoAlerts.length > 0 && (
                        <AlertSection
                            title="Information"
                            severity="INFO"
                            alerts={infoAlerts}
                            onMarkAsRead={handleMarkAsRead}
                            onDismiss={handleDismiss}
                        />
                    )}

                    {alerts.length === 0 && !error && (
                        <div className="glass-card rounded-3xl p-16 text-center">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600/20 border border-blue-500/20">
                                <CheckCircle className="h-10 w-10 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">All Clear!</h3>
                            <p className="text-sm text-slate-400">You don't have any active alerts at the moment.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function AlertSection({
    title,
    severity,
    alerts,
    onMarkAsRead,
    onDismiss
}: {
    title: string;
    severity: string;
    alerts: any[];
    onMarkAsRead: (id: string) => void;
    onDismiss: (id: string) => void;
}) {
    const severityConfig = {
        CRITICAL: { icon: AlertTriangle, color: "red", bgColor: "bg-red-500/10", borderColor: "border-red-500/20", textColor: "text-red-400" },
        WARNING: { icon: AlertTriangle, color: "amber", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20", textColor: "text-amber-400" },
        INFO: { icon: Info, color: "blue", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20", textColor: "text-blue-400" },
    };

    const config = severityConfig[severity as keyof typeof severityConfig];
    const Icon = config.icon;

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            <h2 className={cn("text-sm font-bold uppercase tracking-widest", config.textColor)}>
                {title} ({alerts.length})
            </h2>
            <div className="space-y-3">
                {alerts.map((alert, index) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                            "glass-card rounded-2xl p-5 transition-all relative group",
                            config.bgColor,
                            config.borderColor,
                            !alert.read && "ring-2 ring-blue-500/30"
                        )}
                    >
                        <div className="flex items-start gap-4">
                            <div className={cn("mt-1 flex h-10 w-10 items-center justify-center rounded-xl", config.bgColor, config.borderColor, "border")}>
                                <Icon className={cn("h-5 w-5", config.textColor)} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <h3 className="text-base font-bold text-white">{alert.title}</h3>
                                    {!alert.read && (
                                        <span className="px-2 py-0.5 rounded-full bg-blue-600 text-[9px] font-black uppercase tracking-wider text-white">New</span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-300 mb-3">{alert.message}</p>
                                <div className="flex items-center justify-between">
                                    <ClientOnly fallback={<span className="text-xs text-slate-500">Loading...</span>}>
                                        <span className="text-xs text-slate-500 font-medium">
                                            {formatDate(alert.created_at)}
                                        </span>
                                    </ClientOnly>
                                    <div className="flex items-center gap-2">
                                        {!alert.read && (
                                            <button
                                                onClick={() => onMarkAsRead(alert.id)}
                                                className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                                            >
                                                <Eye className="h-3 w-3" />
                                                Mark as Read
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onDismiss(alert.id)}
                                            className="text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
                                        >
                                            <X className="h-3 w-3" />
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}
