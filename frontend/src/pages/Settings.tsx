import { useState, useEffect } from 'react';
import { Save, Bell, Sliders, Download, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
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

    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const token = localStorage.getItem('warranty_token');
            const res = await fetch(`${BASE_URL}/settings`, {
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
            const res = await fetch(`${BASE_URL}/settings`, {
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
            const res = await fetch(`${BASE_URL}/warranties`, {
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
        <div className="pb-32 pt-8 px-4 max-w-4xl mx-auto">
            <header className="mb-10 border-b-4 border-dark pb-6">
                <h1 className="text-4xl md:text-5xl font-black text-dark mb-2 uppercase tracking-tighter">
                    Settings
                </h1>
                <p className="text-dark font-bold text-lg inline-block bg-secondary px-2 border-2 border-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    Customize your warranty management experience
                </p>
            </header>

            <div className="space-y-8">
                {/* Profile Section */}
                <div className="neu-card bg-white p-6 md:p-8">
                    <div className="flex items-center gap-4 mb-6 border-b-4 border-dark pb-6">
                        <div className="p-3 bg-accent border-4 border-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <User className="w-8 h-8 text-dark" strokeWidth={3} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-dark uppercase tracking-tighter">Profile</h2>
                            <p className="text-dark font-bold">Your account information</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-sm text-dark bg-secondary px-2 border-2 border-dark uppercase tracking-wider font-black inline-block mb-2">Name</label>
                            <p className="text-dark font-bold text-xl">{user?.name}</p>
                        </div>
                        <div>
                            <label className="text-sm text-dark bg-secondary px-2 border-2 border-dark uppercase tracking-wider font-black inline-block mb-2">Email</label>
                            <p className="text-dark font-bold text-xl">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Alert Preferences */}
                <div className="neu-card bg-white p-6 md:p-8">
                    <div className="flex items-center gap-4 mb-6 border-b-4 border-dark pb-6">
                        <div className="p-3 bg-secondary border-4 border-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <Sliders className="w-8 h-8 text-dark" strokeWidth={3} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-dark uppercase tracking-tighter">Alert Preferences</h2>
                            <p className="text-dark font-bold">Customize when you get reminded</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-base text-dark uppercase tracking-wider font-black block mb-4">
                                Alert Days Before Expiry
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[7, 14, 30, 60].map(days => (
                                    <button
                                        key={days}
                                        onClick={() => setSettings({ ...settings, alert_days_before: days })}
                                        className={`p-4 border-4 border-dark font-black text-lg transition-all ${settings.alert_days_before === days
                                            ? 'bg-primary text-dark shadow-neu translate-x-[-2px] translate-y-[-2px]'
                                            : 'bg-white text-dark hover:bg-slate-100'
                                            }`}
                                    >
                                        {days} DAYS
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="neu-card bg-white p-6 md:p-8">
                    <div className="flex items-center gap-4 mb-6 border-b-4 border-dark pb-6">
                        <div className="p-3 bg-primary border-4 border-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <Bell className="w-8 h-8 text-dark" strokeWidth={3} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-dark uppercase tracking-tighter">Notifications</h2>
                            <p className="text-dark font-bold">Choose how you want to be notified</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-5 bg-white border-4 border-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                             onClick={() => setSettings({ ...settings, email_notifications: !settings.email_notifications })}>
                            <div>
                                <h3 className="font-black text-dark text-xl uppercase">Email Notifications</h3>
                                <p className="text-dark font-bold">Receive alerts via email</p>
                            </div>
                            <div className={`w-8 h-8 border-4 border-dark flex items-center justify-center transition-colors ${settings.email_notifications ? 'bg-primary' : 'bg-white'}`}>
                                {settings.email_notifications && <div className="w-3 h-3 bg-dark" />}
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-5 bg-white border-4 border-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                             onClick={() => setSettings({ ...settings, push_notifications: !settings.push_notifications })}>
                            <div>
                                <h3 className="font-black text-dark text-xl uppercase">Push Notifications</h3>
                                <p className="text-dark font-bold">Receive browser push notifications</p>
                            </div>
                            <div className={`w-8 h-8 border-4 border-dark flex items-center justify-center transition-colors ${settings.push_notifications ? 'bg-primary' : 'bg-white'}`}>
                                {settings.push_notifications && <div className="w-3 h-3 bg-dark" />}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Management */}
                <div className="neu-card bg-white p-6 md:p-8">
                    <div className="flex items-center gap-4 mb-6 border-b-4 border-dark pb-6">
                        <div className="p-3 bg-slate-200 border-4 border-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <Download className="w-8 h-8 text-dark" strokeWidth={3} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-dark uppercase tracking-tighter">Data Management</h2>
                            <p className="text-dark font-bold">Export your warranty data</p>
                        </div>
                    </div>

                    <GlowingButton variant="secondary" onClick={exportData} className="w-full py-4 text-xl">
                        <Download className="w-6 h-6 mr-2" strokeWidth={3} />
                        EXPORT ALL WARRANTIES (JSON)
                    </GlowingButton>
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-6 mt-12 bg-white border-4 border-dark p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <GlowingButton onClick={handleSave} className="flex-1 py-4 text-xl" isLoading={loading}>
                        <Save className="w-6 h-6 mr-2" strokeWidth={3} />
                        SAVE SETTINGS
                    </GlowingButton>
                    {saved && (
                        <div className="bg-primary text-dark font-black uppercase tracking-widest px-6 py-4 border-4 border-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce text-xl">
                            ✓ SAVED!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
