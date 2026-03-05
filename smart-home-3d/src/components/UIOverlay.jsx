import React from 'react';
import { useDevices } from '../store/DeviceContext';
import { Lightbulb, Info, Power } from 'lucide-react';

const UIOverlay = () => {
  const { devices } = useDevices();
  const activeCount = devices.filter((d) => d.state).length;

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 z-10 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-4 border border-slate-700 shadow-2xl max-w-sm pointer-events-auto">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2">
            Smart Home 3D
          </h1>
          <p className="text-sm text-slate-300 mb-4">
            Navigate the house using <kbd className="bg-slate-700 px-1 rounded mx-1 text-xs">OrbitControls</kbd> (drag to rotate, scroll to zoom).
          </p>
          <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 p-2 rounded-lg border border-emerald-400/20">
            <Power size={16} />
            <span>{activeCount} devices active</span>
          </div>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-4 border border-slate-700 shadow-2xl pointer-events-auto max-w-xs">
          <div className="flex items-center gap-2 mb-3">
            <Info size={18} className="text-blue-400" />
            <span className="font-semibold">Rooms</span>
          </div>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• Living Room (Front Left)</li>
            <li>• Kitchen (Front Right)</li>
            <li>• Bedroom (Back Left)</li>
            <li>• Bathroom (Back Right)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
