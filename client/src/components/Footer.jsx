import React from 'react';
import { MapPin, Mail, Phone, Globe, MessageSquare, Camera, Share2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 px-4 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-1 space-y-6">
          <div className="flex items-center space-x-2">
            <div className="bg-primary-500 p-1.5 rounded-lg">
                <MapPin className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400">
                ServiceFinder
            </span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Revolutionizing the local service discovery and booking experience with trust, 
            quality, and convenience at your fingertips.
          </p>
          <div className="flex space-x-4">
            <Globe className="text-slate-400 hover:text-primary-400 w-5 h-5 cursor-pointer transition-colors" />
            <MessageSquare className="text-slate-400 hover:text-primary-400 w-5 h-5 cursor-pointer transition-colors" />
            <Camera className="text-slate-400 hover:text-primary-400 w-5 h-5 cursor-pointer transition-colors" />
            <Share2 className="text-slate-400 hover:text-primary-400 w-5 h-5 cursor-pointer transition-colors" />
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6">Popular Services</h4>
          <ul className="space-y-4 text-sm text-slate-400">
            <li className="hover:text-primary-400 transition-colors cursor-pointer">AC Maintenance</li>
            <li className="hover:text-primary-400 transition-colors cursor-pointer">Full Home Cleaning</li>
            <li className="hover:text-primary-400 transition-colors cursor-pointer">Kitchen Repair</li>
            <li className="hover:text-primary-400 transition-colors cursor-pointer">Pest Control</li>
            <li className="hover:text-primary-400 transition-colors cursor-pointer">Deep Sanitization</li>
          </ul>
        </div>

        <div>
           <h4 className="text-white font-semibold mb-6">Company</h4>
           <ul className="space-y-4 text-sm text-slate-400">
            <li className="hover:text-primary-400 transition-colors cursor-pointer">About Us</li>
            <li className="hover:text-primary-400 transition-colors cursor-pointer">Become a Partner</li>
            <li className="hover:text-primary-400 transition-colors cursor-pointer">Terms of Service</li>
            <li className="hover:text-primary-400 transition-colors cursor-pointer">Privacy Policy</li>
            <li className="hover:text-primary-400 transition-colors cursor-pointer">Support Help</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6">Contact Support</h4>
          <ul className="space-y-4 text-sm text-slate-400">
            <li className="flex items-center space-x-3 group cursor-pointer">
                <Mail className="group-hover:text-primary-400 w-4 h-4 transition-colors" />
                <span className="group-hover:text-primary-400 transition-colors">nikshithgurram2006@gmail.com</span>
            </li>
            <li className="flex items-center space-x-3 group cursor-pointer">
                <Phone className="group-hover:text-primary-400 w-4 h-4 transition-colors" />
                <span className="group-hover:text-primary-400 transition-colors">7569778915</span>
            </li>
            <li className="flex items-center space-x-3 group">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>amrita vishwa vidyapeetham, coimbatore</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500 uppercase tracking-widest">
        &copy; 2026 ServiceFinder Inc. All rights reserved. Built with excellence.
      </div>
    </footer>
  );
};

export default Footer;
