import React, { useEffect, useState } from 'react';
import { Lightbulb, Info, CheckCircle, ZapOff, RefreshCcw, TrendingDown } from 'lucide-react';
import { useDevices } from '../../store/DeviceContext';
import { useAuth } from '../../store/AuthContext';

const Recommendations = () => {
  const { devices, toggleDevice } = useDevices();
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

  const handleApplyTip = (rec) => {
    const text = rec.description.toLowerCase();
    
    if (text.includes('ac') || text.includes('hvac')) {
      const ac = devices.find(d => d.device_id.includes('ac'));
      if (ac && ac.state) {
        toggleDevice(ac.device_id);
        alert('Automation Triggered: AC has been turned off to save energy.');
      } else {
        alert('AC is already off.');
      }
    } else if (text.includes('unoccupied')) {
      let turnedOffCount = 0;
      devices.forEach(d => {
         if (d.state && !d.device_id.includes('fridge')) {
            toggleDevice(d.device_id);
            turnedOffCount++;
         }
      });
      alert(`Automation Triggered: Turned off ${turnedOffCount} devices as the home appears unoccupied.`);
    } else if (text.includes('kitchen')) {
      let turnedOffCount = 0;
      devices.forEach(d => {
         if (d.state && d.device_id.includes('kitchen') && !d.device_id.includes('fridge')) {
            toggleDevice(d.device_id);
            turnedOffCount++;
         }
      });
      if (turnedOffCount > 0) {
        alert(`Automation Triggered: Turned off ${turnedOffCount} kitchen devices.`);
      } else {
        alert('All non-essential kitchen devices are already off.');
      }
    } else {
      alert('Tip acknowledged! No direct automation available for this specific recommendation. Please adjust manually.');
    }
  };

  useEffect(() => {
    // Merge ML AI Insights with base rules
    const generateRules = () => {
      let recs = [];
      const acDevice = devices.find(d => d.device_id.includes('ac'));
      
      // 1. Add ML Recommendations First
      if (energySummary?.ai_insights?.recommendations) {
         energySummary.ai_insights.recommendations.forEach((text, i) => {
             recs.push({
                 id: `ml_rec_${i}`,
                 type: text.includes('High alert') ? 'forecast' : text.includes('Observation') ? 'optimization' : 'warning',
                 title: text.includes('alert') ? 'AI Slab Risk Prediction' : 'AI Behavioral Insight',
                 description: text,
                 savings: 'AI Computed',
                 icon: <RefreshCcw size={24} className="text-purple-400" />
             });
         });
      }

      // 2. Add SHAP Explainability if available
      if (energySummary?.ai_insights?.explanations) {
          // Sort to find the highest impacting feature
          const topDriver = Object.entries(energySummary.ai_insights.explanations)
              .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
              
          if (topDriver && Math.abs(topDriver[1]) > 0.05) {
              recs.push({
                 id: 'ml_shap',
                 type: 'info',
                 title: 'AI Transparency Layer (SHAP)',
                 description: `Our model indicates that '${topDriver[0]}' is having the largest impact on your current usage predictions.`,
                 savings: 'Analytics',
                 icon: <Info size={24} className="text-blue-400" />
              });
          }
      }

      // 3. Fallback to basic rule if AI is silent
      if (recs.length === 0 && acDevice && acDevice.state && acDevice.usage_time_hours > 3) {
          recs.push({
            id: 'rec_ac_duration',
            type: 'warning',
            title: 'High Usage: AC',
            description: `The ${acDevice.device_name} has been running for over ${Math.floor(acDevice.usage_time_hours)} hours. Consider using the fan instead.`,
            savings: '₹12.50/day',
            icon: <ZapOff size={24} className="text-amber-500" />
          });
      }

      setRecommendations(recs);
    };

    if (devices.length > 0 || energySummary?.ai_insights) {
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
                   <button 
                     onClick={() => handleApplyTip(rec)}
                     className="w-full md:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors border border-slate-600 mt-2 md:mt-0"
                   >
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
