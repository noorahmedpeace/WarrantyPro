import { useEffect, useState } from 'react';
import { Globe, MapPin, Navigation, Phone, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { GlowingButton } from '../components/ui/GlowingButton';
import { apiRequest } from '../lib/api';

interface ServiceCenter {
    _id: string;
    name: string;
    brand: string;
    address: string;
    city: string;
    phone: string;
    email?: string;
    website?: string;
    coordinates?: { lat: number; lng: number };
    openingHours: string;
    rating: number;
    authorized: boolean;
    categories: string[];
}

export const ServiceCenters = () => {
    const [centers, setCenters] = useState<ServiceCenter[]>([]);
    const [brands, setBrands] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedCity] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [brandsData] = await Promise.all([
                    apiRequest<{ brands: string[] }>('/service-centers/brands'),
                    loadCenters(),
                ]);
                setBrands(brandsData.brands);
            } catch (error) {
                console.error('Failed to load initial data:', error);
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            loadCenters();
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, selectedBrand, selectedCity]);

    const loadCenters = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (searchTerm) queryParams.append('search', searchTerm);
            if (selectedBrand) queryParams.append('brand', selectedBrand);
            if (selectedCity) queryParams.append('city', selectedCity);
            const data = await apiRequest<{ centers: ServiceCenter[] }>(`/service-centers?${queryParams.toString()}`);
            setCenters(data.centers);
        } catch (error) {
            console.error('Failed to load service centers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGetDirections = (center: ServiceCenter) => {
        if (center.coordinates) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${center.coordinates.lat},${center.coordinates.lng}`, '_blank');
        } else {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.name + ' ' + center.city)}`, '_blank');
        }
    };

    return (
        <div className="page-shell max-w-6xl">
            <header className="page-header">
                <h1 className="page-title">Service Centers</h1>
                <p className="page-subtitle">Find authorized partners, verify repair locations, and open directions instantly.</p>
            </header>

            <div className="mb-6 grid gap-4 md:grid-cols-3">
                <StatCard
                    label="Visible Centers"
                    value={loading ? '...' : String(centers.length)}
                    helper="Filtered support locations ready to review"
                    tone="sky"
                />
                <StatCard
                    label="Authorized"
                    value={loading ? '...' : String(centers.filter((center) => center.authorized).length)}
                    helper="Manufacturer-backed service partners"
                    tone="emerald"
                />
                <StatCard
                    label="Brands Covered"
                    value={String(brands.length)}
                    helper="Supported device ecosystems in your network"
                    tone="slate"
                />
            </div>

            <section className="page-section mb-6">
                <div className="flex flex-col gap-4 md:flex-row">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by city or center name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="neu-input w-full pl-12"
                        />
                    </div>
                    <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="neu-input md:w-64"
                    >
                        <option value="">All Brands</option>
                        {brands.map((brand) => (
                            <option key={brand} value={brand}>{brand}</option>
                        ))}
                    </select>
                </div>
            </section>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
                </div>
            ) : centers.length === 0 ? (
                    <div className="page-empty">
                        <MapPin className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                        <p className="text-lg font-semibold text-slate-950">No service centers found matching your criteria.</p>
                        <p className="mt-2 text-sm text-slate-600">Try a wider search, remove the brand filter, or search by city instead.</p>
                    </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {centers.map((center) => (
                        <div key={center._id} className="page-section p-6 flex flex-col h-full">
                            <div className="mb-4 flex items-start justify-between border-b border-slate-200 pb-4">
                                <div>
                                    <h3 className="line-clamp-2 text-lg font-bold leading-tight text-slate-950">{center.name}</h3>
                                    <p className="page-chip mt-2">{center.brand}</p>
                                </div>
                                {center.authorized && (
                                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                                        Authorized
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3 flex-1">
                                <Row icon={<MapPin className="w-4 h-4" />} text={`${center.address}, ${center.city}`} />
                                <Row icon={<Phone className="w-4 h-4" />} text={center.phone} />
                                <Row icon={<Navigation className="w-4 h-4" />} text={center.openingHours} />
                                <Row icon={<Sparkles className="w-4 h-4" />} text={`Rated ${center.rating?.toFixed?.(1) || center.rating || 'N/A'} / 5`} />
                                <Row icon={<ShieldCheck className="w-4 h-4" />} text={center.categories?.length ? center.categories.join(', ') : 'General service support'} />
                                {center.website && (
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Globe className="w-4 h-4 flex-shrink-0 text-slate-400" />
                                        <a href={center.website} target="_blank" rel="noopener noreferrer" className="truncate underline underline-offset-4 hover:text-slate-950">
                                            Visit Website
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 border-t border-slate-200 pt-5">
                                <GlowingButton
                                    variant="secondary"
                                    className="w-full flex justify-center py-3 text-sm"
                                    onClick={() => handleGetDirections(center)}
                                >
                                    <Navigation className="w-4 h-4 mr-2" />
                                    Get Directions
                                </GlowingButton>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const Row = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
    <div className="flex items-start gap-3 text-sm text-slate-600">
        <div className="mt-0.5 text-slate-400">{icon}</div>
        <span>{text}</span>
    </div>
);

const StatCard = ({
    label,
    value,
    helper,
    tone,
}: {
    label: string;
    value: string;
    helper: string;
    tone: 'sky' | 'emerald' | 'slate';
}) => {
    const toneClass =
        tone === 'sky'
            ? 'border-sky-200 bg-sky-50/60'
            : tone === 'emerald'
                ? 'border-emerald-200 bg-emerald-50/60'
                : 'border-slate-200 bg-white';

    return (
        <div className={`rounded-[1.45rem] border p-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)] ${toneClass}`}>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-slate-400">{label}</p>
            <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950">{value}</div>
            <p className="mt-2 text-sm text-slate-600">{helper}</p>
        </div>
    );
};
