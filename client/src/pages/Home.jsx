import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Settings, ShieldCheck, Zap, ArrowRight, UserCheck, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [locationQuery, setLocationQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const { data } = await API.get('/providers');
                setProviders(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchProviders();
    }, []);

    const handleSearch = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            const params = new URLSearchParams();
            if (searchQuery.trim()) params.append('category', searchQuery.trim());
            if (locationQuery.trim()) params.append('city', locationQuery.trim());
            navigate(`/providers?${params.toString()}`);
        }
    };

    const categories = [
        { name: 'Plumber', icon: '🪠', color: 'bg-blue-100' },
        { name: 'Electrician', icon: '⚡', color: 'bg-yellow-100' },
        { name: 'Cleaner', icon: '🧹', color: 'bg-green-100' },
        { name: 'Carpenter', icon: '🪵', color: 'bg-orange-100' },
        { name: 'Painter', icon: '🎨', color: 'bg-purple-100' },
        { name: 'Gardener', icon: '🌱', color: 'bg-emerald-100' },
        { name: 'AC Mechanic', icon: '❄️', color: 'bg-cyan-100' },
        { name: 'Pest Control', icon: '🦟', color: 'bg-red-100' },
    ];

    const stats = [
        { label: 'Verified Partners', value: '5,000+', icon: UserCheck, color: 'text-blue-600' },
        { label: 'Happy Customers', value: '50,000+', icon: Star, color: 'text-yellow-500' },
        { label: 'Secured Payments', value: '100%', icon: Shield, color: 'text-green-600' }
    ];

    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden bg-slate-900 border-b border-slate-800">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center space-y-10 max-w-4xl mx-auto">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-900/40 border border-primary-500/20 rounded-full"
                        >
                            <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></span>
                            <span className="text-primary-300 text-xs font-bold uppercase tracking-widest">New: Instant Booking Available</span>
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight"
                        >
                            Professional Services <br /> 
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-primary-300 to-secondary-400">
                                Delivered to Your Home
                            </span>
                        </motion.h1>

                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-slate-400 font-medium max-w-2xl mx-auto"
                        >
                            Find trusted, verified professionals for all your household needs 
                            within minutes. From plumbing to deep cleaning, we've got you covered.
                        </motion.p>
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col lg:flex-row items-center justify-center space-y-4 lg:space-y-0 lg:space-x-4 glass p-4 rounded-[2.5rem] border-slate-700/30"
                        >
                            <div className="relative w-full lg:w-72">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-400 w-5 h-5" />
                                <input 
                                    type="text" 
                                    placeholder="Which service?"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleSearch}
                                    className="w-full h-16 pl-14 pr-6 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-4 focus:ring-primary-500/10 placeholder-slate-500 outline-none transition-all font-bold"
                                />
                            </div>
                            <div className="relative w-full lg:w-72">
                                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-400 w-5 h-5" />
                                <input 
                                    type="text" 
                                    placeholder="Enter Location"
                                    value={locationQuery}
                                    onChange={(e) => setLocationQuery(e.target.value)}
                                    onKeyDown={handleSearch}
                                    className="w-full h-16 pl-14 pr-6 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-4 focus:ring-primary-500/10 placeholder-slate-500 outline-none transition-all font-bold"
                                />
                            </div>
                            <button 
                                onClick={handleSearch}
                                className="h-16 w-full lg:w-20 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-primary-500/20 active:scale-95 group flex items-center justify-center"
                            >
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-16">
                        <div className="space-y-3">
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Browse Categories</h2>
                            <p className="text-slate-500 font-medium">Explore over 50+ professional services</p>
                        </div>
                        <Link to="/providers" className="text-primary-600 font-bold group flex items-center space-x-2 bg-primary-50 px-6 py-2.5 rounded-xl hover:bg-primary-100 transition-all">
                            <span>View All</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1">
                        {categories.map((cat, idx) => (
                            <Link 
                                to={`/providers?category=${cat.name}`}
                                key={cat.name}
                            >
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group p-6 text-center rounded-3xl hover:bg-slate-50 cursor-pointer transition-all duration-300"
                                >
                                    <div className={`w-16 h-16 ${cat.color} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform group-hover:shadow-lg duration-300`}>
                                        {cat.icon}
                                    </div>
                                    <span className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-primary-600 transition-colors">{cat.name}</span>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Live Providers Section */}
            <section className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div className="space-y-3">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Discover Nearby Experts</h2>
                            <p className="text-slate-500 font-medium">Top-rated professionals serving your area right now</p>
                        </div>
                        {locationQuery && (
                            <div className="flex items-center space-x-3 bg-primary-50 px-6 py-3 rounded-2xl border border-primary-100">
                                <MapPin className="w-5 h-5 text-primary-600" />
                                <span className="font-black text-primary-700 uppercase text-xs tracking-widest">Zone: {locationQuery}</span>
                                <button onClick={() => setLocationQuery('')} className="text-slate-400 hover:text-red-500 ml-4 font-black">×</button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {loading ? (
                            [1,2,3].map(i => <div key={i} className="h-80 bg-slate-100 rounded-[3rem] animate-pulse"></div>)
                        ) : providers.filter(p => !locationQuery || 
                                (p.city && p.city.toLowerCase().includes(locationQuery.toLowerCase())) ||
                                (p.location?.city && p.location.city.toLowerCase().includes(locationQuery.toLowerCase())) || 
                                (p.serviceableCities?.some(c => c.toLowerCase().includes(locationQuery.toLowerCase())))
                            ).length === 0 ? (
                            <div className="col-span-full py-20 text-center bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
                                <div className="bg-white w-20 h-20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl">
                                    <Search className="w-10 h-10 text-slate-200" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900">No experts found in this zone</h3>
                                <p className="text-slate-500 font-medium mt-2">Try searching a neighboring city or broaden your request</p>
                            </div>
                        ) : (
                            providers.filter(p => !locationQuery || 
                                (p.city && p.city.toLowerCase().includes(locationQuery.toLowerCase())) ||
                                (p.location?.city && p.location.city.toLowerCase().includes(locationQuery.toLowerCase())) || 
                                (p.serviceableCities?.some(c => c.toLowerCase().includes(locationQuery.toLowerCase())))
                            ).slice(0, 6).map((p, i) => (
                                <motion.div 
                                    key={p._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group bg-white rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col"
                                >
                                    <div className="p-8 space-y-6 flex-grow">
                                        <div className="flex justify-between items-start">
                                            <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white text-xl font-black group-hover:rotate-6 transition-transform">
                                                {p.user?.name?.[0]}
                                            </div>
                                            <div className="flex items-center space-x-1 bg-yellow-400 text-slate-900 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-yellow-200">
                                                <Star className="w-3 h-3 fill-current" />
                                                <span>{p.averageRating || 'New'}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{p.user?.name}</h3>
                                            <div className="flex flex-wrap gap-1.5 pt-2">
                                                {p.categories?.map(c => <span key={c} className="px-2.5 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">{c}</span>)}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 text-slate-400">
                                            <MapPin className="w-4 h-4 text-primary-500" />
                                            <span className="text-xs font-bold uppercase tracking-widest">{p.location?.city || 'India'}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
                                        <Link 
                                            to={`/providers/${p._id}`}
                                            className="w-full py-5 bg-white border-2 border-slate-200 text-slate-900 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center space-x-3 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95 group/btn"
                                        >
                                            <span>View Expert Profile</span>
                                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </section>

             {/* Features Section */}
             <section className="py-24 bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-500/5 -skew-x-12 translate-x-1/2"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                        <div className="space-y-10">
                            <div className="space-y-4">
                                <h2 className="text-4xl font-extrabold text-slate-900 leading-tight">Why Choose Our <br/> Trusted Network?</h2>
                                <p className="text-lg text-slate-500 leading-relaxed max-w-md">We prioritize safety, quality, and your peace of mind above everything else.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start space-x-5 p-6 glass rounded-3xl border-slate-200">
                                    <div className="bg-primary-100 p-3 rounded-2xl">
                                        <ShieldCheck className="text-primary-600 w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Verified Professionals</h4>
                                        <p className="text-sm text-slate-500 mt-1">Every provider undergoes a rigorous 4-step background verification process.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-5 p-6 bg-white/40 backdrop-blur-sm rounded-3xl border border-slate-200">
                                    <div className="bg-orange-100 p-3 rounded-2xl">
                                        <Zap className="text-orange-600 w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Instant Booking</h4>
                                        <p className="text-sm text-slate-500 mt-1">Book a service in under 60 seconds with our real-time scheduling system.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-5 p-6 bg-white/40 backdrop-blur-sm rounded-3xl border border-slate-200">
                                    <div className="bg-green-100 p-3 rounded-2xl">
                                        <Settings className="text-green-600 w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Custom Solutions</h4>
                                        <p className="text-sm text-slate-500 mt-1">Directly chat with providers to customize services exactly to your needs.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-primary-600/10 rounded-[3rem] blur-3xl translate-x-20 translate-y-20"></div>
                            <div className="relative grid grid-cols-2 gap-4">
                                <div className="space-y-4 pt-12">
                                    <div className="h-64 bg-slate-300 rounded-[2rem] overflow-hidden shadow-2xl relative group">
                                         <img src="/images/plumber.png" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Plumber" />
                                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                                         <p className="absolute bottom-6 left-6 text-white font-bold leading-tight">Expert <br/> Plumbers</p>
                                    </div>
                                    <div className="h-48 bg-slate-400 rounded-[2rem] overflow-hidden shadow-2xl relative group">
                                         <img src="/images/carpenter.png" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Carpenter" />
                                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                                         <p className="absolute bottom-6 left-6 text-white font-bold leading-tight">Master <br/> Carpenters</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-48 bg-slate-400 rounded-[2rem] overflow-hidden shadow-2xl relative group">
                                         <img src="/images/cleaner.png" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Cleaner" />
                                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                                         <p className="absolute bottom-6 left-6 text-white font-bold leading-tight">Top <br/> Cleaners</p>
                                    </div>
                                    <div className="h-64 bg-slate-300 rounded-[2rem] overflow-hidden shadow-2xl relative group">
                                         <img src="/images/ac.png" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="AC" />
                                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                                         <p className="absolute bottom-6 left-6 text-white font-bold leading-tight">AC <br/> Specialists</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Stats Section */}
            <section className="py-20 bg-slate-900 relative">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {stats.map((stat, i) => (
                            <div key={i} className="flex items-center space-x-6 p-8 border border-white/5 bg-white/5 rounded-[2.5rem]">
                                <div className={`w-16 h-16 ${i === 0 ? 'bg-blue-500/20 text-blue-400' : i === 1 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'} rounded-3xl flex items-center justify-center`}>
                                    <stat.icon className="w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-3xl font-extrabold text-white">{stat.value}</h3>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                     </div>
                 </div>
            </section>
        </div>
    );
};

export default Home;
