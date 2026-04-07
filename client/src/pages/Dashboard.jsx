import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import UserDashboard from '../components/dashboards/UserDashboard';
import ProviderDashboard from '../components/dashboards/ProviderDashboard';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    const renderDashboard = () => {
        switch (user.role) {
            case 'user': return <UserDashboard />;
            case 'provider': return <ProviderDashboard />;
            case 'admin': return <AdminDashboard />;
            default: return <div className="p-10 text-center font-bold text-slate-500">Access Denied: Role Not Recognized</div>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-1.5 h-6 bg-primary-600 rounded-full"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Security Clearance: {user.role}</span>
                    </div>
                </motion.div>
                
                {renderDashboard()}
            </div>
        </div>
    );
};

export default Dashboard;
