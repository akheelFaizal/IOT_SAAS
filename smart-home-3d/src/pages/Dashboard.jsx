import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DeviceTrendsChart from '../components/Dashboard/DeviceTrendsChart';
import CostOptimizationPanel from '../components/Dashboard/CostOptimizationPanel';
import { Activity, Power, TrendingUp, Zap } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [energyData, setEnergyData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch current energy summary (includes AI ML predictions)
      const summaryRes = await fetch('http://localhost:3000/energy-summary');
      const summaryData = await summaryRes.json();
      setEnergyData(summaryData);

      // Fetch 30-day historical trends
      const historyRes = await fetch('http://localhost:3000/historical-trends');
      const historyData = await historyRes.json();
      setHistoricalData(historyData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 overflow-y-auto p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-700/50 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-3">
              <Activity className="text-blue-400" />
              Smart Home Analytics
            </h1>
            <p className="text-slate-400 mt-1">Real-time insights and ML-driven energy optimization</p>
          </div>
          <button 
             onClick={() => navigate('/')}
             className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            ← Back to 3D View
          </button>
        </header>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-5 border border-slate-700 shadow-lg">
              <div className="flex items-center gap-3 mb-2 opacity-80 text-blue-400">
                <Power size={20} />
                <h3 className="font-medium text-sm">Active Devices</h3>
              </div>
              <p className="text-3xl font-bold">{energyData?.active_devices?.length || 0}</p>
           </div>

           <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-5 border border-slate-700 shadow-lg">
              <div className="flex items-center gap-3 mb-2 opacity-80 text-amber-400">
                <Zap size={20} />
                <h3 className="font-medium text-sm">Est. Daily Units</h3>
              </div>
              <p className="text-3xl font-bold">{energyData?.daily_units || 0} <span className="text-base font-normal text-slate-400">kWh</span></p>
           </div>

           <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-5 border border-slate-700 shadow-lg">
              <div className="flex items-center gap-3 mb-2 opacity-80 text-emerald-400">
                <TrendingUp size={20} />
                <h3 className="font-medium text-sm">Monthly Units</h3>
              </div>
              <p className="text-3xl font-bold text-white">{energyData?.monthly_units || 0} <span className="text-base font-normal text-slate-400">kWh</span></p>
           </div>
           
           <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-5 border border-slate-700 shadow-lg">
              <div className="flex items-center gap-3 mb-2 opacity-80 text-indigo-400">
                <Zap size={20} />
                <h3 className="font-medium text-sm">AI Daily Forecast</h3>
              </div>
              <p className="text-3xl font-bold text-white">{energyData?.ai_insights?.predicted_daily_units || 0} <span className="text-base font-normal text-slate-400">kWh</span></p>
           </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Chart spanning 2 columns */}
           <div className="lg:col-span-2">
             <DeviceTrendsChart data={historicalData} />
           </div>

           {/* Insights spanning 1 column */}
           <div className="lg:col-span-1">
             <CostOptimizationPanel energyData={energyData} mlData={energyData?.ai_insights} />
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
