import React, { useEffect, useState } from 'react';
import { useDevices } from '../store/DeviceContext';
import { Lightbulb, Info, Power, Zap, AlertTriangle } from 'lucide-react';
import AnalyticsDashboard from './AnalyticsDashboard';

const UIOverlay = () => {
  const { devices } = useDevices();
  const activeCount = devices.filter((d) => d.state).length;
  const [energySummary, setEnergySummary] = useState(null);

  useEffect(() => {
    const fetchEnergyData = async () => {
      try {
        const res = await fetch('http://localhost:3000/energy-summary');
        if (res.ok) {
          const data = await res.json();
          setEnergySummary(data);
        }
      } catch (err) {
        console.error("Could not fetch energy summary");
      }
    };

    // Check every 2 seconds
    const intv = setInterval(fetchEnergyData, 2000);
    fetchEnergyData();
    return () => clearInterval(intv);
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 z-10 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-4 border border-slate-700 shadow-2xl max-w-sm pointer-events-auto flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2">
              Smart Home 3D
            </h1>
            <p className="text-sm text-slate-300 mb-2">
              Navigate using <kbd className="bg-slate-700 px-1 rounded mx-1 text-xs">OrbitControls</kbd>
            </p>
            <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 p-2 rounded-lg border border-emerald-400/20">
              <Power size={16} />
              <span>{activeCount} devices active</span>
            </div>
          </div>

          {energySummary && (
            <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
               <div className="flex items-center gap-2 text-amber-400 mb-2 font-semibold">
                  <Zap size={16} />
                  <span>Energy Monitor (Simulated)</span>
               </div>
               <div className="grid grid-cols-2 gap-2 text-sm">
                 <div className="bg-slate-800 p-2 rounded">
                    <span className="text-slate-400 block text-xs">Monthly Units</span>
                    <span className="text-white font-mono">{energySummary.monthly_units.toFixed(2)} kWh</span>
                 </div>
                 <div className="bg-slate-800 p-2 rounded">
                    <span className="text-slate-400 block text-xs">Est. Bill</span>
                    <span className="text-emerald-400 font-mono font-bold">₹{energySummary.estimated_bill.toFixed(2)}</span>
                 </div>
               </div>
               {energySummary.alerts && energySummary.alerts.length > 0 && (
                 <div className="mt-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-2 rounded flex items-start gap-2">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <div>
                      {energySummary.alerts.map((a, i) => <div key={i}>{a}</div>)}
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>

         <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-4 border border-slate-700 shadow-2xl pointer-events-auto max-w-xs">
          <div className="flex items-center gap-2 mb-3">
            <Info size={18} className="text-blue-400" />
            <span className="font-semibold">Rooms</span>
          </div>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• Living Room (Front Left)</li>
            <li>• Kitchen (Front Right)</li>
            <li>• Bedroom (Back Left)</li>
            <li>• Bathroom (Back Right)</li>
          </ul>
        </div>
        
        {/* ML AI Analytics Rendering */}
        <div className="ml-auto pointer-events-auto max-w-sm">
           {energySummary && energySummary.ai_insights && (
             <AnalyticsDashboard data={energySummary.ai_insights} />
           )}
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
