import { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Globe, Clock, Navigation } from 'lucide-react';
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
            <header className="mb-10 border-b-4 border-dark pb-6">
                <h1 className="text-4xl md:text-5xl font-black text-dark mb-2 uppercase tracking-tighter">Service Centers</h1>
                <p className="text-dark font-bold text-lg inline-block bg-secondary px-2 border-2 border-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    Find authorized repair centers near you
                </p>
            </header>

            {/* Search & Filters */}
            <div className="neu-card bg-white mb-10 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-dark" strokeWidth={3} />
                        <input
                            type="text"
                            placeholder="Search by city or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border-4 border-dark px-4 py-3 pl-14 text-dark font-bold focus:outline-none focus:-translate-y-1 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder-slate-500 uppercase tracking-wide"
                        />
                    </div>
                    <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="bg-white border-4 border-dark px-4 py-3 text-dark font-bold focus:outline-none focus:-translate-y-1 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wide"
                    >
                        <option value="">All Brands</option>
                        {brands.map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Results Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-16 h-16 border-4 border-dark border-t-primary rounded-none animate-spin shadow-neu" />
                </div>
            ) : centers.length === 0 ? (
                <div className="neu-card bg-white text-center py-16 px-6">
                    <MapPin className="w-16 h-16 mx-auto mb-6 text-dark" strokeWidth={2} />
                    <p className="text-dark font-black text-2xl uppercase tracking-tighter">No service centers found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {centers.map(center => (
                        <div key={center._id} className="neu-card bg-white flex flex-col h-full p-6 transition-transform hover:-translate-y-2 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
                            <div className="flex items-start justify-between mb-4 border-b-2 border-dark pb-4">
                                <div>
                                    <h3 className="font-black text-dark text-xl uppercase leading-tight line-clamp-2">{center.name}</h3>
                                    <p className="text-dark bg-secondary inline-block px-1 border-2 border-dark text-sm font-black uppercase mt-2 tracking-wider">{center.brand}</p>
                                </div>
                                {center.authorized && (
                                    <span className="px-2 py-1 bg-primary text-dark text-xs font-black uppercase border-2 border-dark shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0 ml-2">
                                        Authorized
                                    </span>
                                )}
                            </div>

                            <div className="space-y-4 flex-1 mt-2">
                                <div className="flex items-start gap-3 text-dark font-bold text-sm">
                                    <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-dark" strokeWidth={3} />
                                    <span>{center.address}, {center.city}</span>
                                </div>
                                <div className="flex items-center gap-3 text-dark font-bold text-sm">
                                    <Phone className="w-5 h-5 flex-shrink-0 text-dark" strokeWidth={3} />
                                    <span>{center.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-dark font-bold text-sm">
                                    <Clock className="w-5 h-5 flex-shrink-0 text-dark" strokeWidth={3} />
                                    <span>{center.openingHours}</span>
                                </div>
                                {center.website && (
                                    <div className="flex items-center gap-3 text-dark font-bold text-sm">
                                        <Globe className="w-5 h-5 flex-shrink-0 text-dark" strokeWidth={3} />
                                        <a href={center.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors truncate underline decoration-2 underline-offset-4">
                                            Visit Website
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t-4 border-dark">
                                <GlowingButton
                                    variant="secondary"
                                    className="w-full flex justify-center py-3"
                                    onClick={() => handleGetDirections(center)}
                                >
                                    <Navigation className="w-5 h-5 text-dark mr-2" strokeWidth={3} />
                                    GET DIRECTIONS
                                </GlowingButton>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
