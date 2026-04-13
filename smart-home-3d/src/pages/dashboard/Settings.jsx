import React, { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { Settings as SettingsIcon, User, Bell, Shield, LifeBuoy, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [toggles, setToggles] = useState({
    billAlerts: true,
    highUsage: true,
    faultAlerts: false,
    weeklyReport: true
  });

  const handleToggle = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="w-full h-full text-slate-100 overflow-y-auto p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="pb-6 border-b border-slate-700/50">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-3">
            <SettingsIcon className="text-blue-400" />
            Settings
          </h1>
          <p className="text-slate-400 mt-1">Manage your account and platform preferences</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Sidebar-ish navigation within settings */}
          <div className="md:col-span-1 space-y-2">
            <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-4 border border-slate-700 shadow-lg space-y-1">
               <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-indigo-600/20 text-indigo-400 font-medium">
                  <User size={18} /> Profile Info
               </button>
               <button className="w-full flex items-center gap-3 p-3 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition-colors">
                  <Bell size={18} /> Notifications
               </button>
               <button className="w-full flex items-center gap-3 p-3 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition-colors">
                  <Shield size={18} /> Security
               </button>
               <button className="w-full flex items-center gap-3 p-3 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition-colors border-t border-slate-700 mt-2 pt-4">
                  <LifeBuoy size={18} /> Support Overview
               </button>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            
            {/* Profile Section */}
            <div className="bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700 shadow-lg overflow-hidden">
               <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex items-center gap-2">
                  <User className="text-blue-400" size={20} />
                  <h2 className="font-bold text-white">Profile Information</h2>
               </div>
               <div className="p-6 space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                     <div className="h-16 w-16 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-2xl font-bold text-indigo-400">
                        {user?.name?.charAt(0) || 'U'}
                     </div>
                     <div>
                        <h3 className="text-xl font-bold text-white">{user?.name || 'User'}</h3>
                        <p className="text-slate-400">{user?.role || 'Administrator'}</p>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                        <input type="text" disabled value={user?.name || ''} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-300 opacity-70" />
                     </div>
                     <div>
                        <label className="block text-xs text-slate-400 mb-1">Email Address</label>
                        <input type="email" disabled value={user?.email || ''} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-300 opacity-70" />
                     </div>
                  </div>
                  <button className="mt-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded transition-colors">
                     Edit Profile
                  </button>
               </div>
            </div>

            {/* Notification Toggles */}
            <div className="bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700 shadow-lg overflow-hidden">
               <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex items-center gap-2">
                  <Bell className="text-emerald-400" size={20} />
                  <h2 className="font-bold text-white">Notification Preferences</h2>
               </div>
               <div className="p-0">
                  <div className="flex items-center justify-between p-4 border-b border-slate-700">
                     <div>
                        <h4 className="text-sm font-bold text-white">Bill Forecasting Alerts</h4>
                        <p className="text-xs text-slate-400">Receive alerts when projected to hit a higher tariff slab.</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={toggles.billAlerts} onChange={() => handleToggle('billAlerts')} />
                        <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                     </label>
                  </div>
                  <div className="flex items-center justify-between p-4 border-b border-slate-700">
                     <div>
                        <h4 className="text-sm font-bold text-white">High Usage Warnings</h4>
                        <p className="text-xs text-slate-400">Get notified if a heavy appliance is left on too long.</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={toggles.highUsage} onChange={() => handleToggle('highUsage')} />
                        <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                     </label>
                  </div>
                  <div className="flex items-center justify-between p-4 border-b border-slate-700">
                     <div>
                        <h4 className="text-sm font-bold text-white">Hardware Fault Alerts</h4>
                        <p className="text-xs text-slate-400">Identify anomalies in power consumption.</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={toggles.faultAlerts} onChange={() => handleToggle('faultAlerts')} />
                        <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                     </label>
                  </div>
               </div>
            </div>

            {/* Account Actions */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
               <h3 className="text-red-400 font-bold mb-2">Danger Zone</h3>
               <p className="text-sm text-red-300/70 mb-4">Logging out will clear your session. To delete your account, contact support.</p>
               <button onClick={handleLogout} className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded flex items-center gap-2 mx-auto transition-colors">
                  <LogOut size={16} /> Sign Out
               </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
