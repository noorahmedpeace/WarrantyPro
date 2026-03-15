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
                className="flex items-center gap-2 text-dark font-bold hover:bg-secondary inline-flex px-4 py-2 border-2 border-transparent hover:border-dark hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-8 transition-all uppercase"
            >
                <ArrowLeft className="w-5 h-5" strokeWidth={3} />
                Back to Warranty
            </button>

            <div className="neu-card bg-white p-6 md:p-8">
                <h2 className="text-4xl font-black mb-8 text-dark tracking-tighter uppercase border-b-4 border-dark pb-6">
                    File a Warranty Claim
                </h2>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-dark font-black uppercase tracking-wider text-sm bg-accent inline-block px-2 border-2 border-dark">
                            Issue Description *
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={formData.issue_description}
                            onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
                            className="neu-input"
                            placeholder="Describe the issue you're experiencing..."
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-dark font-black uppercase tracking-wider text-sm bg-accent inline-block px-2 border-2 border-dark">
                            Preferred Service Center
                        </label>
                        <input
                            type="text"
                            value={formData.service_center}
                            onChange={(e) => setFormData({ ...formData, service_center: e.target.value })}
                            className="neu-input"
                            placeholder="Enter service center name or location"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-dark font-black uppercase tracking-wider text-sm bg-accent inline-block px-2 border-2 border-dark">
                            Additional Notes
                        </label>
                        <textarea
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="neu-input"
                            placeholder="Any additional information..."
                        />
                    </div>

                    <div className="pt-8">
                        <GlowingButton type="submit" className="w-full py-4 text-xl tracking-tight" isLoading={loading}>
                            <Save className="w-6 h-6 mr-2" strokeWidth={3} />
                            SUBMIT CLAIM
                        </GlowingButton>
                    </div>
                </form>
            </div>
        </div>
    );
};
