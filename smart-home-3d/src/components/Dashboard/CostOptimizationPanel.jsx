import React from 'react';
import { BrainCircuit, Zap, CheckCircle2, AlertOctagon, Info, Coins, Calculator } from 'lucide-react';

const CostOptimizationPanel = ({ energyData, mlData }) => {
  const getRiskColor = (risk) => {
    switch(risk?.toLowerCase()) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'low': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getSlabDetails = (units) => {
     if (units <= 250) return { range: '0-250 units', rate: '₹3.20/unit' };
     if (units <= 300) return { range: '251-300 units', rate: '₹5.80/unit - Non-telescopic begins' };
     if (units <= 350) return { range: '301-350 units', rate: '₹6.60/unit' };
     if (units <= 400) return { range: '351-400 units', rate: '₹6.90/unit' };
     if (units <= 500) return { range: '401-500 units', rate: '₹7.10/unit' };
     return { range: 'Above 500 units', rate: '₹7.90/unit' };
  };

  const currentSlab = getSlabDetails(energyData?.monthly_units || 0);
  const predictedSlab = getSlabDetails(mlData?.predicted_monthly_units || 0);

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Simulation / Tariff Panel */}
      <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-6 border border-slate-700 shadow-2xl flex-1">
         <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
           <Calculator size={18} className="text-emerald-400" />
           Tariff & Cost Optimization
         </h2>
         
         <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
               <div className="text-xs text-slate-400 mb-1 lg:truncate">Current Est. Bill</div>
               <div className="text-2xl font-bold text-white">₹{energyData?.estimated_bill?.toFixed(2) || '0.00'}</div>
               <div className="text-xs text-emerald-400 mt-1">{currentSlab.range}</div>
            </div>
            
            <div className="bg-indigo-900/20 rounded-lg p-3 border border-indigo-500/20">
               <div className="text-xs text-indigo-300 mb-1 lg:truncate">AI Projected Bill</div>
               <div className="text-2xl font-bold text-indigo-100">
                  {/* Rough projection using the actual tariff could be done, we just scale roughly for demo */}
                  ₹{((mlData?.predicted_monthly_units || 0) * 5.5).toFixed(2)}
               </div>
               <div className="text-xs text-indigo-400 mt-1">{predictedSlab.range}</div>
            </div>
         </div>

         <div className="bg-slate-700/30 rounded p-3 text-sm text-slate-300 border border-slate-600/50 flex gap-3">
             <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
             <p>Kerala KSEB pricing shifts significantly above 250 units (switching to Non-Telescopic). AI predictions help avoid this threshold.</p>
         </div>
      </div>

      {/* ML AI Insights Panel */}
      <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-6 border border-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.1)] flex-1 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
        
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
           <BrainCircuit size={18} className="text-indigo-400" />
           ML Predictions & Advice
        </h2>

        {mlData ? (
           <>
              <div className="flex items-center gap-4 mb-5">
                 <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 outline outline-1 outline-offset-2 ${getRiskColor(mlData.slab_risk)}`}>
                    {mlData.slab_risk === 'high' ? <AlertOctagon size={14} /> : <CheckCircle2 size={14} />}
                    <span className="text-sm font-semibold capitalize">{mlData.slab_risk} Slab Risk</span>
                 </div>
                 <div className="text-sm text-slate-400">
                    Confidence: <span className="text-slate-200">{(mlData.probability_of_crossing_200_units * 100).toFixed(0)}%</span>
                 </div>
              </div>

              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">AI Recommendations</h3>
              <ul className="space-y-2">
                {mlData.recommendations && mlData.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-indigo-200/90 bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20 flex items-start gap-3 leading-snug">
                    <Zap size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
                {(!mlData.recommendations || mlData.recommendations.length === 0) && (
                   <li className="text-sm text-slate-400">Loading optimization strategies...</li>
                )}
              </ul>
           </>
        ) : (
           <div className="text-slate-500 text-sm">Waiting for AI Model Data...</div>
        )}
      </div>
    </div>
  );
};

export default CostOptimizationPanel;
