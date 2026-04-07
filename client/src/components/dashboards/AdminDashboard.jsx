import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import {
    Users,
    Briefcase,
    Calendar,
    TrendingUp,
    Shield,
    ShieldCheck,
    ShieldAlert,
    Activity,
    RefreshCcw,
    ChevronRight,
    Search,
    Filter,
    ArrowRight,
    Zap,
    Flag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminAiModeration from './AdminAiModeration';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview'); 
    const [stats, setStats] = useState({ users: 0, providers: 0, bookings: 0, revenue: 0 });
    const [providers, setProviders] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, provRes, logsRes, usersRes] = await Promise.all([
                API.get('/admin/stats'),
                API.get('/admin/providers'),
                API.get('/admin/logs'),
                API.get('/admin/users')
            ]);
            setStats(statsRes.data);
            setProviders(provRes.data);
            setLogs(logsRes.data);
            setAllUsers(usersRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleStatus = async (id, currentStatus) => {
        try {
            await API.put(`/admin/providers/${id}/status`, { isApproved: !currentStatus });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await API.put(`/admin/users/${userId}/role`, { role: newRole });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Role Update Pulse Failed Hub');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20 min-h-[60vh]">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full shadow-2xl" />
        </div>
    );

    return (
        <div className="space-y-10 pb-20 animate-fade-in">
            {/* Master Command Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">System Master Hub</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] opacity-40">Real-time platform oversight & 'Vigilante' Admin Pulse</p>
                </div>
                <div className="flex items-center space-x-3 bg-slate-100 p-1.5 rounded-3xl">
                    {['overview', 'users', 'ai_moderation'].map((tab) => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-2.5xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {tab === 'overview' ? 'Command Center' : tab === 'users' ? 'User Directory hub' : 'AI Moderation Registry'}
                        </button>
                    ))}
                    <div className="w-[1px] h-6 bg-slate-200 mx-2" />
                    <button onClick={fetchData} className="p-2.5 bg-white text-primary-500 rounded-full hover:rotate-180 transition-all duration-700 shadow-sm border border-slate-200">
                        <RefreshCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' ? (
                    <motion.div 
                        key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="space-y-10"
                    >
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Platform Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                                { label: 'Total Clients', value: stats.users, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Verified Experts', value: stats.providers, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
                                { label: 'System Requests', value: stats.bookings, icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50' }
                            ].map((s, i) => (
                                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 opacity-0 group-hover:opacity-100 rounded-full -translate-y-1/2 translate-x-1/2 transition-all" />
                                    <div className={`${s.bg} ${s.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10`}>
                                        <s.icon className="w-7 h-7" />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">{s.label}</p>
                                    <p className="text-3xl font-black text-slate-900 relative z-10">{s.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Expert Moderation Table */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">
                                    <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-white">
                                        <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[11px] flex items-center space-x-3">
                                            <Shield className="w-5 h-5 text-primary-500" />
                                            <span>Expert Verification Queue</span>
                                        </h3>
                                        <div className="px-4 py-1.5 bg-slate-50 text-slate-400 rounded-full text-[9px] font-bold uppercase tracking-widest">Awaiting: {providers.filter(p => !p.isApproved).length}</div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-slate-50/50">
                                                    <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Expert Pulse Identity</th>
                                                    <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Specialties</th>
                                                    <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Reputation Status</th>
                                                    <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Action Hub</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {providers.map(p => (
                                                    <tr key={p._id} className="hover:bg-slate-50/20 transition-all group">
                                                        <td className="px-10 py-8">
                                                            <div className="flex items-center space-x-5">
                                                                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-sm group-hover:rotate-6 transition-all shadow-lg ring-4 ring-slate-100 group-hover:ring-primary-100">
                                                                    {p.user?.name ? p.user.name[0].toUpperCase() : 'P'}
                                                                </div>
                                                                <div>
                                                                    <p className="font-extrabold text-slate-900 uppercase tracking-tight text-xs leading-none mb-1">{p.user?.name || 'Anonymous'}</p>
                                                                    <p className="text-[10px] text-slate-400 font-bold opacity-60 tracking-wider">{p.user?.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-8">
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {p.categories?.map(c => (
                                                                    <span key={c} className="px-3 py-1 bg-slate-100 rounded-xl text-[8px] font-black text-slate-500 uppercase tracking-tighter">{c}</span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-8">
                                                            {p.isApproved ? (
                                                                <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-full w-fit border border-green-100 shadow-sm shadow-green-500/5">
                                                                    <ShieldCheck className="w-4 h-4" />
                                                                    <span className="text-[9px] font-black uppercase tracking-widest">Verified Pulse</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-2 rounded-full w-fit border border-red-100 shadow-sm shadow-red-500/5">
                                                                    <ShieldAlert className="w-4 h-4" />
                                                                    <span className="text-[9px] font-black uppercase tracking-widest">Pending Audit</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-10 py-8 text-right">
                                                            <button
                                                                onClick={() => toggleStatus(p._id, p.isApproved)}
                                                                className={`px-6 h-12 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${p.isApproved ? 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-900 hover:text-white' : 'bg-primary-600 text-white hover:bg-primary-500 shadow-xl shadow-primary-500/20'}`}
                                                            >
                                                                {p.isApproved ? 'Suspend Expert' : 'Authorize Pulse'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Activity Feed Hub */}
                            <div className="space-y-6">
                                <div className="bg-slate-900 rounded-[3.5rem] p-10 space-y-10 shadow-2xl shadow-slate-900/40 relative overflow-hidden h-[700px]">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 opacity-5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                                    <div className="flex items-center justify-between pb-2 relative z-10 border-b border-white/5 pb-6">
                                        <h3 className="font-black text-white uppercase tracking-[0.2em] text-[10px]">Live System Stream</h3>
                                        <Activity className="w-4 h-4 text-green-400 animate-pulse" />
                                    </div>
                                    <div className="space-y-10 relative z-10 overflow-y-auto pr-4 h-[calc(100%-80px)] scrollbar-hide">
                                        {logs.map((log, i) => (
                                            <div key={i} className="flex space-x-6 relative group border-l-2 border-white/5 pl-8 ml-2">
                                                <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full border-2 border-slate-900 ${log.type === 'Registration' ? 'bg-blue-400' : 'bg-green-400'}`}></div>
                                                <div className="space-y-2">
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none mb-1">{log.type}</p>
                                                    <p className="text-[13px] font-extrabold text-white leading-relaxed tracking-tight group-hover:text-primary-400 transition-colors">{log.desc}</p>
                                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{new Date(log.time).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : activeTab === 'users' ? (
                    <motion.div 
                        key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden"
                    >
                         <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[11px] flex items-center space-x-3"><Users className="w-5 h-5 text-primary-500" /><span>Universal User Ledger</span></h3>
                            <div className="px-4 py-1.5 bg-slate-50 text-slate-400 rounded-full text-[9px] font-bold uppercase tracking-widest">Nodes Total: {allUsers.length}</div>
                         </div>
                         <div className="overflow-x-auto">
                             <table className="w-full text-left">
                                 <thead>
                                     <tr className="bg-slate-50/50">
                                         <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">User Profile Pulse</th>
                                         <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Security Role</th>
                                         <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Administrative Node Action</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-50">
                                     {allUsers.map(u => (
                                         <tr key={u._id} className="hover:bg-slate-50/20 transition-all group">
                                             <td className="px-10 py-8 flex items-center space-x-5">
                                                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm ${u.role === 'admin' ? 'bg-primary-600 animate-pulse border-4 border-primary-100 shadow-2xl' : 'bg-slate-900 border-4 border-slate-100'}`}>
                                                     {u.role === 'admin' ? <Shield className="w-5 h-5 text-white" /> : u.name?.[0]?.toUpperCase()}
                                                 </div>
                                                 <div>
                                                     <p className="font-extrabold text-slate-900 uppercase tracking-tight text-xs leading-none mb-1">{u.name}</p>
                                                     <p className="text-[10px] text-slate-400 font-bold opacity-60 tracking-wider font-mono">{u.email}</p>
                                                 </div>
                                             </td>
                                             <td className="px-8 py-8">
                                                 <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center space-x-2 w-fit ${
                                                     u.role === 'admin' ? 'bg-primary-50 text-primary-600 border border-primary-200' : 
                                                     u.role === 'provider' ? 'bg-purple-50 text-purple-600 border border-purple-200' : 
                                                     'bg-slate-50 text-slate-500 border border-slate-200'
                                                 }`}>
                                                     <div className={`w-1.5 h-1.5 rounded-full ${u.role === 'admin' ? 'bg-primary-500' : u.role === 'provider' ? 'bg-purple-500' : 'bg-slate-400'}`} />
                                                     <span>{u.role === 'admin' ? 'Sovereign Node' : u.role === 'provider' ? 'Expert Hub' : 'Consumer Node'}</span>
                                                 </div>
                                             </td>
                                             <td className="px-10 py-8 text-right">
                                                 <div className="relative group/sel inline-block">
                                                     <select 
                                                         value={u.role}
                                                         onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                         className="appearance-none h-12 px-8 bg-white border-2 border-slate-100 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-400 focus:border-primary-600 focus:text-primary-600 focus:ring-0 outline-none transition-all cursor-pointer hover:bg-slate-50 min-w-[200px] shadow-sm"
                                                     >
                                                         <option value="user">Assign: Consumer Node</option>
                                                         <option value="provider">Assign: Expert Hub</option>
                                                         <option value="admin">Assign: Sovereign Admin</option>
                                                     </select>
                                                     <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within/sel:rotate-180 transition-transform">
                                                         <ChevronRight className="w-4 h-4 text-slate-300 group-focus-within/sel:text-primary-400 transform rotate-90" />
                                                     </div>
                                                 </div>
                                             </td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                         </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="ai_moderation" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="animate-fade-in"
                    >
                        <AdminAiModeration />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
