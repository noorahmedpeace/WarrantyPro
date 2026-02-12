import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { claimsApi } from '../lib/api';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowingButton } from '../components/ui/GlowingButton';

export const CreateClaim = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        issue_description: '',
        notes: '',
        service_center: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await claimsApi.create(id!, formData);
            navigate(`/warranties/${id}`);
        } catch (error) {
            console.error('Failed to create claim', error);
            alert('Failed to submit claim');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-24 pt-8 px-4">
            <button
                onClick={() => navigate(`/warranties/${id}`)}
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Warranty
            </button>

            <GlassCard>
                <h2 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    File a Warranty Claim
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                            Issue Description *
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={formData.issue_description}
                            onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                            placeholder="Describe the issue you're experiencing..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                            Preferred Service Center
                        </label>
                        <input
                            type="text"
                            value={formData.service_center}
                            onChange={(e) => setFormData({ ...formData, service_center: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="Enter service center name or location"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                            Additional Notes
                        </label>
                        <textarea
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                            placeholder="Any additional information..."
                        />
                    </div>

                    <div className="pt-6">
                        <GlowingButton type="submit" className="w-full py-4 text-lg" isLoading={loading}>
                            <Save className="w-5 h-5" />
                            Submit Claim
                        </GlowingButton>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};
