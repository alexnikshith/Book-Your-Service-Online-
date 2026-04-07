import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, MessageSquare, ShieldCheck, X, Zap, Phone, Loader2, Trash2, Edit3, Image as ImageIcon, Camera, AlertTriangle, Bell, Clock, ShieldAlert } from 'lucide-react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const ChatWindow = ({ recipientId, recipientName, onClose }) => {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [editingMsg, setEditingMsg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [reminder, setReminder] = useState(null);
    const [violation, setViolation] = useState(null);
    const scrollRef = useRef();
    const fileRef = useRef();

    const currentUserId = user?._id?.toString();
    const targetId = recipientId?.toString();

    const formatImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        // Strip leading slash if any to prevent double-pulse //
        const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
        return `http://localhost:5000/${cleanUrl}`;
    };

    useEffect(() => {
        if (!currentUserId || !targetId) return;
        
        socket.emit('join_room', currentUserId);

        const fetchMessages = async () => {
            try {
                const { data } = await API.get(`/messages/chat/${targetId}`);
                setMessages(data);
                setLoading(false);
            } catch (err) {
                console.error('[CHAT-PULSE ERROR]: Correspondence fetch failed:', err);
                setLoading(false);
            }
        };

        fetchMessages();

        const handleReceiveMessage = (data) => {
            if (data.senderId?.toString() === targetId) {
                setMessages(prev => [...prev, {
                    _id: data.id || Date.now().toString(),
                    sender: data.senderId,
                    recipient: currentUserId,
                    content: data.content,
                    imageUrl: data.imageUrl,
                    createdAt: new Date().toISOString()
                }]);
            }
        };

        const handleReceiveUpdate = (data) => {
            setMessages(prev => prev.map(m => m._id?.toString() === data.messageId?.toString() ? { ...m, content: data.content, isEdited: true } : m));
        };

        const handleReceiveDelete = (data) => {
            setMessages(prev => prev.filter(m => m._id?.toString() !== data.messageId?.toString()));
        };

        const handleReminder = (data) => {
            setReminder(data);
            setTimeout(() => setReminder(null), 10000); 
        };

        socket.on('receive_message', handleReceiveMessage);
        socket.on('receive_update', handleReceiveUpdate);
        socket.on('receive_delete', handleReceiveDelete);
        socket.on('booking_reminder', handleReminder);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('receive_update', handleReceiveUpdate);
            socket.off('receive_delete', handleReceiveDelete);
            socket.off('booking_reminder', handleReminder);
        };
    }, [targetId, currentUserId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !editingMsg) return;

        setSending(true);
        try {
            if (editingMsg) {
                const { data } = await API.put(`/messages/${editingMsg._id}`, { content: newMessage });
                if (data.isFlagged) {
                    setViolation({ words: data.flaggedWords || [], messageId: data._id });
                }
                socket.emit('message_update', { messageId: editingMsg._id, recipientId: targetId, content: newMessage });
                setMessages(prev => prev.map(m => m._id?.toString() === editingMsg._id?.toString() ? data : m));
                setEditingMsg(null);
            } else {
                const { data } = await API.post('/messages', { recipientId: targetId, content: newMessage });
                if (data.isFlagged) {
                    setViolation({ words: data.flaggedWords || [], messageId: data._id });
                }
                socket.emit('send_message', { recipientId: targetId, senderId: currentUserId, content: newMessage });
                setMessages(prev => [...prev, data]);
            }
            setNewMessage('');
            setSending(false);
        } catch (err) {
            console.error('[CHAT-PULSE ERROR]: Transmission failed:', err);
            setSending(false);
        }
    };

    const handleDelete = async (msgId) => {
        try {
            await API.delete(`/messages/${msgId}`);
            socket.emit('message_delete', { messageId: msgId, recipientId: targetId });
            setMessages(prev => prev.filter(m => m._id?.toString() !== msgId?.toString()));
            if (violation?.messageId === msgId) setViolation(null);
        } catch (err) {
            console.error('[CHAT-PULSE ERROR]: Removal pulse failed:', err);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setSending(true);
        try {
            // API Response: /uploads/image-123.jpg
            const { data: imageUrl } = await API.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const { data: msgData } = await API.post('/messages', { recipientId: targetId, imageUrl });
            socket.emit('send_message', { recipientId: targetId, senderId: currentUserId, imageUrl });
            setMessages(prev => [...prev, msgData]);
            setSending(false);
        } catch (err) {
            console.error('[CHAT-PULSE ERROR]: Evidence upload failed:', err);
            setSending(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.8 }}
            className="fixed bottom-10 right-10 w-[480px] h-[700px] bg-white rounded-[4rem] shadow-2xl border border-slate-100 flex flex-col z-[1000] overflow-hidden"
        >
            <AnimatePresence>
                {violation && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl z-[1200] flex items-center justify-center p-10">
                        <div className="bg-white rounded-[3rem] p-10 text-center space-y-8 relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]"></div>
                             <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6"><ShieldAlert className="w-10 h-10" /></div>
                             <div className="space-y-3">
                                 <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Policy Breach Detected</h4>
                                 <p className="text-sm font-medium text-slate-500 leading-relaxed">Offensive data signature detected in: <span className="text-red-600 font-black">"{violation.words.join(', ')}"</span></p>
                             </div>
                             <div className="flex flex-col space-y-3">
                                 <button onClick={() => handleDelete(violation.messageId)} className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-slate-800 transition-all flex items-center justify-center space-x-3"><Trash2 className="w-4 h-4" /><span>Delete signal Now</span></button>
                                 <button onClick={() => setViolation(null)} className="w-full py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-slate-600 transition-all">Acknowledge & Close</button>
                             </div>
                        </div>
                    </motion.div>
                )}
                {reminder && (
                    <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="absolute top-24 left-6 right-6 p-6 bg-slate-900 border border-primary-500 rounded-[2rem] shadow-2xl z-[1100] flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center animate-pulse"><Clock className="w-6 h-6 text-white" /></div>
                        <div className="flex-1"><h6 className="text-[10px] font-black uppercase text-primary-400 tracking-widest">Incoming Service Pulse</h6><p className="text-white font-bold text-xs leading-relaxed">{reminder.message}</p></div>
                        <button onClick={() => setReminder(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X className="w-4 h-4 text-white/50" /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="p-8 bg-slate-900 text-white flex items-center justify-between relative shadow-lg">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600"></div>
                <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-primary-400 font-black text-xl ring-2 ring-white/5">{recipientName?.[0] || 'U'}</div>
                    <div>
                        <h4 className="text-xl font-black tracking-tight">{recipientName}</h4>
                        <div className="flex items-center space-x-2 text-[10px] font-black uppercase text-primary-400 tracking-widest"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span><span>Secure Pulse tunnel Open</span></div>
                    </div>
                </div>
                <button onClick={onClose} className="p-3 bg-white/10 hover:bg-red-500 rounded-xl transition-all h-10 w-10 flex items-center justify-center"><X className="w-5 h-5 font-black" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/50 scrollbar-hide">
                {loading ? (
                    <div className="h-full flex items-center justify-center flex-col opacity-30"><Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-2" /><span className="text-[9px] font-black uppercase tracking-[0.2em]">Establishing Tunnel Hub...</span></div>
                ) : messages.map((msg, i) => (
                    <div key={msg._id || i} className={`flex ${msg.sender?.toString() === currentUserId ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] group animate-fade-in ${msg.sender?.toString() === currentUserId ? 'flex flex-row-reverse' : 'flex flex-row'}`}>
                            <div className={`p-6 rounded-[2.5rem] shadow-sm relative transition-all ${
                                msg.sender?.toString() === currentUserId ? 'bg-primary-600 text-white rounded-br-lg shadow-xl shadow-primary-500/10' : 'bg-white text-slate-800 rounded-bl-lg border border-slate-100 shadow-xl shadow-slate-200/20'
                            }`}>
                                {msg.imageUrl && (
                                    <div className="mb-4 rounded-2xl overflow-hidden border-2 border-slate-200/50 bg-slate-100 group">
                                        <img src={formatImageUrl(msg.imageUrl)} alt="Audit Evidence" className="w-full h-auto max-h-80 object-cover group-hover:scale-105 transition-transform duration-700" />
                                    </div>
                                )}
                                {msg.content && <p className="text-sm font-bold leading-relaxed">{msg.content}</p>}
                                <div className="flex items-center justify-between mt-3 space-x-6 min-w-[120px]">
                                     <span className="text-[9px] font-black uppercase opacity-40 flex items-center"><Clock className="w-2.5 h-2.5 mr-1" />{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {msg.isEdited && <span className="ml-2 font-black">EDITED</span>}</span>
                                     {msg.sender?.toString() === currentUserId && (
                                         <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                                             <button onClick={() => { setEditingMsg(msg); setNewMessage(msg.content); }} className="p-1.5 hover:bg-white/20 rounded-lg transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                                             <button onClick={() => handleDelete(msg._id)} className="p-1.5 hover:bg-red-500 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                         </div>
                                     )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-8 bg-white border-t border-slate-100 shadow-2xl">
                {editingMsg && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center justify-between px-6 py-3 bg-primary-50 rounded-2xl mb-5 border border-primary-100">
                        <div className="flex items-center space-x-3"><Edit3 className="w-4 h-4 text-primary-500" /><p className="text-[10px] font-black text-primary-600 uppercase tracking-widest leading-none">Revising System Sig...</p></div>
                        <button onClick={() => { setEditingMsg(null); setNewMessage(''); }}><X className="w-4 h-4 text-primary-400" /></button>
                    </motion.div>
                )}
                <div className="flex items-center space-x-4">
                    <input type="file" hidden ref={fileRef} onChange={handleImageUpload} accept="image/*" />
                    <button type="button" onClick={() => fileRef.current?.click()} className="h-16 w-16 bg-slate-50 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-2xl flex items-center justify-center border border-slate-100 active:scale-95 transition-all"><ImageIcon className="w-6 h-6" /></button>
                    <div className="flex-1 relative">
                        <input type="text" placeholder={sending ? "Transmitting..." : "Initiate Signal..."} className="w-full h-16 pl-8 pr-16 bg-slate-50 border border-slate-100 rounded-[2.2rem] text-sm font-bold focus:ring-8 focus:ring-primary-500/5 outline-none transition-all" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} disabled={sending} />
                        <Zap className="absolute right-6 top-5 w-6 h-6 text-slate-100" />
                    </div>
                    <button type="submit" disabled={sending || (!newMessage.trim())} className="h-16 w-16 bg-slate-900 hover:bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-2xl active:scale-95 disabled:opacity-50 transition-all">{sending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}</button>
                </div>
            </form>
        </motion.div>
    );
};

export default ChatWindow;
