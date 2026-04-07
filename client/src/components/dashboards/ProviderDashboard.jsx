import React, { useEffect, useState, useContext } from 'react';
import API from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { Check, X, Clock, Settings, User, DollarSign, Calendar, MapPin, ChevronRight, Activity, TrendingUp, AlertCircle, Loader2, Star, Bell, MessageSquare, ShieldCheck, Mail, Zap, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatWindow from '../ChatWindow';

const ProviderDashboard = () => {
    const { user: authUser } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [profile, setProfile] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'feedbacks', 'notifications', 'messages'
    const [activeChat, setActiveChat] = useState(null);
    const [editData, setEditData] = useState({ experience: '', age: '', city: '', serviceableCities: '', upiId: '' });

    const fetchData = async () => {
        try {
            const [bookingsRes, profileRes, reviewsRes, notifRes, convRes] = await Promise.all([
                API.get('/bookings'),
                API.get('/providers/me'),
                API.get('/reviews/my-reviews'),
                API.get('/notifications'),
                API.get('/messages/conversations/list')
            ]);
            setBookings(bookingsRes.data);
            setProfile(profileRes.data);
            setReviews(reviewsRes.data);
            setNotifications(notifRes.data);
            setConversations(convRes.data);
            
            const prof = profileRes.data;
            setEditData({ 
                experience: prof.experience || 0,
                age: prof.age || '',
                city: prof.location?.city || '',
                serviceableCities: prof.serviceableCities?.join(', ') || '',
                upiId: prof.upiId || ''
            });
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authUser) fetchData();
    }, [authUser]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { data } = await API.put('/providers/profile', { 
                experience: Number(editData.experience),
                age: Number(editData.age),
                city: editData.city,
                serviceableCities: editData.serviceableCities.split(',').map(c => c.trim()).filter(c => c !== ''),
                upiId: editData.upiId
            });
            setProfile(data);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert('Update Failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsSaving(false);
        }
    };

    const updateStatus = async (bookingId, status) => {
        try {
            await API.put(`/bookings/${bookingId}/status`, { status });
            setBookings(bookings.map(b => b._id === bookingId ? { ...b, status } : b));
        } catch (err) {
            console.error(err);
        }
    };

    const markAsRead = async (notifId) => {
        try {
            await API.put(`/notifications/${notifId}/read`);
            setNotifications(notifications.map(n => n._id === notifId ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const stats = [
        { label: 'Rating Aura', value: profile?.averageRating || '5.0', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-100' },
        { label: 'Active Jobs', value: bookings.filter(b => b.status === 'accepted').length, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Live Chats', value: conversations.length, icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Total Earnings', value: `₹${bookings.filter(b => b.status === 'completed').reduce((acc, b) => acc + b.totalPrice, 0)}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Expert Stream...</p>
        </div>
    );

    return (
        <div className="space-y-12 animate-fade-in pb-20 relative">
            {/* Header / Stats */}
            <div className="flex flex-col md:flex-row gap-8 items-stretch">
                <div className="flex-1 space-y-2 py-4">
                    <div className="flex items-center space-x-3 text-primary-600 mb-1">
                        <ShieldCheck className="w-5 h-5 fill-current opacity-20" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Verified Expert Protocol</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Partner Dashboard</h1>
                    <p className="text-slate-500 font-medium">Elevating your service quality every single day.</p>
                </div>
                {!profile?.isApproved ? (
                    <div className="md:w-1/3 bg-orange-50/50 border border-orange-200 p-6 rounded-3xl flex items-center space-x-4 shadow-sm animate-pulse">
                        <AlertCircle className="w-10 h-10 text-orange-500 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-orange-700 text-sm">Account Pending Approval</h4>
                            <p className="text-orange-600/70 text-xs mt-0.5 leading-relaxed font-medium">Platform audit in progress. Bookings disabled.</p>
                        </div>
                    </div>
                ) : (
                    <div className="md:w-1/3 bg-green-50/50 border border-green-200 p-6 rounded-3xl flex items-center space-x-4 shadow-sm">
                        <Check className="w-10 h-10 text-green-500 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-green-700 text-sm">Status: Online & Ready</h4>
                            <p className="text-green-600/70 text-xs mt-0.5 leading-relaxed font-medium">Live expertly on the service market.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 group"
                    >
                        <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-7 h-7" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Main Tabs Navigation */}
            <div className="flex space-x-3 bg-slate-200/50 p-2 rounded-3xl w-fit">
                {['bookings', 'messages', 'feedbacks', 'notifications'].map((tab) => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        {tab === 'feedbacks' ? 'Customer Feedbacks' : tab === 'messages' ? 'Live Conversations' : tab}
                        {tab === 'notifications' && notifications.some(n => !n.isRead) && (
                            <span className="ml-2 w-2 h-2 bg-red-500 rounded-full inline-block"></span>
                        )}
                        {tab === 'messages' && conversations.some(c => c.unread) && (
                            <span className="ml-2 w-2 h-2 bg-primary-500 rounded-full inline-block animate-pulse"></span>
                        )}
                    </button>
                ))}
            </div>

            {/* Dashboard Content Container */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {activeTab === 'bookings' && (
                            <motion.div key="bookings" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                                <div className="flex items-center justify-between px-2">
                                     <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
                                        <Calendar className="w-6 h-6 text-primary-500" />
                                        <span>Recent Job Stream</span>
                                     </h2>
                                </div>
                                <div className="space-y-4">
                                     {bookings.length === 0 ? (
                                         <div className="h-64 flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 space-y-4">
                                             <Activity className="w-12 h-12 text-slate-300 opacity-30" />
                                             <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No active transmissions</p>
                                         </div>
                                     ) : bookings.map((booking, idx) => (
                                         <div key={booking._id} className="p-8 bg-white border border-slate-100 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-500 group border-b-8 border-b-slate-100 hover:border-b-primary-200">
                                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                                 <div className="flex items-start space-x-6">
                                                     <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-slate-900/10 group-hover:bg-primary-600 transition-all">
                                                         {booking.user?.name?.[0].toUpperCase() || 'U'}
                                                     </div>
                                                     <div className="space-y-2">
                                                         <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight group-hover:text-primary-600 transition-colors">{booking.serviceName}</h4>
                                                         <div className="flex items-center space-x-6 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">
                                                             <span className="flex items-center space-x-2"><User className="w-4 h-4 text-primary-400" /> <span>{booking.user?.name}</span></span>
                                                             <span className="flex items-center space-x-2"><MapPin className="w-4 h-4 text-primary-400" /> <span>{booking.address}</span></span>
                                                         </div>
                                                     </div>
                                                 </div>
                                                 <div className="flex items-center space-x-4">
                                                     <button 
                                                        onClick={() => setActiveChat({ id: booking.user?._id, name: booking.user?.name })}
                                                        className="w-16 h-16 bg-slate-50 text-primary-600 rounded-2xl hover:bg-primary-600 hover:text-white transition-all flex items-center justify-center"
                                                     >
                                                        <MessageSquare className="w-6 h-6" />
                                                     </button>
                                                     {booking.status === 'pending' && (
                                                         <>
                                                             <button onClick={() => updateStatus(booking._id, 'accepted')} className="px-8 h-16 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-500 transition-all shadow-xl shadow-primary-500/20 active:scale-95 uppercase tracking-widest text-[10px]">Accept Job</button>
                                                             <button onClick={() => updateStatus(booking._id, 'rejected')} className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"><X className="w-6 h-6" /></button>
                                                         </>
                                                     )}
                                                     {booking.status === 'accepted' && (
                                                        <button onClick={() => updateStatus(booking._id, 'completed')} className="px-10 h-20 bg-green-600 text-white font-black rounded-3xl hover:bg-green-500 transition-all shadow-2xl shadow-green-500/20 active:scale-95 group/btn flex items-center space-x-4">
                                                            <span className="uppercase tracking-[0.2em] text-[11px]">Finalize Pulse</span>
                                                            <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                                                        </button>
                                                     )}
                                                     {booking.status === 'completed' && (
                                                         <div className="px-8 py-4 bg-green-50 text-green-600 rounded-[2rem] border border-green-100 font-black text-[10px] uppercase tracking-widest shadow-sm">Audit Complete</div>
                                                     )}
                                                 </div>
                                             </div>
                                             <div className="mt-8 pt-8 border-t border-slate-50 flex items-center space-x-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                 <div className="flex items-center space-x-3"><Calendar className="w-4 h-4 text-primary-400" /> <span>{new Date(booking.date).toLocaleDateString()}</span></div>
                                                 <div className="flex items-center space-x-3"><Clock className="w-4 h-4 text-primary-400" /> <span>{booking.time}</span></div>
                                                 <div className="flex items-center space-x-3"><DollarSign className="w-4 h-4 text-primary-400" /> <span className="text-slate-900 text-sm">₹{booking.totalPrice}</span></div>
                                             </div>
                                         </div>
                                     ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'messages' && (
                            <motion.div key="messages" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                                <div className="flex items-center justify-between px-2">
                                     <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
                                        <Zap className="w-6 h-6 text-primary-500" />
                                        <span>Live Correspondence Hub</span>
                                     </h2>
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Channels: {conversations.length}</p>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                     {conversations.length === 0 ? (
                                         <div className="p-20 text-center bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
                                              <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                              <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No active chat streams</p>
                                         </div>
                                     ) : conversations.map((conv, i) => (
                                         <div 
                                            key={i} 
                                            onClick={() => setActiveChat({ id: conv.userId, name: conv.name })}
                                            className="p-8 bg-white border border-slate-100 rounded-[3rem] shadow-sm hover:shadow-xl transition-all cursor-pointer flex items-center justify-between group"
                                         >
                                              <div className="flex items-center space-x-6">
                                                   <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl group-hover:bg-primary-600 transition-all shadow-lg">
                                                        {conv.name?.[0]}
                                                   </div>
                                                   <div>
                                                        <h4 className="font-extrabold text-slate-900 text-lg group-hover:text-primary-600 transition-colors uppercase tracking-tight">{conv.name}</h4>
                                                        <p className="text-slate-400 font-medium text-sm line-clamp-1">{conv.lastMessage}</p>
                                                   </div>
                                              </div>
                                              <div className="flex flex-col items-end space-y-2">
                                                   <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(conv.lastDate).toLocaleDateString()}</span>
                                                   {conv.unread && (
                                                       <span className="px-3 py-1 bg-primary-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest">New Signal</span>
                                                   )}
                                              </div>
                                         </div>
                                     ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'feedbacks' && (
                            <motion.div key="feedbacks" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                                <div className="flex items-center justify-between px-2">
                                     <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
                                        <MessageSquare className="w-6 h-6 text-green-500" />
                                        <span>Reputation Audit</span>
                                     </h2>
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Reviews: {reviews.length}</p>
                                </div>
                                <div className="space-y-6">
                                     {reviews.length === 0 ? (
                                         <div className="p-20 text-center bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
                                              <Star className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                              <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No feedbacks broadcasted yet</p>
                                         </div>
                                     ) : reviews.map((rev, i) => (
                                         <div key={rev._id} className="p-10 bg-white border border-slate-100 rounded-[3.5rem] shadow-sm hover:shadow-xl transition-all border-l-8 border-l-yellow-400">
                                              <div className="flex items-center justify-between mb-6">
                                                  <div className="flex items-center space-x-5">
                                                      <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl">{rev.user?.name?.[0]}</div>
                                                      <div>
                                                          <h4 className="font-extrabold text-slate-900 uppercase tracking-tight">{rev.user?.name}</h4>
                                                          <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Verified Client</p>
                                                      </div>
                                                  </div>
                                                  <div className="flex items-center space-x-1 bg-yellow-50 px-4 py-2 rounded-2xl">
                                                       <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                       <span className="font-black text-yellow-700 text-sm">{rev.rating}</span>
                                                  </div>
                                              </div>
                                              <p className="text-slate-600 font-medium text-lg italic leading-relaxed">"{rev.comment}"</p>
                                              <p className="mt-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{new Date(rev.createdAt).toLocaleDateString()}</p>
                                         </div>
                                     ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'notifications' && (
                            <motion.div key="notifications" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                                <div className="flex items-center justify-between px-2">
                                     <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
                                        <Bell className="w-6 h-6 text-red-500" />
                                        <span>Alert History Hub</span>
                                     </h2>
                                </div>
                                <div className="space-y-4">
                                     {notifications.length === 0 ? (
                                         <div className="p-20 text-center bg-slate-50 rounded-[4rem]">
                                              <Mail className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No active alerts in registry</p>
                                         </div>
                                     ) : notifications.map((n) => (
                                         <div 
                                            key={n._id} 
                                            onClick={() => markAsRead(n._id)}
                                            className={`p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all cursor-pointer relative ${!n.isRead ? 'border-l-4 border-l-primary-500' : ''}`}
                                         >
                                              {!n.isRead && <span className="absolute top-8 right-8 w-3 h-3 bg-primary-500 rounded-full animate-ping"></span>}
                                              <div className="flex items-center space-x-6">
                                                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${n.type === 'review' ? 'bg-yellow-50 text-yellow-600' : 'bg-blue-50 text-blue-600'}`}>
                                                        {n.type === 'review' ? <Star className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                                                   </div>
                                                   <div className="flex-1">
                                                        <h4 className="font-extrabold text-slate-900 text-lg">{n.title}</h4>
                                                        <p className="text-slate-500 font-medium text-sm">{n.message}</p>
                                                        
                                                        {/* Dynamic Join Meeting Node */}
                                                        {n.link && (
                                                            <div className="pt-4">
                                                                <a 
                                                                    href={n.link} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center space-x-3 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-600/20"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <Video className="w-4 h-4" />
                                                                    <span>Join Consultation Node</span>
                                                                </a>
                                                            </div>
                                                        )}
                                                        
                                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                                                   </div>
                                              </div>
                                         </div>
                                     ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right side Profile Audit */}
                <div className="space-y-8">
                     <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-3">
                        <Settings className="w-6 h-6 text-primary-500" />
                        <span>Profile Audit</span>
                     </h2>
                     <div className="glass p-10 rounded-[3rem] border-slate-100 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400"></div>
                        <div className="space-y-10 relative">
                             <div className="flex items-center space-x-6">
                                 <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-white ring-4 ring-slate-100 group-hover:ring-primary-100 transition-all shadow-2xl font-black text-3xl">
                                     {profile?.user?.name?.[0].toUpperCase() || 'P'}
                                 </div>
                                 <div className="space-y-2">
                                     <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">{profile?.user?.name || authUser?.name}</h3>
                                     <div className="flex items-center space-x-2 py-1.5 px-4 bg-slate-100 rounded-full w-fit">
                                         <ShieldCheck className="w-3.5 h-3.5 text-primary-600" />
                                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{profile?.categories?.join(' • ') || 'Expert Partner'}</p>
                                     </div>
                                 </div>
                             </div>

                             <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-6">
                                       <div className="p-6 bg-slate-50/80 rounded-[2rem] border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Operational Years</p>
                                            <p className="text-2xl font-black text-slate-900">{profile?.experience || 0}</p>
                                       </div>
                                       <div className="p-6 bg-slate-50/80 rounded-[2rem] border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Age Ledger</p>
                                            <p className="text-2xl font-black text-slate-900">{profile?.age || '--'}</p>
                                       </div>
                                  </div>
                             </div>

                             {isEditing ? (
                                 <div className="space-y-6">
                                     <div className="space-y-2">
                                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Yrs Experience</label>
                                         <input type="number" className="w-full h-16 bg-slate-50 rounded-[1.5rem] px-6 font-bold outline-none border border-slate-100" value={editData.experience} onChange={(e) => setEditData({ ...editData, experience: e.target.value })} />
                                     </div>
                                     <div className="space-y-2">
                                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Expert Age Ledger</label>
                                         <input type="number" className="w-full h-16 bg-slate-50 rounded-[1.5rem] px-6 font-bold outline-none border border-slate-100" value={editData.age} onChange={(e) => setEditData({ ...editData, age: e.target.value })} />
                                     </div>
                                     <div className="space-y-2">
                                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Operational City</label>
                                         <input type="text" className="w-full h-16 bg-slate-50 rounded-[1.5rem] px-6 font-bold outline-none border border-slate-100" value={editData.city} onChange={(e) => setEditData({ ...editData, city: e.target.value })} />
                                     </div>
                                     <div className="space-y-2">
                                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Serviceable Zones</label>
                                         <textarea className="w-full h-24 bg-slate-50 rounded-[1.5rem] p-6 font-bold outline-none border border-slate-100" value={editData.serviceableCities} onChange={(e) => setEditData({ ...editData, serviceableCities: e.target.value })} />
                                     </div>
                                     <div className="space-y-2">
                                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">UPI Settlement Hub</label>
                                         <input type="text" placeholder="e.g. yourname@ybl" className="w-full h-16 bg-white rounded-[1.5rem] px-6 font-black text-indigo-600 outline-none border-2 border-indigo-100 placeholder:text-slate-300" value={editData.upiId} onChange={(e) => setEditData({ ...editData, upiId: e.target.value })} />
                                     </div>
                                     <div className="flex space-x-3 pt-4">
                                         <button disabled={isSaving} onClick={handleSave} className="flex-1 h-16 bg-primary-600 text-white font-black rounded-[1.5rem] shadow-xl shadow-primary-500/20 active:scale-95 flex items-center justify-center space-x-3 uppercase text-[10px] tracking-widest">{isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Apply Polish'}</button>
                                         <button onClick={() => setIsEditing(false)} className="px-6 h-16 bg-white border border-slate-100 text-slate-400 rounded-[1.5rem] font-bold">Cancel</button>
                                     </div>
                                 </div>
                             ) : (
                                 <button onClick={() => setIsEditing(true)} className="w-full h-20 bg-slate-900 text-white font-black rounded-[2rem] hover:bg-slate-800 transition-all flex items-center justify-center space-x-4 shadow-2xl shadow-slate-900/10 active:scale-95 active:rotate-1">
                                     <Settings className="w-6 h-6 opacity-30" />
                                     <span className="uppercase tracking-[0.2em] text-[11px]">Audit Engine Config</span>
                                 </button>
                             )}
                        </div>
                     </div>
                </div>
            </div>

            {/* Chat Window Overlay */}
            <AnimatePresence>
                {activeChat && (
                    <ChatWindow 
                        recipientId={activeChat.id} 
                        recipientName={activeChat.name} 
                        onClose={() => setActiveChat(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProviderDashboard;
