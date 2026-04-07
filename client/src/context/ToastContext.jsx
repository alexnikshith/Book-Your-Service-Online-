import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [confirm, setConfirm] = useState(null); // { message, onConfirm, onCancel }

    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const showConfirm = useCallback((message, onConfirm) => {
        setConfirm({ 
            message, 
            onConfirm: () => { onConfirm(); setConfirm(null); },
            onCancel: () => setConfirm(null)
        });
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
            case 'warning': return <AlertCircle className="w-5 h-5 text-orange-500" />;
            default: return <Info className="w-5 h-5 text-primary-500" />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'success': return 'bg-white border-green-100 shadow-green-500/5';
            case 'error': return 'bg-white border-red-100 shadow-red-500/5';
            case 'warning': return 'bg-white border-orange-100 shadow-orange-500/5';
            default: return 'bg-white border-primary-100 shadow-primary-500/5';
        }
    };

    return (
        <ToastContext.Provider value={{ showToast, showConfirm }}>
            {children}
            
            {/* Global High-Fidelity Confirmation Modal Hub */}
            <AnimatePresence>
                {confirm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[4000] flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-[3rem] w-full max-w-md p-10 space-y-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                                <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center"><AlertCircle className="w-8 h-8" /></div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">System Authorization</h3>
                                <p className="text-sm font-bold text-slate-500 leading-relaxed">{confirm.message}</p>
                            </div>
                            <div className="flex flex-col space-y-3 relative z-10">
                                <button onClick={confirm.onConfirm} className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-primary-600 transition-all shadow-xl shadow-slate-900/10">Proceed with Pulse</button>
                                <button onClick={confirm.onCancel} className="w-full py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-slate-600 transition-all">Abort Action</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Existing Toast Stack */}
            <div className="fixed top-24 right-10 z-[3000] flex flex-col space-y-4 pointer-events-none w-80">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, x: 20 }}
                            className={`pointer-events-auto flex items-start p-6 rounded-[2rem] border-2 shadow-2xl backdrop-blur-xl ${getBgColor(toast.type)}`}
                        >
                            <div className="mr-4 mt-0.5">{getIcon(toast.type)}</div>
                            <div className="flex-1 mr-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{toast.type} Pulse</h4>
                                <p className="text-sm font-bold text-slate-800 leading-relaxed">{toast.message}</p>
                            </div>
                            <button 
                                onClick={() => removeToast(toast.id)}
                                className="text-slate-300 hover:text-slate-900 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
