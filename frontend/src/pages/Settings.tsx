import { useEffect, useState } from 'react';
import { Bell, Download, Save, ShieldCheck, Sliders, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GlowingButton } from '../components/ui/GlowingButton';
import { BASE_URL } from '../lib/api';

export const Settings = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState({
        alert_days_before: 30,
        email_notifications: true,
        push_notifications: false,
        digest_frequency: 'instant',
        critical_only: false,
        weekend_reminders: true,
        theme: 'dark',
        language: 'en',
    });
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const token = localStorage.getItem('warranty_token');
                const res = await fetch(`${BASE_URL}/settings`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setSettings((current) => ({ ...current, ...data }));
            } catch (error) {
                console.error('Failed to load settings', error);
            }
        };

        loadSettings();
    }, [BASE_URL]);

    const handleSave = async () => {
        setLoading(true);
        setSaved(false);
        try {
            const token = localStorage.getItem('warranty_token');
            await fetch(`${BASE_URL}/settings`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(settings),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (error) {
            console.error('Failed to save settings', error);
        } finally {
            setLoading(false);
        }
    };

    const exportData = async () => {
        try {
            const token = localStorage.getItem('warranty_token');
            const res = await fetch(`${BASE_URL}/warranties`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const warranties = await res.json();
            const dataStr = JSON.stringify(warranties, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `warranties-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export data', error);
        }
    };

    return (
        <div className="page-shell max-w-4xl">
            <header className="page-header">
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Tune reminders, notifications, and export controls from one secure preferences space.</p>
            </header>

            <div className="mb-6 grid gap-4 md:grid-cols-3">
                <SummaryPill label="Reminder Window" value={`${settings.alert_days_before} days`} helper="Current expiry lead time" />
                <SummaryPill label="Channels Enabled" value={`${Number(settings.email_notifications) + Number(settings.push_notifications)}`} helper="Notification delivery modes active" />
                <SummaryPill label="Reminder Mode" value={settings.critical_only ? 'Critical Only' : 'Balanced'} helper={`Digest: ${settings.digest_frequency}`} />
                <SummaryPill label="Workspace State" value="Protected" helper="Account and exports are secured" />
            </div>

            <div className="space-y-6">
                <Section icon={<User className="w-5 h-5" />} title="Profile" subtitle="Your account information">
                    <div className="space-y-5">
                        <Info label="Name" value={user?.name || 'Account Owner'} />
                        <Info label="Email" value={user?.email || 'No email'} />
                    </div>
                </Section>

                <Section icon={<Sliders className="w-5 h-5" />} title="Alert Preferences" subtitle="Choose how early the system warns you">
                    <div>
                        <label className="page-label block mb-4">Alert Days Before Expiry</label>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            {[7, 14, 30, 60].map((days) => (
                                <button
                                    key={days}
                                    onClick={() => setSettings({ ...settings, alert_days_before: days })}
                                    className={`rounded-xl px-4 py-4 text-base font-bold transition-all ${
                                        settings.alert_days_before === days
                                            ? 'border border-sky-200 bg-sky-50 text-sky-700 shadow-[0_10px_20px_rgba(14,165,233,0.10)]'
                                            : 'border border-slate-200 bg-white text-slate-700'
                                    }`}
                                >
                                    {days} Days
                                </button>
                            ))}
                        </div>
                    </div>
                </Section>

                <Section icon={<Bell className="w-5 h-5" />} title="Notifications" subtitle="Select how Warranty Pro reaches you">
                    <div className="space-y-3">
                        <ToggleRow
                            title="Email Notifications"
                            description="Receive alerts via email"
                            enabled={settings.email_notifications}
                            onClick={() => setSettings({ ...settings, email_notifications: !settings.email_notifications })}
                        />
                        <ToggleRow
                            title="Push Notifications"
                            description="Receive browser push notifications"
                            enabled={settings.push_notifications}
                            onClick={() => setSettings({ ...settings, push_notifications: !settings.push_notifications })}
                        />
                    </div>
                </Section>

                <Section icon={<Bell className="w-5 h-5" />} title="Reminder Strategy" subtitle="Control how focused or chatty your alerts should feel">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-[1.3rem] border border-slate-200 bg-[#fbfdff] p-5">
                            <label className="page-label block mb-3">Digest Frequency</label>
                            <div className="grid gap-3 sm:grid-cols-3">
                                {['instant', 'daily', 'weekly'].map((frequency) => (
                                    <button
                                        key={frequency}
                                        onClick={() => setSettings({ ...settings, digest_frequency: frequency })}
                                        className={`rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                                            settings.digest_frequency === frequency
                                                ? 'border border-sky-200 bg-sky-50 text-sky-700 shadow-[0_10px_20px_rgba(14,165,233,0.10)]'
                                                : 'border border-slate-200 bg-white text-slate-700'
                                        }`}
                                    >
                                        {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <ToggleRow
                                title="Critical Alerts Only"
                                description="Only surface expiry alerts that need faster action"
                                enabled={settings.critical_only}
                                onClick={() => setSettings({ ...settings, critical_only: !settings.critical_only })}
                            />
                            <ToggleRow
                                title="Weekend Reminders"
                                description="Allow reminder nudges on weekends as well"
                                enabled={settings.weekend_reminders}
                                onClick={() => setSettings({ ...settings, weekend_reminders: !settings.weekend_reminders })}
                            />
                        </div>
                    </div>
                </Section>

                <Section icon={<Download className="w-5 h-5" />} title="Data Management" subtitle="Create a portable archive of your records">
                    <GlowingButton variant="secondary" onClick={exportData} className="w-full py-3.5 text-base">
                        <Download className="w-5 h-5 mr-2" />
                        Export All Warranties (JSON)
                    </GlowingButton>
                </Section>

                <Section icon={<ShieldCheck className="w-5 h-5" />} title="Workspace Assurance" subtitle="A quick health snapshot for this account">
                    <div className="grid gap-4 md:grid-cols-2">
                        <AssuranceCard
                            title="Protected access"
                            description="Your saved preferences and warranty exports stay tied to the signed-in account."
                        />
                        <AssuranceCard
                            title="Reminder controls"
                            description="Email and push delivery can be adjusted anytime without affecting your saved records."
                        />
                    </div>
                </Section>

                <div className="page-section flex items-center gap-4">
                    <GlowingButton onClick={handleSave} className="flex-1 py-3.5 text-base" isLoading={loading}>
                        <Save className="w-5 h-5 mr-2" />
                        Save Settings
                    </GlowingButton>
                    {saved && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm font-bold text-emerald-700">
                            Saved
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SummaryPill = ({ label, value, helper }: { label: string; value: string; helper: string }) => (
    <div className="rounded-[1.45rem] border border-slate-200 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-slate-400">{label}</p>
        <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950">{value}</div>
        <p className="mt-2 text-sm text-slate-600">{helper}</p>
    </div>
);

const Section = ({
    icon,
    title,
    subtitle,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    children: React.ReactNode;
}) => (
    <div className="page-section">
        <div className="mb-6 flex items-center gap-4 border-b border-slate-200 pb-6">
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sky-600">
                {icon}
            </div>
            <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-950">{title}</h2>
                <p className="text-sm text-slate-600">{subtitle}</p>
            </div>
        </div>
        {children}
    </div>
);

const Info = ({ label, value }: { label: string; value: string }) => (
    <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-[0.22em] block mb-1.5">{label}</label>
        <p className="text-lg font-semibold text-slate-950">{value}</p>
    </div>
);

const ToggleRow = ({
    title,
    description,
    enabled,
    onClick,
}: {
    title: string;
    description: string;
    enabled: boolean;
    onClick: () => void;
}) => (
    <div
        className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-[#fbfdff] p-4 transition-colors hover:bg-slate-50"
        onClick={onClick}
    >
        <div>
            <h3 className="font-semibold text-slate-950">{title}</h3>
            <p className="text-sm text-slate-600">{description}</p>
        </div>
        <div className={`status-toggle ${enabled ? 'bg-sky-500 border-sky-500' : ''}`}>
            <div className={`status-toggle-knob ${enabled ? 'left-7' : 'left-1'}`} />
        </div>
    </div>
);

const AssuranceCard = ({ title, description }: { title: string; description: string }) => (
    <div className="rounded-[1.3rem] border border-slate-200 bg-[#fbfdff] p-5">
        <h3 className="text-base font-semibold text-slate-950">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
    </div>
);

