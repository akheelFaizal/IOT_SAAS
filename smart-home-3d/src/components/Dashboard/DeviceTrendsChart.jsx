import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DeviceTrendsChart = ({ data, hideCard = false }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 bg-slate-800/50 rounded-xl border border-slate-700/50">
        No historical data available.
      </div>
    );
  }

  // Group data by date
  const groupedData = data.reduce((acc, curr) => {
    const existing = acc.find(item => item.date === curr.date);
    if (existing) {
       existing[curr.device_id] = curr.total_energy_kwh;
    } else {
       const newEntry = { date: curr.date, [curr.device_id]: curr.total_energy_kwh };
       acc.push(newEntry);
    }
    return acc;
  }, []);

  // Format dates for display
  const formattedData = groupedData.map(d => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }));

  const colors = {
     ac: '#60a5fa', // blue-400
     fridge: '#34d399', // emerald-400
     tv: '#a78bfa', // violet-400
     fan: '#fbbf24', // amber-400
     lighting: '#f472b6' // pink-400
  };

  // Get unique device IDs from the data keys
  const deviceKeys = new Set();
  data.forEach(d => deviceKeys.add(d.device_id));

  const chartContent = (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="displayDate" 
            stroke="#94a3b8" 
            tick={{fill: '#94a3b8', fontSize: 12}} 
            tickMargin={10} 
          />
          <YAxis 
             stroke="#94a3b8" 
             tick={{fill: '#94a3b8', fontSize: 12}} 
             tickFormatter={(val) => `${val} kWh`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px', color: '#f8fafc' }}
            itemStyle={{ color: '#e2e8f0' }}
            formatter={(value) => [`${parseFloat(value).toFixed(2)} kWh`, 'Consumption']}
            wrapperStyle={{ zIndex: 1000 }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          {Array.from(deviceKeys).map(device => (
             <Line 
               key={device}
               type="monotone" 
               dataKey={device} 
               name={device.toUpperCase()} 
               stroke={colors[device.toLowerCase()] || '#cbd5e1'} 
               strokeWidth={2}
               dot={{ r: 3, strokeWidth: 1 }}
               activeDot={{ r: 6 }}
             />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  if (hideCard) {
    return chartContent;
  }

  return (
    <div className=" rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-blue-500 rounded-full inline-block"></span>
        30-Day Device Consumption Trends
      </h2>
      {chartContent}
    </div>
  );
};

export default DeviceTrendsChart;
