import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { Calendar, Clock, MapPin, CheckCircle, Clock4, XCircle, Star, MessageSquare, X, Zap, CreditCard, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReviewForm from '../reviews/ReviewForm';
import ChatWindow from '../ChatWindow';
import socket from '../../utils/socket';
import { useToast } from '../../context/ToastContext';

const UserDashboard = () => {
    const { showToast } = useToast();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
    const [activeChat, setActiveChat] = useState(null); 
    const [upiModal, setUpiModal] = useState(null); // { upiId, bookingId }

    const fetchBookings = async () => {
        try {
            const { data } = await API.get('/bookings');
            setBookings(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();

        socket.on('booking_updated', fetchBookings);
        return () => socket.off('booking_updated', fetchBookings);
    }, []);

    const cancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking pulse?')) return;
        try {
            await API.put(`/bookings/${bookingId}/status`, { status: 'cancelled' });
            setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
        } catch (err) {
            console.error(err);
            showToast('Cancellation Failed: ' + (err.response?.data?.message || err.message), 'error');
        }
    };

    const handleConfirmPayment = async (id) => {
        try {
            await API.put(`/bookings/${id}/escrow`); // Using existing portal but logically as direct confirmation
            setUpiModal(null);
            showToast('Direct Payment Confirmed. The expert has been notified!', 'success');
            fetchBookings();
        } catch (err) {
            showToast('Confirmation Hub Busy: ' + (err.response?.data?.message || err.message), 'warning');
        }
    };

    const handleRelease = async (id) => {
        if (!window.confirm('Are you sure the expert hub has completed the work pulse? Funds will be settled instantly.')) return;
        try {
            await API.put(`/bookings/${id}/release`);
            showToast('Milestone transmission successful. Funds released!', 'success');
            fetchBookings();
        } catch (err) {
            showToast('Release Registry Hub Busy: ' + (err.response?.data?.message || err.message), 'error');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'accepted': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'declined': return 'bg-red-100 text-red-700 border-red-200';
            case 'held_in_escrow': return 'bg-primary-50 text-primary-700 border-primary-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            case 'accepted': return <CheckCircle className="w-4 h-4 text-indigo-500" />;
            case 'declined': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'pending': return <Clock4 className="w-4 h-4" />;
            case 'cancelled': return <XCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-10 animate-fade-in mb-20 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Service History</h1>
                    <p className="text-slate-500 font-medium">Keep track of your bookings and past services.</p>
                </div>
                <div className="flex space-x-3">
                    <div className="px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-center min-w-[120px]">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-0.5">Total Spent</p>
                        <p className="text-xl font-bold text-slate-900">₹{bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0).toLocaleString('en-IN')}</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full" />
                </div>
            ) : bookings.length === 0 ? (
                <div className="glass p-16 text-center rounded-[3rem] border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings found</h3>
                    <p className="text-slate-500 font-medium mb-8">You haven't booked any services yet.</p>
                    <button className="btn-primary">Find Services Now</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {bookings.map((booking, idx) => (
                        <motion.div 
                            key={booking._id} 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:border-primary-100 transition-all duration-300 group"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={`px-4 py-2 rounded-full border text-xs font-bold flex items-center space-x-2 ${getStatusStyle(booking.status)}`}>
                                    {getStatusIcon(booking.status)}
                                    <span className="uppercase tracking-widest">{booking.status}</span>
                                </div>
                                <span className="text-lg font-black text-slate-900">₹{booking.totalPrice?.toLocaleString('en-IN')}</span>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-extrabold text-slate-900 mb-1 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{booking.serviceName}</h3>
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center space-x-2">
                                            <span>Provider:</span>
                                            <span className="text-primary-500">{booking.provider?.user?.name || 'Professional'}</span>
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => setActiveChat({ id: booking.provider?.user?._id, name: booking.provider?.user?.name })}
                                        className="p-4 bg-slate-50 text-primary-500 rounded-2xl hover:bg-primary-500 hover:text-white transition-all shadow-sm hover:rotate-12"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-slate-50">
                                    <div className="flex items-center space-x-3 text-slate-600 font-medium text-sm">
                                        <Calendar className="w-4 h-4 text-primary-400" />
                                        <span>{new Date(booking.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-slate-600 font-medium text-sm">
                                        <Clock className="w-4 h-4 text-primary-400" />
                                        <span>{booking.time}</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-slate-600 font-medium text-sm">
                                        <MapPin className="w-4 h-4 text-primary-400" />
                                        <span className="line-clamp-1">{booking.address}</span>
                                    </div>
                                </div>
                                
                                <div className="pt-6 flex flex-col space-y-3">
                                   {booking.paymentStatus === 'unpaid' && booking.status !== 'cancelled' && (
                                       <button 
                                            onClick={() => setUpiModal({ upiId: booking.provider?.upiId || 'Pending Hub URI', bookingId: booking._id, price: booking.totalPrice })}
                                            className="w-full py-4 bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-500 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2"
                                       >
                                            <CreditCard className="w-4 h-4" />
                                            <span>Settle Payment via UPI</span>
                                       </button>
                                   )}
                                   
                                   {booking.paymentStatus === 'held_in_escrow' && (
                                       <button 
                                            onClick={() => handleRelease(booking._id)}
                                            className="w-full py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-500/20 hover:bg-green-500 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2"
                                       >
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Release Milestone Funds</span>
                                       </button>
                                   )}

                                   {booking.status === 'completed' && (
                                        <button 
                                            onClick={() => setSelectedBookingForReview(booking)}
                                            className="w-full py-3 bg-primary-50 text-primary-600 font-bold rounded-2xl border border-primary-100 hover:bg-primary-600 hover:text-white transition-all flex items-center justify-center space-x-2 group"
                                        >
                                            <Star className="w-4 h-4 group-hover:scale-110" />
                                            <span>Rate Service Pulse</span>
                                        </button>
                                   )}
                                   
                                   {booking.status === 'pending' && booking.paymentStatus === 'unpaid' && (
                                        <button 
                                            onClick={() => cancelBooking(booking._id)}
                                            className="w-full py-3 bg-red-50 text-red-500 font-bold rounded-2xl border border-red-100 hover:bg-red-500 hover:text-white transition-all text-xs"
                                        >
                                            Cancel Request
                                        </button>
                                   )}

                                    <button 
                                        onClick={() => setActiveChat({ id: booking.provider?.user?._id, name: booking.provider?.user?.name })}
                                        className="w-full py-3 bg-slate-50 text-slate-400 font-bold rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center space-x-2 text-[10px] uppercase tracking-widest"
                                    >
                                        <MessageSquare className="w-3 h-3" />
                                        <span>Message Node</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* UPI Payment Modal Hub */}
            <AnimatePresence>
                {upiModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[3.5rem] w-full max-w-lg p-12 space-y-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                            
                            <div className="flex justify-between items-start relative z-10">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Direct UPI Hub</h3>
                                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Pay via GPay / PhonePe / Paytm</p>
                                </div>
                                <button onClick={() => setUpiModal(null)} className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><X className="w-5 h-5" /></button>
                            </div>
                            
                            <div className="bg-slate-50 rounded-[2.5rem] p-10 space-y-8 relative z-10 border border-slate-100">
                                <div className="text-center space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Total Amount Pulse</p>
                                    <p className="text-5xl font-black text-slate-900 select-none">₹{upiModal.price}</p>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-slate-200/50">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">Expert UPI Identity</p>
                                    <div className="bg-white border-2 border-primary-100 p-6 rounded-3xl flex items-center justify-between shadow-sm group hover:border-primary-500 transition-all">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 font-black"><Zap className="w-5 h-5" /></div>
                                            <span className="font-mono font-black text-slate-800 text-lg tracking-wider">{upiModal.upiId}</span>
                                        </div>
                                        <button 
                                            onClick={() => { navigator.clipboard.writeText(upiModal.upiId); showToast('UPI Copied to Clipboard', 'info'); }} 
                                            className="p-3 text-slate-300 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all active:scale-90"
                                        >
                                            <Copy className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10 pt-4">
                                <button 
                                    onClick={() => handleConfirmPayment(upiModal.bookingId)}
                                    className="w-full py-6 bg-slate-900 text-white font-black rounded-3xl shadow-2xl shadow-slate-900/20 hover:bg-primary-600 transition-all flex items-center justify-center space-x-3 text-sm uppercase tracking-[0.2em] group"
                                >
                                    <Check  className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span>Signal Payment Sent</span>
                                </button>
                                <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-4">Ensure the payment is completed in your UPI app before confirming here.</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Chat Window Overlay Hub */}
            <AnimatePresence>
                {activeChat && (
                    <ChatWindow 
                        recipientId={activeChat.id} 
                        recipientName={activeChat.name} 
                        onClose={() => setActiveChat(null)} 
                    />
                )}
            </AnimatePresence>

            {/* Review Overlay/Modal */}
            <AnimatePresence>
                {selectedBookingForReview && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-2xl relative"
                        >
                            <button 
                                onClick={() => setSelectedBookingForReview(null)}
                                className="absolute -top-4 -right-4 p-4 bg-white rounded-full shadow-xl hover:bg-slate-100 transition-all z-10"
                            >
                                <X className="w-6 h-6 text-slate-900" />
                            </button>
                            <ReviewForm 
                                providerId={selectedBookingForReview.provider?._id || selectedBookingForReview.provider} 
                                onReviewAdded={() => {
                                    setTimeout(() => {
                                        setSelectedBookingForReview(null);
                                        fetchBookings();
                                    }, 2000);
                                }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserDashboard;
