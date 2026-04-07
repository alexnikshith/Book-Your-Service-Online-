import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../api/axios';
import MapComponent from '../components/MapComponent';
import { Search, MapPin, Star, Filter, ArrowRight, Zap, Shield, User, Briefcase, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Providers = () => {
    const [searchParams] = useSearchParams();
    const categoryQuery = searchParams.get('category');
    const cityQuery = searchParams.get('city');
    
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        category: categoryQuery || '',
        city: cityQuery || ''
    });

    useEffect(() => {
        const fetchProviders = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams(filter);
                const { data } = await API.get('/providers?' + params.toString());
                setProviders(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchProviders();
    }, [filter]);

    const categories = ['Plumber', 'Electrician', 'Carpenter', 'Cleaner', 'Painter', 'Gardener', 'AC Mechanic', 'Pest Control'];

    return (
        <div className="min-h-screen bg-slate-50 pt-10 pb-20 px-4">
            <div className="max-w-7xl mx-auto space-y-12">
                
                {/* Header & Simple Filter */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-10">
                    <div className="space-y-4 max-w-2xl">
                         <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            Find the Best <br /> 
                            <span className="text-primary-600 uppercase tracking-[0.1em] text-lg font-black block mt-2">{filter.category ? filter.category + 's' : 'Professionals'}</span>
                         </h1>
                         <p className="text-slate-500 font-medium">Over {providers.length} verified experts near you ready to help.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64 min-w-[200px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <select 
                                className="input-field pl-12 h-14 font-black appearance-none"
                                value={filter.category}
                                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                            >
                                <option value="">All Categories</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="relative flex-1 md:w-64 min-w-[200px]">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                                className="input-field pl-12 h-14 font-black"
                                placeholder="Filter by City..."
                                value={filter.city}
                                onChange={(e) => setFilter({ ...filter, city: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Map Integration */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                >
                    <div className="flex items-center space-x-4 px-2">
                        <Map className="w-5 h-5 text-primary-500" />
                        <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-[0.1em] text-sm">Interactive Geo-Explorer</h2>
                    </div>
                    <MapComponent providers={providers} />
                </motion.div>

                {/* Main Content */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                         <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-10 h-10 border-2 border-primary-200 border-t-primary-600 rounded-full" />
                    </div>
                ) : providers.length === 0 ? (
                    <div className="glass p-20 text-center rounded-[3rem] border-slate-100 shadow-2xl">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <Briefcase className="w-12 h-12 text-slate-300" />
                        </div>
                         <h3 className="text-2xl font-black text-slate-900 mb-2">Nobody here yet!</h3>
                         <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto leading-relaxed">We're expanding rapidly. Try a different category or search in a another area.</p>
                         <button onClick={() => setFilter({ ...filter, category: '', city: '' })} className="btn-secondary">Clear All Filters</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {providers.map((p, idx) => (
                            <motion.div 
                                key={p._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white border border-slate-100 rounded-[3rem] shadow-sm hover:shadow-2xl hover:border-primary-100 transition-all duration-500 overflow-hidden group"
                            >
                                <div className="relative h-48 bg-slate-900 group-hover:h-32 transition-all duration-700">
                                     <div className="absolute inset-0 bg-primary-600 opacity-20 filter grayscale group-hover:grayscale-0 group-hover:opacity-40 transition-all"></div>
                                     <div className="absolute bottom-6 left-8 flex items-end space-x-6">
                                         <div className="w-20 h-20 bg-white ring-8 ring-white/10 rounded-[2rem] shadow-2xl flex items-center justify-center text-4xl group-hover:scale-90 transition-transform">
                                             {p.user?.name[0].toUpperCase()}
                                         </div>
                                     </div>
                                      <div className="absolute top-6 right-8 p-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl text-white">
                                          <div className="flex items-center space-x-1.5">
                                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                              <span className="text-sm font-black">{p.averageRating || 'NEW'}</span>
                                          </div>
                                      </div>
                                </div>

                                <div className="p-8 pt-6 space-y-6">
                                    <div>
                                         <div className="flex items-center justify-between mb-1">
                                             <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-primary-600 transition-colors uppercase tracking-widest leading-none">{p.user?.name}</h3>
                                            <div className="flex items-center space-x-1 px-3 py-1 bg-green-50 rounded-full border border-green-100 text-[10px] font-black text-green-600 uppercase tracking-widest">
                                                <Shield className="w-3 h-3" />
                                                <span>Verified</span>
                                            </div>
                                         </div>
                                         <p className="text-xs font-bold text-slate-400 flex items-center space-x-2 uppercase tracking-widest">
                                             <Briefcase className="w-3.5 h-3.5 text-primary-400" />
                                             <span>{p.categories?.join(' • ') || 'Expert'} Specialist • {p.experience} Yrs Exp.</span>
                                         </p>
                                    </div>

                                    <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-2">
                                        {p.description}
                                    </p>

                                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                          <div className="space-y-0.5">
                                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Service Fee</p>
                                               <p className="text-xl font-black text-slate-900 group-hover:text-primary-600 transition-colors">₹499.00 <span className="text-sm font-bold text-slate-400">/HR</span></p>
                                          </div>
                                          <Link to={`/providers/${p._id}`} className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-primary-600 transition-all flex items-center space-x-3 active:scale-95 group/btn shadow-xl shadow-slate-900/10">
                                              <span>View Profile</span>
                                              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                          </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default Providers;
