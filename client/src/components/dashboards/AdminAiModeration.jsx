import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { ShieldAlert, AlertCircle, CheckCircle, XCircle, Loader2, MessageSquare, User, Activity, ArrowRight, ShieldCheck, Zap, Flag, ExternalLink, Calendar, Trash2, Eraser, Camera, ShieldPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminAiModeration = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ high: 0, pending: 0, total: 0 });

    const fetchReports = async () => {
        try {
            const { data } = await API.get('/admin/reports');
            setReports(data);
            const highCount = data.filter(r => r.severity === 'high' || r.severity === 'critical').length;
            const pendingCount = data.filter(r => r.actionTaken === 'pending').length;
            setStats({ high: highCount, pending: pendingCount, total: data.length });
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleAction = async (reportId, action, notes, addAsPortfolio = false) => {
        try {
            await API.put(`/admin/reports/${reportId}`, { actionTaken: action, adminNotes: notes, addAsPortfolio });
            setReports(reports.map(r => r._id === reportId ? { ...r, actionTaken: action, adminNotes: notes } : r));
            fetchReports();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Establishing Audit Registry Pulse...</p>
        </div>
    );

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            {/* Header / Guidelines Hub Pulse */}
            <div className="flex flex-col lg:flex-row gap-10 items-stretch">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center space-x-3 text-red-600 mb-1">
                        <ShieldAlert className="w-6 h-6 fill-current opacity-20" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Vigilante Mega-Pulse Hub</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-none mb-2">Automated Policy Control</h1>
                    <p className="text-slate-500 font-medium leading-relaxed max-w-2xl">
                        Integrated <b>Auto-Suspension Policy</b> (Trust Score &lt; 40 triggers shutdown) and <b>Dynamic Portfolio Evidence</b> conversion.
                    </p>
                </div>
                
                <div className="lg:w-1/3 bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 opacity-5 rounded-full blur-[50px]"></div>
                     <h4 className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-4">Vigilante Protocol Update</h4>
                     <ul className="space-y-3 text-[11px] font-medium text-slate-400 leading-relaxed">
                         <li className="flex items-start space-x-3"><div className="w-1 h-1 bg-red-500 rounded-full mt-1.5 flex-shrink-0" /> <span>Critical violations now trigger -25 Trust Score penalty.</span></li>
                         <li className="flex items-start space-x-3"><div className="w-1 h-1 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" /> <span>Flagged images can be converted to Expert Portfolio.</span></li>
                     </ul>
                </div>
            </div>

            {/* Audit Stream Registry Pulse */}
            <div className="bg-white border border-slate-100 rounded-[3.5rem] shadow-xl shadow-slate-200/20 overflow-hidden">
                <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                    <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-widest flex items-center space-x-3"><Zap className="w-6 h-6 text-primary-500" /><span>Audit Protocol Stream</span></h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Audit State</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Subject Node</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Finding Payload</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Audit Status</th>
                                <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vigilante Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {reports.map((report) => (
                                <tr key={report._id} className="group hover:bg-slate-50/30 transition-all">
                                    <td className="px-10 py-10">
                                        <div className="flex items-center space-x-4">
                                             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                                                 report.severity === 'high' || report.severity === 'critical' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'
                                             }`}>
                                                 {report.type === 'chat_mod' ? <MessageSquare className="w-6 h-6" /> : 
                                                  report.type === 'provider_approval' ? <ShieldCheck className="w-6 h-6" /> : <Flag className="w-6 h-6" />}
                                             </div>
                                             <div className="space-y-1">
                                                 <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{report.type === 'chat_mod' ? 'Chat Pulse' : 'Profile Vetting'}</span>
                                                 <span className={`text-[9px] font-black uppercase flex items-center gap-1 ${
                                                     report.severity === 'critical' || report.severity === 'high' ? 'text-red-500' : 'text-slate-400'
                                                 }`}>{report.severity} Protocol</span>
                                             </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-10">
                                         <div className="flex flex-col"><span className="text-sm font-bold text-slate-700">{report.relatedUser?.name || 'Vigilante AI'}</span><span className="text-[9px] font-black text-slate-300 uppercase mt-1 tracking-widest">Node: {report._id.substring(18)}</span></div>
                                    </td>
                                    <td className="px-8 py-10">
                                         <div className="p-5 bg-white border border-slate-100 rounded-3xl max-w-xs shadow-sm hover:shadow-xl transition-all">
                                             <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">"{report.content}"</p>
                                             {report.relatedMessage?.imageUrl && (
                                                 <div className="mt-4 rounded-xl overflow-hidden grayscale hover:grayscale-0 transition-all border border-slate-100">
                                                     <img src={`http://localhost:5000${report.relatedMessage.imageUrl}`} alt="Evidence Hub" className="w-full h-auto object-cover max-h-24" />
                                                 </div>
                                             )}
                                         </div>
                                    </td>
                                    <td className="px-8 py-10">
                                         <div className={`px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center w-fit space-x-2 ${
                                             report.actionTaken === 'pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 'bg-green-50 text-green-600 border-green-100'
                                         }`}><div className={`w-2 h-2 rounded-full ${report.actionTaken === 'pending' ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`} /><span>{report.actionTaken}</span></div>
                                    </td>
                                    <td className="px-10 py-10 text-right">
                                         {report.actionTaken === 'pending' && (
                                             <div className="flex items-center justify-end space-x-3">
                                                 {report.relatedMessage?.imageUrl && (
                                                     <button onClick={() => handleAction(report._id, 'resolved', 'Approved as Verified Capability Hub Evidence Pulse', true)} title="Promote to Portfolio" className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl hover:bg-primary-600 hover:text-white transition-all flex items-center justify-center shadow-xl shadow-primary-500/10"><ShieldPlus className="w-6 h-6" /></button>
                                                 )}
                                                 <button onClick={() => handleAction(report._id, 'scrubbed', 'Offensive Evidence Forcefully Purged from Registry Pulse')} title="Scrub & Suspend Strike" className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center shadow-xl shadow-red-500/10"><Eraser className="w-6 h-6" /></button>
                                                 <button onClick={() => handleAction(report._id, 'resolved', 'Audit Resolved. Policy Enforced Pulse Hub')} title="Resolve Registry Node" className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all flex items-center justify-center shadow-xl shadow-green-500/10"><CheckCircle className="w-6 h-6" /></button>
                                             </div>
                                         )}
                                          {report.actionTaken !== 'pending' && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-30">Pulse Terminal Closed</p>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminAiModeration;
