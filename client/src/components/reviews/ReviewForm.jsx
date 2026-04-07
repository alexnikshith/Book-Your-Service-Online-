import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, ShieldCheck, Zap, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import API from '../../api/axios';

const ReviewForm = ({ providerId, onReviewAdded }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await API.post('/reviews', { 
                providerId, 
                rating, 
                comment 
            });
            setSuccess(true);
            setLoading(false);
            if (onReviewAdded) onReviewAdded();
        } catch (err) {
            setError(err.response?.data?.message || 'Reputation Pulse failed');
            setLoading(false);
        }
    };

    if (success) return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-12 text-center bg-green-50 rounded-[4rem] border shadow-2xl shadow-green-100 border-green-100">
            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase">Expert Praised!</h3>
            <p className="text-slate-500 font-medium mt-2">Your review has been broadcasted to the platform.</p>
        </motion.div>
    );

    return (
        <section className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                <div className="flex items-center space-x-4">
                    <div className="bg-primary-50 p-3 rounded-2xl">
                         <Zap className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Rate Experience</h3>
                        <p className="text-slate-500 font-medium">Verify your hire with a public testimony</p>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="flex items-center space-x-3 bg-slate-50 p-6 rounded-[2rem] w-fit border border-slate-100">
                        {[1,2,3,4,5].map(star => (
                            <button 
                                type="button" key={star} 
                                onClick={() => setRating(star)}
                                className="group/star hover:scale-125 transition-transform"
                            >
                                <Star 
                                    className={`w-10 h-10 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-slate-200'} transition-all`} 
                                />
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Detailed Comment</label>
                        <div className="relative group">
                            <MessageSquare className="absolute left-6 top-6 w-5 h-5 text-primary-400" />
                            <textarea 
                                placeholder="Describe the quality of service..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                required
                                className="w-full h-40 pl-[4.5rem] p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-sm font-bold outline-none focus:ring-8 focus:ring-primary-500/5 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-center space-x-3 text-red-600">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-[10px] font-black uppercase">{error}</p>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-20 bg-slate-900 hover:bg-primary-600 text-white rounded-[2rem] font-black uppercase text-sm tracking-[0.2em] transition-all flex items-center justify-center space-x-4 active:scale-95 shadow-2xl shadow-slate-900/10 group/btn"
                >
                    <span>Broadcast Praise</span>
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </form>
        </section>
    );
};

export default ReviewForm;
