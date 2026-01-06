import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useNavigation, Link } from "@remix-run/react";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Settings as SettingsIcon,
    Bell,
    Globe,
    Palette,
    Save,
    ShieldCheck
} from "lucide-react";
import { settingsApi } from "~/lib/api";
import { useState, useEffect } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
    try {
        const settings = await settingsApi.get();
        return json({ settings });
    } catch (error) {
        return json({ settings: null, error: "Failed to load settings" });
    }
}

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const payload = {
        email_notifications: data.email_notifications === "true",
        alert_days_before: parseInt(data.alert_days_before as string),
    };

    try {
        await settingsApi.update(payload);
        return json({ success: true });
    } catch (error: any) {
        return json({ error: error.message || "Failed to save settings" }, { status: 400 });
    }
}

export default function Configuration() {
    const { settings: initialSettings, error } = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const [emailNotifications, setEmailNotifications] = useState(initialSettings?.email_notifications ?? true);
    const [alertDaysBefore, setAlertDaysBefore] = useState(initialSettings?.alert_days_before ?? 30);
    const [showSaved, setShowSaved] = useState(false);

    useEffect(() => {
        if (navigation.state === "idle" && navigation.formData) {
            setShowSaved(true);
            setTimeout(() => setShowSaved(false), 3000);
        }
    }, [navigation.state]);

    return (
        <div className="min-h-screen mesh-gradient text-slate-100">
            <nav className="sticky top-0 z-30 bg-white/[0.02] backdrop-blur-3xl border-b border-white/5">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/" className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Dashboard
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-indigo-600/20 flex items-center justify-center border border-indigo-500/20">
                                <SettingsIcon className="h-4 w-4 text-indigo-400" />
                            </div>
                            <span className="text-xs font-bold text-white tracking-tight uppercase">Configuration</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
                <motion.header
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">System Preferences</h1>
                    <p className="text-slate-400 font-medium">Customize your warranty management experience.</p>
                </motion.header>

                {error && (
                    <div className="mb-8 glass-card rounded-2xl p-4 border-red-500/20 bg-red-500/10 text-red-400 text-sm font-bold">
                        {error}
                    </div>
                )}

                {showSaved && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mb-8 glass-card rounded-2xl p-4 border-green-500/20 bg-green-500/10 text-green-400 text-sm font-bold flex items-center gap-2"
                    >
                        <Save className="h-4 w-4" />
                        Settings saved successfully!
                    </motion.div>
                )}

                <Form method="post" className="space-y-6">
                    {/* Notification Preferences */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-3xl p-8 space-y-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/20">
                                <Bell className="h-5 w-5 text-blue-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Notification Preferences</h2>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                            <div>
                                <label htmlFor="email_notifications" className="text-sm font-bold text-white block mb-1">
                                    Email Notifications
                                </label>
                                <p className="text-xs text-slate-400">Receive email alerts for expiring warranties</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="email_notifications"
                                    id="email_notifications"
                                    checked={emailNotifications}
                                    onChange={(e) => setEmailNotifications(e.target.checked)}
                                    value={emailNotifications.toString()}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <label htmlFor="alert_days_before" className="text-sm font-bold text-white block mb-3">
                                Alert Timing
                            </label>
                            <p className="text-xs text-slate-400 mb-4">Generate alerts this many days before expiry</p>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    name="alert_days_before"
                                    id="alert_days_before"
                                    min="7"
                                    max="90"
                                    value={alertDaysBefore}
                                    onChange={(e) => setAlertDaysBefore(parseInt(e.target.value))}
                                    className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <span className="text-2xl font-bold text-blue-400 min-w-[4rem] text-right">{alertDaysBefore} days</span>
                            </div>
                        </div>
                    </motion.section>

                    {/* Appearance (Coming Soon) */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card rounded-3xl p-8 opacity-50"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-xl bg-purple-600/20 flex items-center justify-center border border-purple-500/20">
                                <Palette className="h-5 w-5 text-purple-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Appearance</h2>
                            <span className="px-2 py-1 rounded-full bg-purple-600/20 text-[9px] font-black uppercase tracking-wider text-purple-400">Coming Soon</span>
                        </div>
                        <p className="text-sm text-slate-400">Theme customization will be available in a future update.</p>
                    </motion.section>

                    {/* Language (Coming Soon) */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card rounded-3xl p-8 opacity-50"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-xl bg-amber-600/20 flex items-center justify-center border border-amber-500/20">
                                <Globe className="h-5 w-5 text-amber-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Language & Region</h2>
                            <span className="px-2 py-1 rounded-full bg-amber-600/20 text-[9px] font-black uppercase tracking-wider text-amber-400">Coming Soon</span>
                        </div>
                        <p className="text-sm text-slate-400">Multi-language support will be available in a future update.</p>
                    </motion.section>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full luxury-button flex items-center justify-center rounded-2xl px-6 py-4 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>Saving...</>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Preferences
                            </>
                        )}
                    </button>
                </Form>
            </main>
        </div>
    );
}
