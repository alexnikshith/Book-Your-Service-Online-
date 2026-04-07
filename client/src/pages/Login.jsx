import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [showPassword, setShowPassword] = useState(false);
    const { login, user, loading, error } = useContext(AuthContext);
    const { showToast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate('/dashboard');
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // [SOVEREIGN GUARD]: Selective Admin Access Protocol
        if (role === 'admin' && email.toLowerCase().trim() !== 'nikshithgurram2006@gmail.com') {
            showToast("Security Breach Pulse: You are not an authorized Administrative Node. Access is restricted to the Central Sovereign Email (nikshithgurram2006@gmail.com).", "error");
            return;
        }

        try {
            await login(email, password, role);
        } catch (err) {
            showToast(err.response?.data?.message || 'Login Matrix Busy: Pulse Refused', 'error');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="glass p-8 rounded-3xl space-y-8 border-slate-200 shadow-2xl relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-100 rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-secondary-100 rounded-full blur-3xl opacity-50"></div>

                    <div className="text-center relative">
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
                        <p className="mt-2 text-slate-500 font-medium">Log in to manage your services and bookings</p>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center space-x-3 text-sm font-medium"
                        >
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <div className="flex bg-slate-100 p-1 rounded-2xl">
                        <button 
                            type="button"
                            onClick={() => setRole('user')}
                            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${role === 'user' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Customer
                        </button>
                        <button 
                            type="button"
                            onClick={() => setRole('provider')}
                            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${role === 'provider' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Provider
                        </button>
                        <button 
                            type="button"
                            onClick={() => setRole('admin')}
                            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${role === 'admin' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Admin
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors w-5 h-5" />
                                    <input 
                                        type="email" 
                                        required 
                                        className="input-field pl-12 h-14"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors w-5 h-5 pointer-events-none" />
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        required 
                                        className="input-field pl-12 pr-12 h-14"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500 transition-all cursor-pointer" />
                                <span className="text-xs font-semibold text-slate-500 cursor-pointer">Remember me</span>
                            </div>
                            <Link to="/forgot-password" opacity-60 hover:opacity-100 className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors">Forgot Password?</Link>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn-primary w-full h-14 text-base flex items-center justify-center space-x-3 group"
                        >
                            {loading ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                            ) : (
                                <>
                                    <span>Log In Now</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-8 border-t border-slate-100">
                        <p className="text-sm font-medium text-slate-500">
                            Don't have an account? {' '}
                            <Link to="/register" className="text-primary-600 font-bold hover:underline transition-all">Create Account</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
