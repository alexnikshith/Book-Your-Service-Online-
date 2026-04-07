import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Star, Calendar, Clock, ShieldCheck, CheckCircle, ChevronLeft, ArrowRight, User, DollarSign, Activity, Briefcase, MessageSquare, Zap, Flag, AlertTriangle, ShieldAlert, Video, Camera, CreditCard, Lock, Unlock, Download } from 'lucide-react';
import ReviewForm from '../components/reviews/ReviewForm';
import ReviewList from '../components/reviews/ReviewList';
import ChatWindow from '../components/ChatWindow';
import { motion, AnimatePresence } from 'framer-motion';

const ProviderDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [reviewPulse, setReviewPulse] = useState(0); 
    const [bookingData, setBookingData] = useState({
        date: '',
        time: 'Morning (09:00 - 12:00)',
        address: '',
        notes: '',
        serviceName: provider?.category || 'Expert Service Hub',
        totalPrice: provider?.servicesOffered?.[0]?.price || 499
    });
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [escrowPulse, setEscrowPulse] = useState(false);
    const [activeBooking, setActiveBooking] = useState(null);

    const fetchProvider = async () => {
        try {
            const { data } = await API.get(`/providers/${id}`);
            setProvider(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProvider();
    }, [id, user?._id]);

    // Auto-populate booking context from provider node
    useEffect(() => {
        if (provider) {
            setBookingData(prev => ({
                ...prev,
                serviceName: provider.category || 'Expert Service Hub',
                totalPrice: provider.servicesOffered?.[0]?.price || 499
            }));
        }
    }, [provider]);

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!user) return navigate('/login');

        try {
            const { data } = await API.post('/bookings', {
                providerId: id,
                serviceName: bookingData.serviceName || 'General Service Hub',
                date: bookingData.date,
                time: bookingData.time,
                totalPrice: bookingData.totalPrice || 499,
                address: bookingData.address,
                notes: bookingData.notes
            });
            setActiveBooking(data);
            setBookingSuccess(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Transmission Pulse Hub Busy');
        }
    };

    const handleVideoConsultation = async () => {
        if (!user) return navigate('/login');
        const roomName = `ServiceFinder-${id}-${user._id}`;
        const jitsiUrl = `https://meet.jit.si/${roomName}`;

        try {
            // Notify Expert that a video session has been initialized Hub
            await API.post('/notifications', {
                user: provider.user?._id,
                type: 'booking_new',
                title: 'High-Fidelity Consultation: Video Path Open',
                message: `${user.name} is waiting in the Consultation Node for a video session.`,
                link: jitsiUrl
            });
            window.open(jitsiUrl, '_blank');
        } catch (err) {
            console.error(err);
            // Fallback: Open portal even if notification pulse fails
            window.open(jitsiUrl, '_blank');
        }
    };

    const handleEscrowPayment = async () => {
        setEscrowPulse(true);
        try {
            await API.put(`/bookings/${activeBooking._id}/escrow`);
            setTimeout(() => navigate('/dashboard'), 3000);
        } catch (err) {
            console.error(err);
            setEscrowPulse(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full" /></div>;

    const next14Days = [...Array(14)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1);
        return d;
    });

    return (
        <div className="min-h-screen bg-slate-50 pb-20 relative">
            {/* Header Hero Hub - Precision Elevated */}
            <div className="relative h-[240px] bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(56,189,248,0.1),transparent)]"></div>
                <div className="max-w-7xl mx-auto px-10 h-full flex items-center relative z-10">
                    <div className="flex items-center gap-8 translate-y-4">
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-28 h-28 bg-white rounded-3xl shadow-2xl flex items-center justify-center text-5xl font-black text-slate-900 border-2 border-white/10 shrink-0">{provider.user?.name[0]}</motion.div>
                        <div className="space-y-3 pt-2">
                             <div className="flex items-center gap-4">
                                 <h1 className="text-4xl font-black text-white tracking-widest leading-none uppercase">{provider.user?.name}</h1>
                                  <div className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 ${provider.isAIVerified ? 'bg-indigo-600/20 text-indigo-400' : 'bg-red-500/20 text-red-500'}`}>
                                      {provider.isAIVerified ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                      <span>{provider.isAIVerified ? 'Certified Expert' : 'Authorized Pulse'}</span>
                                  </div>
                             </div>
                             <div className="flex items-center gap-10">
                                  <div className="flex items-center space-x-2 text-slate-500 font-bold uppercase tracking-widest text-[10px]"><MapPin className="w-4 h-4 text-indigo-400" /><span>{provider.location?.city} Hub</span></div>
                                  <div className="flex items-center space-x-2 text-slate-500 font-bold uppercase tracking-widest text-[10px]"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /><span className="text-white text-base">{provider.averageRating || '4.9'} Rating</span></div>
                                  <div className="flex items-center space-x-2 text-slate-500 font-bold uppercase tracking-widest text-[10px]"><Zap className="w-4 h-4 text-indigo-400" /><span className="text-white text-base">{provider.trustScore}% Trust Score</span></div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Details Hub */}
                    <div className="lg:col-span-2 space-y-12 pb-20">
                        {/* Summary Hub */}
                        <section className="bg-white p-12 rounded-[4.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-12">
                             <div className="flex items-center justify-between border-b border-slate-50 pb-10">
                                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-widest flex items-center space-x-4"><Activity className="w-8 h-8 text-primary-500" /><span>Professional Profile Pulse</span></h3>
                                <div className="px-8 py-3 bg-slate-900 text-white rounded-3xl text-sm font-black uppercase tracking-widest shadow-xl shadow-slate-900/10">{provider.experience}+ YRS Experience</div>
                             </div>
                             <p className="text-2xl text-slate-500 leading-relaxed font-medium">{provider.description}</p>
                             
                             {/* Direct Settlement Hub Node */}
                             {provider.upiId && (
                                 <div className="p-8 bg-indigo-50 border-2 border-indigo-100 rounded-[2.5rem] flex items-center justify-between group hover:border-indigo-400 transition-all shadow-xl shadow-indigo-500/5">
                                     <div className="flex items-center space-x-6">
                                         <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-sm transition-transform group-hover:scale-110"><CreditCard className="w-6 h-6" /></div>
                                         <div className="space-y-1">
                                             <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] font-mono">Expert Settlement Node</h4>
                                             <p className="text-xl font-black text-slate-900 tracking-widest uppercase">{provider.upiId}</p>
                                         </div>
                                     </div>
                                     <div className="text-right">
                                         <div className="p-4 bg-white rounded-2xl border border-indigo-100 shadow-inner group-hover:bg-indigo-600 transition-colors">
                                             <CheckCircle className="w-6 h-6 text-indigo-400 group-hover:text-white" />
                                         </div>
                                     </div>
                                 </div>
                             )}
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 {['24/7 Rapid Response', 'Precision Engineering', 'Certified Equipment', 'Eco-logic Waste Protocol'].map((f, i) => (
                                     <div key={i} className="p-6 bg-slate-50 rounded-3xl flex items-center space-x-4 border border-slate-100 hover:bg-primary-50 transition-all group">
                                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary-600 shadow-sm transition-all group-hover:scale-110"><ShieldCheck className="w-5 h-5" /></div>
                                         <span className="font-black text-slate-900 uppercase tracking-widest text-[10px]">{f}</span>
                                     </div>
                                 ))}
                             </div>
                        </section>

                        {/* Dynamic Portfolio Gallery Evidence Hub */}
                        <section className="bg-slate-900 p-12 rounded-[4.5rem] shadow-2xl space-y-10 relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-80 h-80 bg-primary-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                             <div className="flex items-center justify-between relative z-10">
                                 <h3 className="text-3xl font-black text-white uppercase tracking-widest flex items-center space-x-4"><Camera className="w-8 h-8 text-primary-400" /><span>Evidence Gallery Pulse</span></h3>
                                 <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.4em]">Verified High Fidelity</span>
                             </div>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-6 relative z-10">
                                 {provider.portfolioImages?.length > 0 ? provider.portfolioImages.map((img, i) => (
                                     <div key={i} className="aspect-square bg-white/5 rounded-[2.5rem] border border-white/10 overflow-hidden group/img relative cursor-pointer">
                                         <img src={`${import.meta.env.MODE === 'production' ? window.location.origin : 'http://localhost:5000'}${img.url}`} alt={img.caption} className="w-full h-full object-cover grayscale active:grayscale-0 group-hover/img:grayscale-0 group-hover/img:scale-110 transition-all duration-700" />
                                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity p-6 flex items-end">
                                             <p className="text-[9px] font-black text-white uppercase tracking-widest leading-relaxed">{img.caption}</p>
                                         </div>
                                     </div>
                                 )) : [
                                     { url: '/images/defaults/plumbing.png', caption: 'High-Fidelity Plumbing Node' },
                                     { url: '/images/defaults/electrician.png', caption: 'Precision Electrical Node' },
                                     { url: '/images/defaults/ac.png', caption: 'Certified AC Cooling Node' }
                                 ].map((img, i) => (
                                     <div key={i} className="aspect-square bg-slate-800 rounded-[2.5rem] border border-white/5 overflow-hidden group/img relative opacity-40 hover:opacity-100 transition-all duration-700">
                                         <img src={img.url} alt={img.caption} className="w-full h-full object-cover grayscale active:grayscale-0 group-hover/img:grayscale-0 group-hover/img:scale-110 transition-all duration-700" />
                                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity p-6 flex items-end">
                                             <div className="space-y-1">
                                                 <p className="text-[9px] font-black text-primary-400 uppercase tracking-widest">{img.caption}</p>
                                                 <p className="text-[7px] font-bold text-white/50 uppercase tracking-widest">Verified Default Evidence</p>
                                             </div>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                        </section>

                        {/* Reputation Hub Hub */}
                        <section className="space-y-12">
                            <div className="flex items-center space-x-4 px-8 border-l-8 border-primary-500 py-2"><Star className="w-8 h-8 text-yellow-400 fill-yellow-400" /><h2 className="text-3xl font-black text-slate-900 uppercase tracking-widest">Reputation Registry Pulse</h2></div>
                            {user?.role === 'user' && <ReviewForm providerId={id} onReviewAdded={() => setReviewPulse(p => p+1)} />}
                            <div className="space-y-4"><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-10">Verified Client Testimonies</h3><ReviewList key={reviewPulse} providerId={id} /></div>
                        </section>
                    </div>

                    {/* Right High-Fidelity Booking Hub Pulse */}
                    <div className="space-y-8 sticky top-32 h-fit pb-10">
                        <section className="bg-slate-950 p-10 rounded-[4rem] border border-slate-700 shadow-2xl relative">
                             
                             <AnimatePresence mode="wait">
                                 {bookingSuccess ? (
                                     <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 space-y-12">
                                         <div className="w-28 h-28 bg-primary-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(56,189,248,0.4)] animate-bounce"><CheckCircle className="w-14 h-14 text-white" /></div>
                                         <div className="space-y-4">
                                            <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Pulse Initialized</h3>
                                            <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest bg-primary-400/10 py-2 rounded-full inline-block px-10">Awaiting Milestone Escrow</p>
                                         </div>
                                         <div className="p-8 bg-white/5 rounded-3xl border border-white/10 space-y-6">
                                              <p className="text-xs text-slate-400 font-bold leading-relaxed">To activate the service Hub Pulse, please transmit the milestone funds to the <b>Sovereign Escrow Registry</b>.</p>
                                              <button onClick={handleEscrowPayment} disabled={escrowPulse} className="w-full py-5 bg-white text-slate-900 font-black rounded-2xl uppercase tracking-widest text-xs flex items-center justify-center space-x-3 active:scale-95 transition-all">
                                                  {escrowPulse ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-4 h-4" />}
                                                  <span>{escrowPulse ? 'Transmitting Pulse...' : 'Activate Escrow Link'}</span>
                                              </button>
                                         </div>
                                     </motion.div>
                                 ) : (
                                     <form onSubmit={handleBooking} className="space-y-10 relative z-10">
                                         <div className="space-y-6 text-left">
                                             <div className="space-y-3">
                                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">1. Enter Service Address</label>
                                                 <div className="relative group">
                                                     <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400 w-4 h-4 pointer-events-none" />
                                                     <input 
                                                        required 
                                                        type="text"
                                                        value={bookingData.address}
                                                        onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
                                                        placeholder="Where should the expert visit?"
                                                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 text-white text-[10px] uppercase font-black tracking-widest outline-none focus:border-indigo-500 focus:bg-white/10 transition-all placeholder:text-slate-700" 
                                                     />
                                                 </div>
                                             </div>

                                             {/* High-Fidelity Visual Availability Calendar Hub Pulse */}
                                             <div className="space-y-3 pt-2">
                                                 <div className="flex items-center justify-between px-1">
                                                     <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] font-mono">2. Choose Date</label>
                                                 </div>
                                                 <div className="flex space-x-2.5 overflow-x-auto pb-3 scrollbar-hide snap-x">
                                                     {next14Days.map((date, i) => {
                                                         const isSelected = bookingData.date === date.toISOString().split('T')[0];
                                                         const isBlocked = provider.availability?.blockedDates?.includes(date.toISOString().split('T')[0]);
                                                         return (
                                                             <button key={i} type="button" disabled={isBlocked} onClick={() => setBookingData({ ...bookingData, date: date.toISOString().split('T')[0] })} className={`h-16 min-w-[55px] snap-center rounded-2xl flex flex-col items-center justify-center transition-all border shrink-0 ${isSelected ? 'bg-primary-600 text-white border-primary-400 shadow-lg shadow-primary-600/20' : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/20'}`}>
                                                                 <span className="text-[7px] font-bold uppercase opacity-60">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                                                 <span className="text-sm font-black">{date.getDate()}</span>
                                                             </button>
                                                         );
                                                     })}
                                                 </div>
                                             </div>

                                             <div className="space-y-3">
                                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 font-mono">3. Select Time</label>
                                                 <div className="grid grid-cols-2 gap-3">
                                                     {['09:00 - 12:00', '13:00 - 16:00', '17:00 - 20:00'].map(t => (
                                                         <button key={t} type="button" onClick={() => setBookingData({ ...bookingData, time: t })} className={`h-14 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${bookingData.time === t ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_10px_20px_rgba(79,70,229,0.2)]' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}>{t}</button>
                                                     ))}
                                                 </div>
                                             </div>
                                         </div>

                                         <div className="pt-8 border-t border-white/5 flex items-end justify-between">
                                              <div className="space-y-1"><p className="text-[10px] font-black text-slate-600 uppercase tracking-widest font-mono">Total Est. Balance</p><h3 className="text-4xl font-black text-white tracking-widest font-mono">₹{bookingData.totalPrice || 499}</h3></div>
                                              <div className="flex flex-col items-end"><div className="flex items-center space-x-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-auto"><Lock className="w-3 h-3" /><span>Secure Checkout</span></div></div>
                                         </div>

                                         <button type="submit" className="w-full py-5 bg-white text-slate-950 font-black rounded-2xl hover:bg-slate-100 active:scale-95 transition-all shadow-2xl shadow-white/5 uppercase tracking-[0.15em] text-[10px] flex items-center justify-center space-x-3 group/btn relative overflow-hidden mt-6">
                                             <span>Confirm Booking</span>
                                             <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1.5 transition-transform text-indigo-600" />
                                         </button>
                                     </form>
                                 )}
                             </AnimatePresence>
                        </section>

                        {/* Interactive Bridge Hub Hub */}
                        <div className="grid grid-cols-1 gap-4">
                            <button onClick={() => setIsChatOpen(true)} className="w-full p-6 bg-white border border-slate-100 rounded-3xl flex items-center gap-5 group hover:border-indigo-400 transition-all shadow-lg relative overflow-hidden active:scale-95">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><MessageSquare className="w-12 h-12 text-indigo-900" /></div>
                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0 shadow-inner"><MessageSquare className="w-6 h-6" /></div>
                                <div className="text-left py-1"><h4 className="text-base font-black text-slate-900 uppercase tracking-tighter">Consultation Chat</h4><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Message expert for inquiries</p></div>
                            </button>

                            <div className="grid grid-cols-1 gap-4">
                                <button onClick={handleVideoConsultation} className="p-6 bg-indigo-600 text-white rounded-3xl flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-95 border border-white/10 shadow-lg font-black uppercase tracking-widest text-[10px]">
                                     <Video className="w-5 h-5" />
                                     <span>Request Video Consultation Hub</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>{isChatOpen && <ChatWindow recipientId={provider.user?._id} recipientName={provider.user?.name} onClose={() => setIsChatOpen(false)} />}</AnimatePresence>
        </div>
    );
};

export default ProviderDetails;
