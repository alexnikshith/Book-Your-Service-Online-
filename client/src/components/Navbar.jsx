import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { MapPin, User, LogOut, Search, Menu, X, Bell, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import socket from '../utils/socket';
import API from '../api/axios';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [notifications, setNotifications] = React.useState([]);
    const [showNotifs, setShowNotifs] = React.useState(false);
    const [notifLoading, setNotifLoading] = React.useState(false);

    const fetchNotifications = async () => {
        if (!user) return;
        setNotifLoading(true);
        try {
            const { data } = await API.get('/notifications');
            setNotifications(data);
        } catch (err) {
            console.error('Navbar Signal Sync Error:', err);
        } finally {
            setNotifLoading(false);
        }
    };

    React.useEffect(() => {
        if (!user) return;
        fetchNotifications();

        // Join personal room for pulses
        socket.emit('join_room', user._id.toString());

        const handleNewNotification = (data) => {
            setNotifications(prev => [data, ...prev]);
            // Optional: You could trigger a browser toast here Hub
        };

        const handleNewMessagePulse = (data) => {
             // If we want a notification for messages too
             setNotifications(prev => [{
                 title: 'Secure Correspondence',
                 message: `Node signal received: ${data.content.substring(0, 30)}...`,
                 isRead: false,
                 _id: Date.now()
             }, ...prev]);
        };

        socket.on('receive_notification', handleNewNotification);
        socket.on('receive_message', handleNewMessagePulse);

        return () => {
            socket.off('receive_notification', handleNewNotification);
            socket.off('receive_message', handleNewMessagePulse);
        };
    }, [user]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            if (searchQuery.trim()) {
                navigate(`/providers?category=${encodeURIComponent(searchQuery.trim())}`);
                setIsOpen(false);
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <nav className="sticky top-0 z-50 glass border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="bg-primary-600 p-1.5 rounded-lg">
                            <MapPin className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
                            ServiceFinder
                        </span>
                    </Link>

                    {/* Desktop Search Placeholder */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input 
                                type="text" 
                                placeholder="Search for services..." 
                                className="w-full bg-slate-100/50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-500/20 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                        </div>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-6">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-primary-600">Dashboard</Link>
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <button 
                                            onClick={() => setShowNotifs(!showNotifs)}
                                            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative"
                                        >
                                            <Bell className="w-5 h-5" />
                                            {unreadCount > 0 && (
                                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                            )}
                                        </button>

                                        {/* High-Fidelity Pulse Dropdown */}
                                        <AnimatePresence>
                                            {showNotifs && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute right-0 mt-3 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-50"
                                                >
                                                    <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Alert Registry</h3>
                                                        <span className="px-2 py-0.5 bg-primary-600 text-white rounded-full text-[8px] font-black">{unreadCount} NEW</span>
                                                    </div>
                                                    <div className="max-h-80 overflow-y-auto">
                                                        {notifications.length === 0 ? (
                                                            <div className="p-10 text-center space-y-3">
                                                                <Bell className="w-8 h-8 text-slate-200 mx-auto" />
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Registry Clear</p>
                                                            </div>
                                                        ) : (
                                                            notifications.slice(0, 5).map((notif, i) => (
                                                                <div 
                                                                    key={i} 
                                                                    className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group ${!notif.isRead ? 'bg-primary-50/20' : ''}`}
                                                                    onClick={() => {
                                                                        setShowNotifs(false);
                                                                        navigate('/dashboard');
                                                                    }}
                                                                >
                                                                    <div className="flex items-start space-x-3">
                                                                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary-600 group-hover:text-white transition-all">
                                                                            <Zap className="w-4 h-4" />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <h4 className="text-[11px] font-extrabold text-slate-900 leading-none">{notif.title}</h4>
                                                                            <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{notif.message}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                    <Link 
                                                        to="/dashboard" 
                                                        onClick={() => setShowNotifs(false)}
                                                        className="block p-4 text-center text-[9px] font-black text-primary-600 uppercase tracking-[0.2em] bg-slate-50/80 hover:bg-primary-600 hover:text-white transition-all"
                                                    >
                                                        Access Master Hub
                                                    </Link>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
                                        <div className="text-right">
                                            <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                                            <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
                                        </div>
                                        <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                                            <LogOut className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors">Login</Link>
                                <Link to="/register" className="btn-primary py-2 px-5 text-sm">Get Started</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600">
                            {isOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden glass border-t border-slate-100"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-4">
                            <div className="relative mt-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input type="text" placeholder="Search services..." className="input-field py-2 pl-10 h-10 text-sm" />
                            </div>
                            {user ? (
                                <>
                                    <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block py-2 text-slate-600 font-medium">Dashboard</Link>
                                    <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full text-left py-2 text-red-500 font-medium">Logout</button>
                                </>
                            ) : (
                                <div className="space-y-3 pt-2">
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="block text-center py-2 text-slate-600 font-semibold border border-slate-200 rounded-xl">Login</Link>
                                    <Link to="/register" onClick={() => setIsOpen(false)} className="btn-primary block text-center">Register</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
