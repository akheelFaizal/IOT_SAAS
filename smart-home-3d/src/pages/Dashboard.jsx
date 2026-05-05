import React, { useEffect, useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { BarChart2, TrendingUp, DollarSign, Calendar, Clock, AlertCircle } from 'lucide-react';
import DeviceTrendsChart from '../components/Dashboard/DeviceTrendsChart';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';

const Analytics = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState([]);
  const [peakHoursData, setPeakHoursData] = useState([]);
  const [energySummary, setEnergySummary] = useState(null);
  const targetBudget = energySummary?.target_budget || 2500;

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        if (!token) return;
        
        const summaryRes = await fetch('http://localhost:3000/energy-summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setEnergySummary(await summaryRes.json());

        const historyRes = await fetch('http://localhost:3000/historical-trends', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setHistoricalData(await historyRes.json());

        const peakRes = await fetch('http://localhost:3000/api/peak-analysis', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setPeakHoursData(await peakRes.json());
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [token]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-900 text-slate-100 p-4 md:p-8 font-sans overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <header className="pb-6 border-b border-slate-700/50">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-3">
            <BarChart2 className="text-indigo-400" />
            Detailed Analytics
          </h1>
          <p className="text-slate-400 mt-1">Deep dive into your energy consumption patterns and costs</p>
        </header>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-slate-700">
          {['daily', 'monthly', 'peak'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium text-sm transition-colors relative ${
                activeTab === tab ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} View
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-400 rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'monthly' && (
              <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-5 border border-slate-700 shadow-lg">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-indigo-400" /> 30-Day Usage Trend
                </h3>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={Object.values(historicalData.reduce((acc, curr) => {
                        const dateStr = typeof curr.date === 'string' ? curr.date.split('T')[0] : new Date(curr.date).toISOString().split('T')[0];
                        if (!acc[dateStr]) {
                          acc[dateStr] = { date: dateStr, total_energy_kwh: 0 };
                        }
                        acc[dateStr].total_energy_kwh += parseFloat(curr.total_energy_kwh);
                        return acc;
                      }, {}))} 
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                        itemStyle={{ color: '#e2e8f0' }}
                        formatter={(value) => [`${parseFloat(value).toFixed(2)} kWh`, 'Usage']}
                      />
                      <Bar dataKey="total_energy_kwh" fill="#6366f1" radius={[4, 4, 0, 0]} name="Energy (kWh)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === 'daily' && (
              <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-5 border border-slate-700 shadow-lg">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-400" /> Device Timeline (Last 24h)
                </h3>
                <div className="h-auto">
                  <DeviceTrendsChart data={historicalData} />
                </div>
              </div>
            )}

            {activeTab === 'peak' && (
              <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-5 border border-slate-700 shadow-lg">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-amber-400" /> Peak Hours Analysis
                </h3>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={peakHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                        itemStyle={{ color: '#e2e8f0' }}
                        formatter={(value) => [`${parseFloat(value).toFixed(2)}%`, 'Load']}
                      />
                      <Line type="monotone" dataKey="load" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} name="Avg Load (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-5 border border-slate-700 shadow-lg">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <DollarSign size={18} className="text-emerald-400" /> Cost Analysis
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                  <span className="text-slate-400 text-sm">Estimated Bill</span>
                  <span className="text-xl font-bold text-white">₹{(energySummary?.estimated_bill || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                  <span className="text-slate-400 text-sm">Target Budget</span>
                  <span className="text-slate-200">₹{targetBudget.toFixed(2)}</span>
                </div>
                
                <div className="w-full bg-slate-700 rounded-full h-2.5 mt-2">
                  <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${Math.min(((energySummary?.estimated_bill || 0) / targetBudget) * 100, 100)}%` }}></div>
                </div>
                <p className="text-xs text-right text-slate-400">{(((energySummary?.estimated_bill || 0) / targetBudget) * 100).toFixed(1)}% of budget</p>
              </div>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-5 border border-slate-700 shadow-lg">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <AlertCircle size={18} className="text-blue-400" /> System Alerts
              </h3>
              <div className="space-y-3">
                {energySummary?.alerts && energySummary.alerts.length > 0 ? (
                  energySummary.alerts.map((alert, i) => (
                    <div key={i} className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
                      {alert}
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm text-emerald-300 text-center">
                    No active alerts. Optimal performance.
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-indigo-900/40 rounded-xl p-5 border border-indigo-500/30 shadow-lg text-sm">
                <strong className="text-indigo-400 block mb-2">Energy-saving Tip:</strong>
                <p className="text-indigo-200/80">Lowering your AC thermostat by 1°C can reduce energy consumption by roughly 6%. Consistent monitoring during peak hours (18:00 - 22:00) yields optimal savings.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
