import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
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
    AlertCircle,
    CheckCircle2,
    Clock,
    MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({ users: 0, providers: 0, bookings: 0, revenue: 0 });
    const [providers, setProviders] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!user?.token) {
                throw new Error('Authorization Required. Please Login as Admin.');
            }

            const [statsRes, provRes, usersRes, logsRes] = await Promise.all([
                API.get('/admin/stats'),
                API.get('/admin/providers'),
                API.get('/admin/users'),
                API.get('/admin/logs')
            ]);
            
            setStats(statsRes.data || { users: 0, providers: 0, bookings: 0, revenue: 0 });
            setProviders(provRes.data || []);
            setAllUsers(usersRes.data || []);
            setLogs(logsRes.data || []);
            setLoading(false);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Platform Sync Failed';
            setError(errorMsg);
            setLoading(false);
            console.error('[DASHBOARD-FAIL]:', err);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await API.put(`/admin/users/${userId}/role`, { role: newRole });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Role Update Failed');
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            await API.put(`/admin/providers/${id}/status`, { isApproved: !currentStatus });
            fetchData();
        } catch (err) {
             alert(err.response?.data?.message || 'Status Update Failed');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-12 h-12 border-4 border-slate-100 border-t-primary-600 rounded-full mb-4" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Master Data...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-10">
                
                {/* Error Banner */}
                <AnimatePresence>
                    {error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center space-x-3 text-red-600">
                            <AlertCircle className="w-5 h-5" />
                            <p className="text-sm font-bold">{error}</p>
                            <button onClick={fetchData} className="ml-auto text-[10px] font-black uppercase underline">Retry Sync</button>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-3 text-primary-600">
                            <div className="bg-primary-600 p-1.5 rounded-lg text-white">
                                <Shield className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Security Clearance: Admin</span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">System Command Center</h1>
                        <p className="text-slate-500 font-medium">Real-time platform oversight and master logs</p>
                    </div>
                    <button onClick={fetchData} className="flex items-center space-x-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                        <RefreshCcw className="w-4 h-4" />
                        <span>Sync Live Data</span>
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Platform Revenue', value: `₹${(stats.revenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'Total Clients', value: stats.users || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Verified Service Pros', value: stats.providers || 0, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
                        { label: 'System Bookings', value: stats.bookings || 0, icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50' }
                    ].map((s, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
                        >
                            <div className={`${s.bg} ${s.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <s.icon className="w-7 h-7" />
                            </div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                            <p className="text-3xl font-black text-slate-900 tracking-tighter">{s.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Content Tabs */}
                <div className="flex space-x-2 bg-slate-200/50 p-1.5 rounded-2xl w-fit">
                    {['overview', 'users', 'bookings', 'moderation'].map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={activeTab} 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: 10 }}
                    >
                        {activeTab === 'overview' && (
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                 <div className="lg:col-span-2 space-y-6">
                                     <div className="flex items-center space-x-3 px-2">
                                          <div className="w-1.5 h-6 bg-primary-500 rounded-full"></div>
                                          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Expert Moderation Queue</h2>
                                     </div>
                                     <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                                         {providers.length === 0 ? (
                                             <div className="flex flex-col items-center justify-center h-full py-20 text-slate-400">
                                                 <Briefcase className="w-12 h-12 mb-4 opacity-20" />
                                                 <p className="font-bold">No active moderation requests</p>
                                             </div>
                                         ) : (
                                             <table className="w-full text-left">
                                                 <thead>
                                                     <tr className="bg-slate-50 border-b border-slate-100">
                                                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Provider</th>
                                                         <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                                     </tr>
                                                 </thead>
                                                 <tbody className="divide-y divide-slate-50 whitespace-nowrap">
                                                     {providers.map(p => (
                                                         <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                                                             <td className="px-8 py-6 flex items-center space-x-4">
                                                                 <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xs">{p.user?.name?.[0]}</div>
                                                                 <div>
                                                                     <p className="font-bold text-slate-900">{p.user?.name}</p>
                                                                     <p className="text-xs text-slate-400">{p.user?.email}</p>
                                                                 </div>
                                                             </td>
                                                             <td className="px-8 py-6 text-right">
                                                                 <button 
                                                                     onClick={() => toggleStatus(p._id, p.isApproved)}
                                                                     className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${p.isApproved ? 'text-red-600 hover:bg-red-50' : 'text-primary-600 hover:bg-primary-50'}`}
                                                                 >
                                                                     {p.isApproved ? 'Suspend' : 'Verify'}
                                                                 </button>
                                                             </td>
                                                         </tr>
                                                     ))}
                                                 </tbody>
                                             </table>
                                         )}
                                     </div>
                                 </div>
                                 <div className="space-y-6">
                                     <div className="flex items-center space-x-3 px-2">
                                          <Activity className="w-5 h-5 text-primary-500" />
                                          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Live System Logs</h2>
                                     </div>
                                     <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 space-y-8 max-h-[600px] overflow-y-auto">
                                         {logs.length === 0 ? <p className="text-center text-slate-400 py-20 font-bold">No system activity detected</p> : logs.map((log, i) => (
                                             <div key={i} className="flex space-x-4">
                                                 <div className={`w-2 h-2 rounded-full mt-1.5 ${log.type === 'Registration' ? 'bg-blue-400' : 'bg-green-400'}`}></div>
                                                 <div className="space-y-1">
                                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.type}</p>
                                                     <p className="text-sm font-bold text-slate-900 leading-snug">{log.desc}</p>
                                                     <p className="text-[10px] font-medium text-slate-400">{new Date(log.time).toLocaleTimeString()}</p>
                                                 </div>
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                             </div>
                        )}

                        {activeTab === 'users' && (
                             <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                                 <table className="w-full text-left">
                                     <thead>
                                         <tr className="bg-slate-50 border-b border-slate-100">
                                             <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Profile</th>
                                             <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Role</th>
                                             <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Administrative Action</th>
                                         </tr>
                                     </thead>
                                     <tbody className="divide-y divide-slate-100">
                                         {allUsers.map(u => (
                                             <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                                                 <td className="px-8 py-6 flex items-center space-x-4">
                                                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs ${u.role === 'admin' ? 'bg-primary-600' : 'bg-slate-900'}`}>{u.name?.[0]}</div>
                                                     <div>
                                                         <p className="font-bold text-slate-900">{u.name}</p>
                                                         <p className="text-xs text-slate-400">{u.email}</p>
                                                     </div>
                                                 </td>
                                                 <td className="px-8 py-6">
                                                     <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{u.role}</span>
                                                 </td>
                                                 <td className="px-8 py-6 text-right space-x-2">
                                                     {u.role === 'admin' ? (
                                                         <button onClick={() => handleRoleChange(u._id, 'user')} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200">Demote</button>
                                                     ) : (
                                                         <button onClick={() => handleRoleChange(u._id, 'admin')} className="px-4 py-2 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase">Make Admin</button>
                                                     )}
                                                 </td>
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             </div>
                        )}

                        {activeTab === 'bookings' && (
                             <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden shadow-2xl shadow-slate-200/50">
                                 <table className="w-full text-left">
                                     <thead>
                                         <tr className="bg-slate-50 border-b border-slate-100">
                                             <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transmission ID</th>
                                             <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Pulse</th>
                                             <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                             <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value</th>
                                         </tr>
                                     </thead>
                                     <tbody className="divide-y divide-slate-50">
                                         {logs.filter(l => l.type === 'Booking').map(log => (
                                             <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                                 <td className="px-8 py-6">
                                                     <p className="text-xs font-black text-slate-900 font-mono tracking-tighter uppercase">{log.id.substring(0, 12)}...</p>
                                                     <p className="text-[10px] font-medium text-slate-400">{new Date(log.time).toLocaleString()}</p>
                                                 </td>
                                                 <td className="px-8 py-6">
                                                     <p className="font-bold text-slate-900">{log.desc.split(' for ')[1] || 'Service'}</p>
                                                     <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Live Flow</p>
                                                 </td>
                                                 <td className="px-8 py-6">
                                                     <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-xl text-[9px] font-black uppercase border border-green-100">Transmitted</span>
                                                 </td>
                                                 <td className="px-8 py-6 text-right">
                                                     <p className="text-sm font-black text-slate-900">{log.desc.split(' of ')[1]?.split(' for ')[0] || '₹0'}</p>
                                                 </td>
                                             </tr>
                                         ))}
                                         {logs.filter(l => l.type === 'Booking').length === 0 && (
                                             <tr>
                                                 <td colSpan="4" className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No booking pulses detected in current cycle</td>
                                             </tr>
                                         )}
                                     </tbody>
                                 </table>
                             </div>
                        )}

                        {activeTab === 'moderation' && (
                             <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden p-8">
                                  <div className="space-y-2 mb-10 text-center">
                                      <h3 className="text-2xl font-black text-slate-900">Security Audit Logs</h3>
                                      <p className="text-slate-400 font-medium">Platform-wide verification and access history</p>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                      {providers.filter(p => !p.isApproved).map(p => (
                                          <div key={p._id} className="p-8 bg-orange-50/30 border border-orange-100 rounded-[2.5rem] space-y-6">
                                              <div className="flex items-center space-x-4">
                                                 <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-black">{p.user?.name?.[0]}</div>
                                                 <div>
                                                     <p className="font-bold text-slate-900">{p.user?.name}</p>
                                                     <p className="text-xs text-orange-600 font-black uppercase tracking-widest">Pending Review</p>
                                                 </div>
                                              </div>
                                              <p className="text-sm text-slate-500 line-clamp-2">{p.description}</p>
                                              <button onClick={() => toggleStatus(p._id, false)} className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 transition-all">Approve Expert</button>
                                          </div>
                                      ))}
                                      {providers.filter(p => !p.isApproved).length === 0 && (
                                          <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                                              <ShieldCheck className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">All experts currently verified</p>
                                          </div>
                                      )}
                                  </div>
                             </div>
                        )}
                    </motion.div>
                </AnimatePresence>

            </div>
        </div>
    );
};

export default AdminDashboard;
