import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, MessageSquare, ShieldCheck, Zap, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import API from '../../api/axios';

const BookingModal = ({ provider, onClose }) => {
    const [step, setStep] = useState(1);
    const [bookingData, setBookingData] = useState({
        serviceName: '',
        totalPrice: 0,
        date: '',
        time: '',
        address: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleServiceSelect = (service) => {
        setBookingData({ 
            ...bookingData, 
            serviceName: service.name, 
            totalPrice: service.price 
        });
        setStep(2);
    };

    const handleConfirm = async () => {
        setLoading(true);
        setError(null);
        try {
            await API.post('/bookings', {
                providerId: provider._id,
                ...bookingData
            });
            setSuccess(true);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Booking pulse failed');
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="p-8 pb-0 flex justify-between items-start">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Hire Expert</h2>
                            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{provider.user?.name}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                    </div>

                    <div className="p-8">
                        {success ? (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-10 space-y-6">
                                <div className="w-20 h-20 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-green-100">
                                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900 uppercase">Booking Confirmed!</h3>
                                    <p className="text-slate-500 font-medium">The expert has been notified and will respond shortly.</p>
                                </div>
                                <button onClick={onClose} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Back to Dashboard</button>
                            </motion.div>
                        ) : (
                            <div className="space-y-8">
                                {step === 1 && (
                                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Select Specialty Service</h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            {(provider.servicesOffered || [
                                                { name: 'Standard Service Call', price: 499, duration: '1-2 hrs' },
                                                { name: 'Expert Consultation', price: 999, duration: '2-4 hrs' }
                                            ]).map((s, idx) => (
                                                <button 
                                                    key={idx} 
                                                    onClick={() => handleServiceSelect(s)}
                                                    className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-slate-900 hover:text-white transition-all group"
                                                >
                                                    <div className="flex flex-col items-start">
                                                        <span className="font-black text-sm uppercase tracking-tight">{s.name}</span>
                                                        <span className="text-[10px] font-bold opacity-60 uppercase">{s.duration}</span>
                                                    </div>
                                                    <span className="text-lg font-black tracking-tighter">₹{s.price}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Date</label>
                                                    <div className="relative group">
                                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                                                        <input 
                                                            type="date"
                                                            value={bookingData.date}
                                                            onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                                                            className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-bold"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time Slot</label>
                                                    <div className="relative group">
                                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                                                        <select 
                                                            value={bookingData.time}
                                                            onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                                                            className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-primary-500/10 transition-all appearance-none"
                                                        >
                                                            <option value="">Choose Time</option>
                                                            <option value="9:00 AM - 11:00 AM">9:00 AM - 11:00 AM</option>
                                                            <option value="11:00 AM - 1:00 PM">11:00 AM - 1:00 PM</option>
                                                            <option value="2:00 PM - 4:00 PM">2:00 PM - 4:00 PM</option>
                                                            <option value="4:00 PM - 6:00 PM">4:00 PM - 6:00 PM</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location Address</label>
                                                <div className="relative group">
                                                    <MapPin className="absolute left-4 top-5 w-4 h-4 text-primary-500" />
                                                    <textarea 
                                                        placeholder="Full service address..."
                                                        value={bookingData.address}
                                                        onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
                                                        className="w-full h-24 pl-12 p-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-primary-500/10 transition-all placeholder:text-slate-300"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {error && (
                                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600">
                                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                <p className="text-[10px] font-bold uppercase">{error}</p>
                                            </div>
                                        )}

                                        <button 
                                            disabled={loading || !bookingData.date || !bookingData.time || !bookingData.address}
                                            onClick={handleConfirm}
                                            className="w-full h-16 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-200 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all relative overflow-hidden"
                                        >
                                            <span className={loading ? 'opacity-0' : 'opacity-100'}>Proceed with Booking</span>
                                            {loading && <RefreshCcw className="absolute inset-x-0 w-5 h-5 mx-auto animate-spin" />}
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BookingModal;
