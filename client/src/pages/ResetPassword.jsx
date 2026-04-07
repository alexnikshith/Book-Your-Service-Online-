import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }
        if (password.length < 6) {
            return setError("Password must be at least 6 characters");
        }

        setLoading(true);
        setError('');
        try {
            await API.put(`/auth/reset-password/${token}`, { password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Token may be expired or invalid. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500"></div>
            
            {/* Background Decorative Elements */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-primary-100/30 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-100/30 rounded-full blur-3xl -z-10"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[3rem] p-10 md:p-14 relative"
            >
                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div 
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-8 py-4"
                        >
                            <div className="w-24 h-24 bg-green-50 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-sm">
                                <CheckCircle2 className="w-12 h-12 text-green-500" />
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Master Key Reconfigured!</h1>
                                <p className="text-slate-500 font-medium leading-relaxed italic">"Security is the mother of safety."</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Redirecting to login portal in 3 seconds...
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="form" className="space-y-10">
                            <div className="space-y-4 text-center">
                                <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl rotate-3">
                                    <KeyRound className="w-10 h-10 text-primary-400" />
                                </div>
                                <div className="space-y-1 pt-4">
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center">Reset Master Key</h1>
                                    <p className="text-slate-500 font-medium">Define your new cryptographic signature</p>
                                </div>
                            </div>

                            {error && (
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-red-50 text-red-600 p-5 rounded-3xl border border-red-100 flex items-center space-x-3 text-sm font-bold shadow-sm">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-600 transition-colors w-5 h-5" />
                                            <input 
                                                type={showPassword ? "text" : "password"} 
                                                required 
                                                className="w-full pl-14 pr-14 py-5 bg-slate-50 border-2 border-transparent rounded-2xl outline-none font-bold text-slate-900 group-focus-within:border-primary-600 group-focus-within:bg-white transition-all shadow-inner"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-600 transition-colors w-5 h-5" />
                                            <input 
                                                type={showPassword ? "text" : "password"} 
                                                required 
                                                className="w-full pl-14 pr-4 py-5 bg-slate-50 border-2 border-transparent rounded-2xl outline-none font-bold text-slate-900 group-focus-within:border-primary-600 group-focus-within:bg-white transition-all shadow-inner"
                                                placeholder="••••••••"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-primary-600 hover:shadow-2xl shadow-primary-500/20 transition-all active:scale-95 flex items-center justify-center space-x-3 overflow-hidden group relative"
                                >
                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <span className="relative z-10 font-black">Finalize Key Configuration</span>
                                    )}
                                </button>
                                
                                <Link to="/login" className="flex items-center justify-center space-x-2 text-slate-400 hover:text-slate-600 transition-colors pt-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    <span className="text-xs font-black uppercase tracking-widest">Abort Reset</span>
                                </Link>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
