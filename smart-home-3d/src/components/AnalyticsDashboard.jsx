import React from 'react';
import { BrainCircuit, TrendingUp, AlertOctagon, CheckCircle2 } from 'lucide-react';

const AnalyticsDashboard = ({ data }) => {
  if (!data) return null;

  const getRiskColor = (risk) => {
    switch(risk?.toLowerCase()) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'low': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="bg-slate-800/90 backdrop-blur-xl rounded-xl p-5 border border-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.15)] flex flex-col gap-4 relative overflow-hidden pointer-events-auto">
      {/* Decorative gradient orb */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="flex items-center gap-2 mb-1 border-b border-white/5 pb-3">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <BrainCircuit size={20} className="text-indigo-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">AI Energy Analytics</h2>
          <p className="text-xs text-indigo-300/70">Machine Learning Predictions</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs font-medium tracking-wider uppercase">Predicted Units</span>
            <TrendingUp size={14} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-mono text-white">
            {data.predicted_monthly_units}<span className="text-sm text-slate-500 ml-1">kWh/mo</span>
          </div>
        </div>

        <div className={`p-3 rounded-xl border relative overflow-hidden transition-colors ${getRiskColor(data.slab_risk)}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium tracking-wider uppercase opacity-80">Slab Risk</span>
            {data.slab_risk === 'high' ? <AlertOctagon size={14} /> : <CheckCircle2 size={14} />}
          </div>
          <div className="text-2xl font-bold capitalize flex items-baseline gap-2">
            {data.slab_risk || 'Unknown'}
            {data.probability_of_crossing_200_units !== undefined && (
              <span className="text-xs font-medium opacity-70">
                ({Math.round(data.probability_of_crossing_200_units * 100)}%)
              </span>
            )}
          </div>
        </div>
      </div>

      {data.recommendations && data.recommendations.length > 0 && (
        <div className="mt-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-4 h-[1px] bg-slate-600"></span>
            Optimization Strategies
            <span className="flex-1 h-[1px] bg-slate-600"></span>
          </h3>
          <ul className="space-y-2">
            {data.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-slate-300 bg-white/5 p-2.5 rounded-lg border border-white/5 flex items-start gap-2.5">
                <span className="mt-0.5 text-indigo-400 shrink-0">✦</span>
                <span className="leading-snug">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
