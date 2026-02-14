import { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Globe, Clock, Navigation } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
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
    coordinates?: {
        lat: number;
        lng: number;
    };
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
    const [selectedCity, setSelectedCity] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            loadCenters();
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, selectedBrand, selectedCity]);

    const loadData = async () => {
        try {
            const [brandsData] = await Promise.all([
                apiRequest<{ brands: string[] }>('/service-centers/brands'),
                loadCenters()
            ]);
            setBrands(brandsData.brands);
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    };

    const loadCenters = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (searchTerm) queryParams.append('search', searchTerm); // Use generic search
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
        <div className="min-h-screen pb-32 pt-8 px-4 max-w-6xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Service Centers</h1>
                <p className="text-slate-400">Find authorized repair centers near you</p>
            </header>

            {/* Search & Filters */}
            <GlassCard className="mb-8 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by city or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors [&>option]:bg-slate-900"
                    >
                        <option value="">All Brands</option>
                        {brands.map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                        ))}
                    </select>
                </div>
            </GlassCard>

            {/* Results Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : centers.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                    <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No service centers found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {centers.map(center => (
                        <GlassCard key={center._id} className="flex flex-col h-full">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-white text-lg line-clamp-1">{center.name}</h3>
                                    <p className="text-blue-400 text-sm font-medium">{center.brand}</p>
                                </div>
                                {center.authorized && (
                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/20">
                                        Authorized
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3 flex-1">
                                <div className="flex items-start gap-3 text-slate-300 text-sm">
                                    <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-slate-500" />
                                    <span>{center.address}, {center.city}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-300 text-sm">
                                    <Phone className="w-4 h-4 flex-shrink-0 text-slate-500" />
                                    <span>{center.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-300 text-sm">
                                    <Clock className="w-4 h-4 flex-shrink-0 text-slate-500" />
                                    <span>{center.openingHours}</span>
                                </div>
                                {center.website && (
                                    <div className="flex items-center gap-3 text-slate-300 text-sm">
                                        <Globe className="w-4 h-4 flex-shrink-0 text-slate-500" />
                                        <a href={center.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors truncate">
                                            Visit Website
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/10">
                                <GlowingButton
                                    variant="secondary"
                                    className="w-full"
                                    onClick={() => handleGetDirections(center)}
                                >
                                    <Navigation className="w-4 h-4 text-blue-400" />
                                    Get Directions
                                </GlowingButton>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
};
