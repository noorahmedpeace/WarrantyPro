import { useState, useEffect } from 'react';
import { Save, Bell, Sliders, Download, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowingButton } from '../components/ui/GlowingButton';

export const Settings = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState({
        alert_days_before: 30,
        email_notifications: true,
        push_notifications: false,
        theme: 'dark',
        language: 'en'
    });
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const token = localStorage.getItem('warranty_token');
            const res = await fetch('http://localhost:3000/settings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setSettings(data);
        } catch (error) {
            console.error('Failed to load settings', error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setSaved(false);
        try {
            const token = localStorage.getItem('warranty_token');
            await fetch('http://localhost:3000/settings', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Failed to save settings', error);
        } finally {
            setLoading(false);
        }
    };

    const exportData = async () => {
        try {
            const token = localStorage.getItem('warranty_token');
            const res = await fetch('http://localhost:3000/warranties', {
                headers: { 'Authorization': `Bearer ${token}` }
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
        <div className="pb-24 pt-8 px-4 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-2">
                    Settings
                </h1>
                <p className="text-slate-400">Customize your warranty management experience</p>
            </header>

            <div className="space-y-6">
                {/* Profile Section */}
                <GlassCard>
                    <div className="flex items-center gap-4 mb-6">
                        <User className="w-10 h-10 text-blue-400" />
                        <div>
                            <h2 className="text-2xl font-bold text-white">Profile</h2>
                            <p className="text-slate-400 text-sm">Your account information</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400 uppercase tracking-wider font-bold">Name</label>
                            <p className="text-white mt-1">{user?.name}</p>
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 uppercase tracking-wider font-bold">Email</label>
                            <p className="text-white mt-1">{user?.email}</p>
                        </div>
                    </div>
                </GlassCard>

                {/* Alert Preferences */}
                <GlassCard>
                    <div className="flex items-center gap-4 mb-6">
                        <Sliders className="w-10 h-10 text-purple-400" />
                        <div>
                            <h2 className="text-2xl font-bold text-white">Alert Preferences</h2>
                            <p className="text-slate-400 text-sm">Customize when you get reminded</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400 uppercase tracking-wider font-bold block mb-2">
                                Alert Days Before Expiry
                            </label>
                            <div className="grid grid-cols-4 gap-3">
                                {[7, 14, 30, 60].map(days => (
                                    <button
                                        key={days}
                                        onClick={() => setSettings({ ...settings, alert_days_before: days })}
                                        className={`p-3 rounded-xl border-2 transition-all ${settings.alert_days_before === days
                                                ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                                                : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                                            }`}
                                    >
                                        {days} days
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Notifications */}
                <GlassCard>
                    <div className="flex items-center gap-4 mb-6">
                        <Bell className="w-10 h-10 text-green-400" />
                        <div>
                            <h2 className="text-2xl font-bold text-white">Notifications</h2>
                            <p className="text-slate-400 text-sm">Choose how you want to be notified</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                            <div>
                                <h3 className="font-bold text-white">Email Notifications</h3>
                                <p className="text-sm text-slate-400">Receive alerts via email</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, email_notifications: !settings.email_notifications })}
                                className={`relative w-14 h-8 rounded-full transition-colors ${settings.email_notifications ? 'bg-green-500' : 'bg-slate-600'
                                    }`}
                            >
                                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${settings.email_notifications ? 'translate-x-6' : ''
                                    }`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                            <div>
                                <h3 className="font-bold text-white">Push Notifications</h3>
                                <p className="text-sm text-slate-400">Receive browser push notifications</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, push_notifications: !settings.push_notifications })}
                                className={`relative w-14 h-8 rounded-full transition-colors ${settings.push_notifications ? 'bg-green-500' : 'bg-slate-600'
                                    }`}
                            >
                                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${settings.push_notifications ? 'translate-x-6' : ''
                                    }`} />
                            </button>
                        </div>
                    </div>
                </GlassCard>

                {/* Data Management */}
                <GlassCard>
                    <div className="flex items-center gap-4 mb-6">
                        <Download className="w-10 h-10 text-yellow-400" />
                        <div>
                            <h2 className="text-2xl font-bold text-white">Data Management</h2>
                            <p className="text-slate-400 text-sm">Export your warranty data</p>
                        </div>
                    </div>

                    <GlowingButton variant="secondary" onClick={exportData} className="w-full">
                        <Download className="w-5 h-5" />
                        Export All Warranties (JSON)
                    </GlowingButton>
                </GlassCard>

                {/* Save Button */}
                <div className="flex items-center gap-4">
                    <GlowingButton onClick={handleSave} className="flex-1 py-4" isLoading={loading}>
                        <Save className="w-5 h-5" />
                        Save Settings
                    </GlowingButton>
                    {saved && <span className="text-green-400 font-bold">✓ Saved!</span>}
                </div>
            </div>
        </div>
    );
};
