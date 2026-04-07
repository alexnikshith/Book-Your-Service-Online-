import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, User, MessageCircle, Clock, ShieldCheck } from 'lucide-react';
import API from '../../api/axios';

const ReviewList = ({ providerId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const { data } = await API.get(`/reviews/provider/${providerId}`);
                setReviews(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchReviews();
    }, [providerId]);

    if (loading) return <div className="animate-pulse space-y-4">
        {[1,2].map(i => <div key={i} className="h-32 bg-slate-100 rounded-3xl" />)}
    </div>;

    if (reviews.length === 0) return (
        <div className="bg-slate-50 rounded-[3rem] p-12 text-center border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <MessageCircle className="w-8 h-8 text-slate-200" />
            </div>
            <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Be the first to praise this expert</p>
        </div>
    );

    return (
        <div className="space-y-6">
            {reviews.map((r, idx) => (
                <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-sm">
                                {r.user?.name?.[0]}
                            </div>
                            <div>
                                <p className="font-black text-slate-900 uppercase tracking-tight leading-none mb-1.5">{r.user?.name}</p>
                                <div className="flex items-center space-x-1 px-3 py-1 bg-green-50 rounded-full text-[9px] font-black text-green-600 uppercase tracking-widest w-fit border border-green-100">
                                    <ShieldCheck className="w-3 h-3" />
                                    <span>Verified Client</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-1 text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-current' : 'text-slate-200'}`} />
                            ))}
                        </div>
                    </div>
                    <p className="text-slate-600 font-medium leading-relaxed italic border-l-4 border-slate-100 pl-6 py-2">
                        "{r.comment}"
                    </p>
                    <div className="mt-6 flex items-center space-x-2 text-[10px] font-black text-slate-300 uppercase tracking-widest pl-10">
                        <Clock className="w-3 h-3" />
                        <span>Posted on {new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default ReviewList;
