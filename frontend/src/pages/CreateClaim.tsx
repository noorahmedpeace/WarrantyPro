import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { claimsApi } from '../lib/api';
import { GlowingButton } from '../components/ui/GlowingButton';

export const CreateClaim = () => {
    const { id: paramId } = useParams();
    const [searchParams] = useSearchParams();
    const id = paramId || searchParams.get('warrantyId');
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
                className="flex items-center gap-2 text-slate-500 font-semibold hover:text-slate-800 mb-8 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Warranty
            </button>

            <div className="neu-card bg-white p-6 md:p-8 shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold mb-8 text-slate-900 tracking-tight border-b border-slate-100 pb-6">
                    File a Warranty Claim
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Issue Description *
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={formData.issue_description}
                            onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
                            className="neu-input w-full"
                            placeholder="Describe the issue you're experiencing..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Preferred Service Center
                        </label>
                        <input
                            type="text"
                            value={formData.service_center}
                            onChange={(e) => setFormData({ ...formData, service_center: e.target.value })}
                            className="neu-input w-full"
                            placeholder="Enter service center name or location"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Additional Notes
                        </label>
                        <textarea
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="neu-input w-full"
                            placeholder="Any additional information..."
                        />
                    </div>

                    <div className="pt-6">
                        <GlowingButton type="submit" className="w-full py-3.5 text-base" isLoading={loading}>
                            <Save className="w-5 h-5 mr-2" />
                            Submit Claim
                        </GlowingButton>
                    </div>
                </form>
            </div>
        </div>
    );
};
