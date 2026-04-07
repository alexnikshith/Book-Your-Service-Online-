import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
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
        <ToastContext.Provider value={{ showToast }}>
            {children}
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
