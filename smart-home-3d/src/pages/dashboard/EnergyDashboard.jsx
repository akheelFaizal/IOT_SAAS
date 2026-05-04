import React, { useEffect, useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { Activity, Zap, CreditCard, TrendingUp, AlertTriangle, ArrowRight, Lightbulb } from 'lucide-react';
import SmartHomeScene from '../../components/SmartHomeScene';
import { useNavigate } from 'react-router-dom';
import DeviceTrendsChart from '../../components/Dashboard/DeviceTrendsChart';
import LiveLoadChart from '../../components/Dashboard/LiveLoadChart';
import { useDevices } from '../../store/DeviceContext';

const EnergyDashboard = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { devices } = useDevices();
  const [energyData, setEnergyData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [liveTelemetry, setLiveTelemetry] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!token) return;
        const summaryRes = await fetch('http://localhost:3000/energy-summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (summaryRes.ok) {
          setEnergyData(await summaryRes.json());
        }

        const historyRes = await fetch('http://localhost:3000/historical-trends', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (historyRes.ok) {
          setHistoricalData(await historyRes.json());
        }

        const liveRes = await fetch('http://localhost:3000/api/live-telemetry', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (liveRes.ok) {
          setLiveTelemetry(await liveRes.json());
        }
      } catch (err) {
        console.error("Error fetching energy dashboard data:", err);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const activeCount = devices.filter(d => d.state).length;

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-900 text-slate-100 p-4 md:p-6 font-sans">
      
      {/* High Usage Alert Banner */}
      {energyData?.alerts && energyData.alerts.length > 0 && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-4">
          <AlertTriangle className="text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-red-400 font-bold mb-1">High Usage Alert</h4>
            {energyData.alerts.map((alert, i) => (
              <p key={i} className="text-sm text-red-200">{alert}</p>
            ))}
          </div>
        </div>
      )}

      {/* Top Metrics Cards */}
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-5 border border-slate-700 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 opacity-80 text-emerald-400">
              <Zap size={20} />
              <h3 className="font-medium text-sm text-slate-300">Units Consumed Today</h3>
            </div>
          </div>
          <p className="text-3xl font-bold">{energyData?.daily_units || 0} <span className="text-lg font-normal text-slate-500">kWh</span></p>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-5 border border-slate-700 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 opacity-80 text-amber-400">
              <CreditCard size={20} />
              <h3 className="font-medium text-sm text-slate-300">Current Bill Estimate</h3>
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-400">₹{energyData?.estimated_bill || 0}</p>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-5 border border-slate-700 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 opacity-80 text-blue-400">
              <Activity size={20} />
              <h3 className="font-medium text-sm text-slate-300">AI Predicted Usage (1h)</h3>
            </div>
          </div>
          <p className="text-3xl font-bold">{energyData?.ai_insights?.predicted_consumption_kwh ? energyData.ai_insights.predicted_consumption_kwh.toFixed(2) : 0} <span className="text-lg font-normal text-slate-500">kWh</span></p>
        </div>

        <div className={`bg-slate-800/80 backdrop-blur-md rounded-xl p-5 border shadow-lg transition-colors duration-500 ${energyData?.ai_insights?.slab_risk_probability > 0.7 ? 'border-red-500/50 shadow-red-500/20 bg-red-500/5' : 'border-slate-700'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`flex items-center gap-2 opacity-80 ${energyData?.ai_insights?.slab_risk_probability > 0.7 ? 'text-red-400' : 'text-purple-400'}`}>
              <AlertTriangle size={20} />
              <h3 className="font-medium text-sm text-slate-300">AI Slab Risk</h3>
            </div>
            {energyData?.ai_insights?.slab_risk_probability > 0.7 && (
               <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
               </span>
            )}
          </div>
          <p className={`text-3xl font-bold ${energyData?.ai_insights?.slab_risk_probability > 0.7 ? 'text-red-400' : 'text-white'}`}>
            {energyData?.ai_insights ? Math.round(energyData.ai_insights.slab_risk_probability * 100) : 0}% 
            <span className="text-lg font-normal opacity-60"> Prob.</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive 3D Model Card */}
        <div className="lg:col-span-2 bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700 shadow-lg overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Activity className="text-blue-400" size={18} /> Digital Twin View
            </h3>
            <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">Live Sync</span>
          </div>
          <div className="flex-1 relative bg-slate-900 pointer-events-auto">
            {/* 3D Scene embedded in the dashboard */}
            <SmartHomeScene controls={true} autoRotate={false} />
          </div>
        </div>

        {/* Breakdown & Tips Panel */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-5 border border-slate-700 shadow-lg flex-1">
            <h3 className="font-bold text-white mb-4 border-b border-slate-700 pb-2">Appliance Breakdown</h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {devices.map(device => (
                <div key={device.device_id} className="flex justify-between items-center p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
                  <div>
                    <p className="font-medium text-sm text-white">{device.device_name}</p>
                    <p className="text-xs text-slate-400">{device.power_rating_watts}W | {device.usage_time_hours?.toFixed(1) || 0} hrs</p>
                  </div>
                  <div>
                     <span className={`px-2 py-1 text-xs rounded-full font-medium ${device.state ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'}`}>
                        {device.state ? 'ON' : 'OFF'}
                     </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/50 to-slate-800 rounded-xl p-5 border border-indigo-500/30 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Lightbulb size={64} />
            </div>
            <h3 className="font-bold text-indigo-300 mb-2 relative z-10">Smart Optimization</h3>
            <p className="text-sm text-slate-300 mb-4 relative z-10">
               Our AI has analyzed your recent usage and identified potential savings.
            </p>
            <button 
               onClick={() => navigate('/dashboard/recommendations')}
               className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors relative z-10 shadow-lg shadow-indigo-600/20"
            >
               View Tips <ArrowRight size={16} />
            </button>
          </div>
        </div>
        
        {/* Chart Card */}
        <div className="lg:col-span-3 bg-slate-800/80 backdrop-blur-md rounded-xl p-5 border border-slate-700 shadow-lg mt-2">
           <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                 <Activity className="text-indigo-400" size={20} />
                 <h3 className="font-bold text-white">Live Household Load (Last 30 Min)</h3>
              </div>
              <div className="flex items-center gap-2">
                 <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                 </span>
                 <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Live Stream</span>
              </div>
           </div>
           <div className="h-[300px]">
              <LiveLoadChart data={liveTelemetry} />
           </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyDashboard;
