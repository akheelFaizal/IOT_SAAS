import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LiveLoadChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 bg-slate-900/20 rounded-xl border border-slate-700/30">
        Waiting for live telemetry stream...
      </div>
    );
  }

  const formattedData = data.map(d => ({
    time: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    power: parseFloat(d.total_power)
  }));

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#64748b" 
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${val}W`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
            itemStyle={{ color: '#818cf8' }}
          />
          <Area 
            type="monotone" 
            dataKey="power" 
            stroke="#818cf8" 
            fillOpacity={1} 
            fill="url(#colorPower)" 
            strokeWidth={3}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LiveLoadChart;
