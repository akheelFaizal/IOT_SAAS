import React from 'react';
import { Cpu, Power, Settings, Clock, Activity } from 'lucide-react';
import { useDevices } from '../../store/DeviceContext';

const Appliances = () => {
  const { devices, toggleDevice } = useDevices();

  // Simple hardcoded rate for the UI estimate
  const RATE_PER_KWH = 7.0; 

  return (
    <div className="w-full h-full text-slate-100 overflow-y-auto p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="pb-6 border-b border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-3">
              <Cpu className="text-blue-400" />
              Appliance Manager
            </h1>
            <p className="text-slate-400 mt-1">Control your devices and view individual consumption metrics</p>
          </div>
          <div className="flex gap-4 p-3 bg-slate-800/80 rounded-lg border border-slate-700">
             <div className="text-center px-4 border-r border-slate-700">
                <p className="text-xs text-slate-400">Total Devices</p>
                <p className="font-bold text-lg">{devices.length}</p>
             </div>
             <div className="text-center px-4">
                <p className="text-xs text-slate-400">Active Now</p>
                <p className="font-bold text-lg text-emerald-400">{devices.filter(d => d.state).length}</p>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => {
            const usageHours = device.usage_time_hours || 0;
            const dailyKwh = (device.power_rating_watts * usageHours) / 1000;
            const estMonthlyCost = dailyKwh * 30 * RATE_PER_KWH;

            return (
              <div key={device.device_id} className="bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700 shadow-lg overflow-hidden flex flex-col transition-all hover:border-slate-500">
                <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-white">{device.device_name}</h3>
                    <p className="text-xs text-slate-400 capitalize bg-slate-700 inline-block px-2 py-0.5 rounded mt-1">
                       Room: {device.room || 'General'}
                    </p>
                  </div>
                  
                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={device.state}
                      onChange={() => toggleDevice(device.device_id)} 
                    />
                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="p-5 flex-1 flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                         <Power size={14} /> <span className="text-xs font-medium uppercase tracking-wider">Power</span>
                      </div>
                      <p className="font-bold text-white">{device.power_rating_watts} <span className="text-xs text-slate-500 font-normal">W</span></p>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                         <Clock size={14} /> <span className="text-xs font-medium uppercase tracking-wider">Uptime</span>
                      </div>
                      <p className="font-bold text-white">{usageHours.toFixed(1)} <span className="text-xs text-slate-500 font-normal">hrs</span></p>
                    </div>
                  </div>

                  <div className="mt-auto border-t border-slate-700/50 pt-4">
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-slate-400">Est. Daily Usage</span>
                        <span className="text-sm font-mono text-white">{dailyKwh.toFixed(2)} kWh</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400">Est. Monthly Cost</span>
                        <span className="text-sm font-mono text-amber-400 font-bold">₹{estMonthlyCost.toFixed(2)}</span>
                     </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-800 border-t border-slate-700 flex justify-end gap-2">
                   <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors" title="View Weekly Summary">
                      <Activity size={18} />
                   </button>
                   <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors" title="Device Settings">
                      <Settings size={18} />
                   </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Appliances;
