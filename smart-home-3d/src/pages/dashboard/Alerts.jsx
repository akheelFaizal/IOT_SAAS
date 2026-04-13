import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, IndianRupee, Calculator, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';

const Alerts = () => {
  const { token } = useAuth();
  const [energySummary, setEnergySummary] = useState(null);
  const [calcUnits, setCalcUnits] = useState('');
  const [calcResult, setCalcResult] = useState(null);

  useEffect(() => {
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
            console.error("Failed to fetch energy summary for alerts");
        }
    };
    fetchSummary();
  }, [token]);

  // Kerala Slab Pricing logic for calculator
  const calculateBill = (e) => {
    e.preventDefault();
    const totalUnits = parseFloat(calcUnits);
    if(isNaN(totalUnits) || totalUnits < 0) {
      setCalcResult(0);
      return;
    }

    let bill = 0;
    let unitsLeft = totalUnits;
    if (unitsLeft > 0) {
      const slabUnits = Math.min(unitsLeft, 50);
      bill += slabUnits * 3;
      unitsLeft -= slabUnits;
    }
    if (unitsLeft > 0) {
      const slabUnits = Math.min(unitsLeft, 50);
      bill += slabUnits * 5;
      unitsLeft -= slabUnits;
    }
    if (unitsLeft > 0) {
      const slabUnits = Math.min(unitsLeft, 100);
      bill += slabUnits * 7;
      unitsLeft -= slabUnits;
    }
    if (unitsLeft > 0) {
      bill += unitsLeft * 10;
    }
    setCalcResult(bill);
  };

  return (
    <div className="w-full h-full text-slate-100 overflow-y-auto p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="pb-6 border-b border-slate-700/50">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-3">
            <Bell className="text-blue-400" />
            Alerts & Billing
          </h1>
          <p className="text-slate-400 mt-1">Notifications, usage thresholds, and billing predictions</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications Panel */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-6 border border-slate-700 shadow-lg flex flex-col h-full">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-700">
               <AlertTriangle className="text-amber-500" />
               <h2 className="text-xl font-bold text-white">System Notifications</h2>
            </div>
            
            <div className="flex-1 space-y-4">
              {energySummary?.alerts && energySummary.alerts.length > 0 ? (
                energySummary.alerts.map((alert, i) => (
                  <div key={i} className="bg-red-500/10 border left-border-4 border-red-500/30 border-l-red-500 p-4 rounded-r-lg">
                    <p className="text-sm font-medium text-red-300">{alert}</p>
                    <span className="text-xs text-red-400/60 mt-1 block">Live Alert</span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                   <CheckCircle2 size={48} className="text-emerald-500/50 mb-4" />
                   <h3 className="text-lg font-medium text-slate-300">All Clear!</h3>
                   <p className="text-sm text-slate-500">You currently have no active threshold alerts.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
             {/* Current Est Bill */}
             <div className="bg-gradient-to-r from-emerald-900/40 to-slate-800 rounded-xl p-6 border border-emerald-500/30 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="font-medium text-emerald-400 flex items-center gap-2">
                      <IndianRupee size={18} /> Estimated Monthly Bill
                   </h3>
                </div>
                <div className="flex items-end gap-3">
                   <span className="text-4xl font-bold text-white">₹{energySummary?.estimated_bill?.toFixed(2) || '0.00'}</span>
                   <span className="text-slate-400 mb-1">Based on {energySummary?.monthly_units?.toFixed(2) || '0'} units</span>
                </div>
             </div>

             {/* Tariff & Calculator Container */}
             <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-6 border border-slate-700 shadow-lg">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-700">
                   <Calculator className="text-blue-400" />
                   <h2 className="text-xl font-bold text-white">Tariff & Calculator</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {/* Tariff Slabs */}
                   <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Standard Tariff Slabs</h3>
                      <ul className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
                         <li className="relative flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-700">
                            <span className="text-emerald-400 font-mono text-sm">0 - 50 units</span>
                            <span className="text-white font-bold">₹3.00 <span className="text-slate-500 text-xs font-normal">/ unit</span></span>
                         </li>
                         <li className="relative flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-700">
                            <span className="text-blue-400 font-mono text-sm">51 - 100 units</span>
                            <span className="text-white font-bold">₹5.00 <span className="text-slate-500 text-xs font-normal">/ unit</span></span>
                         </li>
                         <li className="relative flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-700">
                            <span className="text-amber-400 font-mono text-sm">101 - 200 units</span>
                            <span className="text-white font-bold">₹7.00 <span className="text-slate-500 text-xs font-normal">/ unit</span></span>
                         </li>
                         <li className="relative flex items-center justify-between bg-slate-900/50 p-2 rounded border border-slate-700">
                            <span className="text-red-400 font-mono text-sm">200+ units</span>
                            <span className="text-white font-bold">₹10.00 <span className="text-slate-500 text-xs font-normal">/ unit</span></span>
                         </li>
                      </ul>
                   </div>

                   {/* Calculator */}
                   <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Estimator</h3>
                      <form onSubmit={calculateBill} className="space-y-4">
                         <div>
                            <label className="block text-xs text-slate-400 mb-1">Enter target units (kWh)</label>
                            <input 
                              type="number" 
                              min="0"
                              step="0.1"
                              value={calcUnits}
                              onChange={(e) => setCalcUnits(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                              placeholder="e.g. 150"
                            />
                         </div>
                         <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded p-2 text-sm font-bold transition-colors">
                            Calculate Bill
                         </button>
                      </form>

                      {calcResult !== null && (
                         <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg text-center animate-in fade-in zoom-in duration-200">
                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Estimated Cost</p>
                            <p className="text-2xl font-bold text-blue-400">₹{calcResult.toFixed(2)}</p>
                         </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
