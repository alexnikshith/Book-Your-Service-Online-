import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, UserPlus, Briefcase, ChevronRight, AlertCircle, Eye, EyeOff, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
        categories: [],
        experience: '',
        description: '',
        upiId: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const { register: registerUser, user, loading, error, clearError } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate('/dashboard');
    }, [user, navigate]);

    const handleChange = (e) => {
        if (error) clearError();
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const providerData = formData.role === 'provider' ? {
                categories: formData.categories,
                experience: Number(formData.experience),
                description: formData.description || `Professional ${formData.categories.join(', ')} service provider`,
                upiId: formData.upiId
            } : {};
            
            await registerUser(formData.name, formData.email, formData.password, formData.role, providerData);
        } catch (err) {}
    };

    const toggleCategory = (cat) => {
        if (error) clearError();
        const current = formData.categories;
        if (current.includes(cat)) {
            setFormData({ ...formData, categories: current.filter(c => c !== cat) });
        } else {
            setFormData({ ...formData, categories: [...current, cat] });
        }
    };

    const categoryOptions = ['Plumber', 'Electrician', 'Carpenter', 'Cleaner', 'Painter', 'Gardener', 'AC Mechanic', 'Pest Control'];

    const roles = [
        { id: 'user', icon: User, title: 'I am a Customer', desc: 'I want to book services' },
        { id: 'provider', icon: Briefcase, title: 'I am a Provider', desc: 'I want to offer services' }
    ];

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-slate-50">
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-xl"
            >
                <div className="glass p-10 rounded-3xl space-y-10 border-slate-200 shadow-2xl relative">
                    {/* Visual Decor */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-200/40 to-secondary-200/40 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
                    
                    <div className="text-center">
                        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
                        <p className="mt-3 text-slate-500 font-medium">Join our community of over 10,000+ happy users</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center space-x-3 text-sm font-medium">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Role Picker */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {roles.map((role) => (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => {
                                        if (error) clearError();
                                        setFormData({ ...formData, role: role.id });
                                    }}
                                    className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left relative group ${
                                        formData.role === role.id 
                                        ? 'border-primary-500 bg-primary-50/50 shadow-md ring-4 ring-primary-500/10' 
                                        : 'border-slate-100 bg-white hover:border-slate-300'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                                        formData.role === role.id ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'
                                    }`}>
                                        <role.icon className="w-5 h-5" />
                                    </div>
                                    <h4 className={`font-bold text-sm ${formData.role === role.id ? 'text-primary-700' : 'text-slate-700'}`}>{role.title}</h4>
                                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">{role.desc}</p>
                                    
                                    {formData.role === role.id && (
                                        <motion.div layoutId="role-check" className="absolute top-4 right-4 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center border-4 border-white shadow-sm shadow-primary-500/50">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                        </motion.div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input 
                                        type="text" 
                                        name="name"
                                        required 
                                        className="input-field pl-12 h-14"
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input 
                                        type="email" 
                                        name="email"
                                        required 
                                        className="input-field pl-12 h-14"
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required 
                                        className="input-field pl-12 pr-12 h-14"
                                        placeholder="Minimum 6 characters"
                                        value={formData.password}
                                        onChange={handleChange}
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

                        {formData.role === 'provider' && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-6 pt-4 border-t border-slate-100"
                            >
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">Services You Provide (Select Multiple)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {categoryOptions.map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => toggleCategory(cat)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                                    formData.categories.includes(cat)
                                                    ? 'bg-primary-600 border-primary-600 text-white shadow-md'
                                                    : 'bg-white border-slate-200 text-slate-500 hover:border-primary-300'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5 pt-4">
                                    <label className="text-xs font-black text-primary-600 ml-1 uppercase tracking-[0.2em]">UPI ID for Direct Payments</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500 w-5 h-5"><Zap className="w-5 h-5 fill-primary-500/20" /></div>
                                        <input 
                                            type="text" 
                                            name="upiId"
                                            required={formData.role === 'provider'}
                                            className="input-field pl-12 h-14 border-primary-100 bg-primary-50/5 focus:bg-white transition-all font-mono text-xs font-bold"
                                            placeholder="e.g. 9876543210@ybl"
                                            value={formData.upiId}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 mt-1 ml-1 uppercase tracking-widest opacity-60">* Customers will pay directly to this ID</p>
                                </div>
                            </motion.div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn-primary w-full h-14 text-base flex items-center justify-center space-x-3 group shadow-primary-500/20"
                        >
                            {loading ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-6 border-t border-slate-100">
                        <p className="text-sm font-medium text-slate-500">
                            Already have an account? {' '}
                            <Link to="/login" className="text-primary-600 font-bold hover:underline">Log In</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
