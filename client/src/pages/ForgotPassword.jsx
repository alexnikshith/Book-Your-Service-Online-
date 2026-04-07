import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldAlert, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/axios';

const ForgotPassword = () => {
    const [sent, setSent] = useState(false);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await API.post('/auth/forgot-password', { email });
            setSent(true);
        } catch (err) {
            const serverError = err.response?.data;
            setError(serverError?.debug ? `${serverError.message}: ${serverError.debug}` : (serverError?.message || 'Failed to send recovery pulse'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="glass p-10 rounded-[3rem] space-y-8 border-slate-200 shadow-2xl relative overflow-hidden text-center">
                    
                    {!sent ? (
                        <>
                            <div className="w-20 h-20 bg-primary-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform rotate-12">
                                <ShieldAlert className="w-10 h-10 text-primary-600 -rotate-12" />
                            </div>
                            
                            <div className="space-y-2 text-center">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center">Access Recovery</h1>
                                <p className="text-slate-500 font-medium">Lost your master key? We can help you reset it.</p>
                            </div>

                            {error && (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center space-x-3 text-sm font-bold border border-red-100">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-1.5 text-left">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 text-left">Registered Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors w-5 h-5" />
                                        <input 
                                            type="email" 
                                            required 
                                            className="w-full pl-12 pr-4 py-5 bg-slate-50 border-2 border-transparent rounded-2xl outline-none font-bold text-slate-900 group-focus-within:border-primary-600 group-focus-within:bg-white transition-all"
                                            placeholder="your@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-primary-600 hover:shadow-xl shadow-primary-200 transition-all active:scale-95 flex items-center justify-center space-x-3"
                                >
                                    {loading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <span>Verify Identity</span>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="space-y-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                                <Sparkles className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-slate-900">Recovery Pulse Sent!</h2>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    A password reset link has been dispatched to <span className="font-bold text-slate-900">{email}</span>. Please check your inbox.
                                </p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200 text-left">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal Note (Dev Mode)</p>
                                <p className="text-xs text-slate-500 font-medium">
                                    Since this is a development environment, the email is simulated. To reset now, use the **Emergency Admin Access** on the login page.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    <div className="pt-6 border-t border-slate-100">
                        <Link to="/login" className="inline-flex items-center space-x-2 text-sm font-bold text-slate-500 hover:text-primary-600 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            <span>Return to Login</span>
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
