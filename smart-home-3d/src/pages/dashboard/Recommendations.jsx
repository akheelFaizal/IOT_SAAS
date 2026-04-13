import React, { useEffect, useState } from 'react';
import { Lightbulb, Info, CheckCircle, ZapOff, RefreshCcw, TrendingDown } from 'lucide-react';
import { useDevices } from '../../store/DeviceContext';
import { useAuth } from '../../store/AuthContext';

const Recommendations = () => {
  const { devices } = useDevices();
  const { token } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [energySummary, setEnergySummary] = useState(null);

  useEffect(() => {
    // Fetch energy summary to give context to recommendations
    const fetchSummary = async () => {
        try {
            if (!token) return;
            const res = await fetch('http://localhost:3000/energy-summary', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(res.ok) {
                setEnergySummary(await res.json());
            }
        } catch (e) {
            console.error("Failed to fetch energy summary for recommendations");
        }
    };
    fetchSummary();
  }, [token]);

  useEffect(() => {
    // Simulated Rule-Based AI Engine
    const generateRules = () => {
      let recs = [];
      const acDevice = devices.find(d => d.device_id.includes('ac'));
      const activeLights = devices.filter(d => d.device_id.includes('light') && d.state);
      
      // Rule 1: High consumption devices left on for long
      if (acDevice && acDevice.state) {
        if (acDevice.usage_time_hours > 3) {
          recs.push({
            id: 'rec_ac_duration',
            type: 'warning',
            title: 'High Usage: AC',
            description: `The ${acDevice.device_name} has been running for over ${Math.floor(acDevice.usage_time_hours)} hours. Consider using the fan instead or raising the thermostat slightly.`,
            savings: '₹12.50/day',
            icon: <ZapOff size={24} className="text-amber-500" />
          });
        }
      }

      // Rule 2: Multiple lights on
      if (activeLights.length > 2) {
        recs.push({
          id: 'rec_lights',
          type: 'optimization',
          title: 'Lighting Inefficiency',
          description: `You have ${activeLights.length} lights turned on right now. Consider using natural daylight if possible, or turning off lights in unoccupied rooms.`,
          savings: '₹2.00/day',
          icon: <Lightbulb size={24} className="text-yellow-400" />
        });
      }

      // Rule 3: Bill Forecast Optimization
      if (energySummary?.daily_units > 15) {
         recs.push({
            id: 'rec_bill',
            type: 'forecast',
            title: 'Bill Projection Alert',
            description: `Your daily usage is trending above 15 kWh. At this rate, your projected monthly bill will jump to a higher tariff slab. Reduce base load by 10% to stay in the lower slab.`,
            savings: '₹250.00/month',
            icon: <TrendingDown size={24} className="text-indigo-400" />
         });
      }

      // Rule 4: Generic Good practice
      recs.push({
          id: 'rec_generic',
          type: 'info',
          title: 'Smart Optimization',
          description: 'Scheduling your heavy appliances (like washing machines) during off-peak hours (10 PM - 6 AM) reduces grid strain and may lower costs on time-of-use tariffs.',
          savings: 'Variable',
          icon: <RefreshCcw size={24} className="text-blue-400" />
      });

      setRecommendations(recs);
    };

    if (devices.length > 0) {
      generateRules();
    }
  }, [devices, energySummary]);

  return (
    <div className="w-full h-full text-slate-100 overflow-y-auto p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="pb-6 border-b border-slate-700/50">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-3">
            <Lightbulb className="text-blue-400" />
            Smart Recommendations
          </h1>
          <p className="text-slate-400 mt-1">AI-driven actionable insights based on your current device state</p>
        </header>

        <div className="space-y-4">
          {recommendations.length > 0 ? (
             recommendations.map(rec => (
                <div key={rec.id} className="bg-slate-800/80 backdrop-blur-md rounded-xl p-5 border border-slate-700 shadow-lg flex flex-col md:flex-row gap-5 items-start transition-all hover:bg-slate-800">
                   <div className={`p-3 rounded-xl shrink-0 ${
                       rec.type === 'warning' ? 'bg-amber-500/10 border border-amber-500/20' : 
                       rec.type === 'forecast' ? 'bg-indigo-500/10 border border-indigo-500/20' :
                       'bg-blue-500/10 border border-blue-500/20'
                   }`}>
                      {rec.icon}
                   </div>
                   <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{rec.title}</h3>
                      <p className="text-sm text-slate-400 mb-3 leading-relaxed">{rec.description}</p>
                      <div className="flex items-center gap-2 text-xs font-semibold">
                         <CheckCircle size={14} className="text-emerald-400" /> 
                         <span className="text-emerald-400">Estimated Savings: {rec.savings}</span>
                      </div>
                   </div>
                   <button className="w-full md:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors border border-slate-600 mt-2 md:mt-0">
                      Apply Tip
                   </button>
                </div>
             ))
          ) : (
             <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-12 border border-slate-700 text-center">
                 <Info size={40} className="mx-auto text-slate-500 mb-4" />
                 <h2 className="text-xl font-bold text-slate-300">Your configuration is fully optimized</h2>
                 <p className="text-slate-500 mt-2">We couldn't find any major inefficiencies at this moment.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
