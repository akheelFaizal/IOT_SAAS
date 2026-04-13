import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Shield, 
  Zap, 
  ArrowRight, 
  Layout, 
  Cpu, 
  LineChart, 
  Users, 
  BookOpen, 
  FlaskConical,
  Home as HomeIcon
} from 'lucide-react';
import SmartHomeScene from '../components/SmartHomeScene.jsx';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Absolute Navbar */}
      <header className="absolute top-0 left-0 w-full z-20 px-6 py-6 border-b border-white/5 bg-slate-900/40 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            SmartSaaS
          </div>
          <div className="space-x-4">
            <button 
              onClick={() => navigate('/login')} 
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/signup')} 
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full transition-all shadow-lg shadow-indigo-500/20 text-sm font-medium"
            >
              Sign up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with 3D Background */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden border-b border-white/5">
        {/* 3D Scene Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-900 z-10 pointer-events-none" />
          <SmartHomeScene controls={false} autoRotate={true} />
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Zap size={14} /> Next-Gen Energy Control
          </div>
          <h1 className="text-5xl md:text-8xl font-extrabold mb-8 tracking-tighter leading-tight">
            Intelligent Energy<br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Management
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Take control of your home's energy consumption with AI-driven insights, real-time 3D monitoring, and intelligent recommendations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/signup')} 
              className="flex items-center gap-2 px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-full text-lg transition-all hover:scale-105 shadow-xl shadow-emerald-500/20"
            >
              Get Started <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => document.getElementById('abstract').scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-full text-lg border border-slate-700 transition-all hover:border-slate-500"
            >
              View Platform Abstract
            </button>
          </div>
        </div>
      </section>

      {/* Abstract Section */}
      <section id="abstract" className="py-24 bg-slate-900/50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-128 h-128 bg-emerald-500/5 blur-[150px] rounded-full -ml-64 -mb-64" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Platform Overview</h2>
            <div className="h-1.5 w-24 bg-indigo-500 mx-auto rounded-full mb-8" />
            <p className="text-xl text-slate-400 font-light italic">
              “Built as a smart IoT simulation platform to bridge the gap between complex energy data and actionable user insights.”
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/30 transition-colors group">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <Layout size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Real-time Monitoring</h3>
              <p className="text-slate-400 leading-relaxed">
                Experience your home through a high-fidelity 3D digital twin. Visualize exact appliance states and consumption spikes as they happen.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-800/40 border border-slate-700/50 hover:border-emerald-500/30 transition-colors group">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <Activity size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4">AI-based Insights</h3>
              <p className="text-slate-400 leading-relaxed">
                Our FastAPI machine learning models analyze usage patterns to predict monthly bills and identify inefficiencies before they cost you.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-800/40 border border-slate-700/50 hover:border-amber-500/30 transition-colors group">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-all">
                <Cpu size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Appliance Tracking</h3>
              <p className="text-slate-400 leading-relaxed">
                Granular tracking for every smart device in your ecosystem. Compare power ratings versus actual performance in real-world scenarios.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Users className="text-blue-400" /> Target Users
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                    <HomeIcon size={22} />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-1">Modern Homes</h4>
                    <p className="text-slate-400">Homeowners looking to integrate and visualize their IoT ecosystem with professional analytics.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-1">Students & Academics</h4>
                    <p className="text-slate-400">A learning tool for understanding smart home architecture and energy consumption dynamics.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                    <FlaskConical size={22} />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-1">Energy Researchers</h4>
                    <p className="text-slate-400">Advanced simulation platform for testing energy-saving strategies and ML model accuracy.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/40 p-10 rounded-3xl border border-slate-700/50">
               <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                    <LineChart size={24} />
                  </div>
                  <span className="text-emerald-400 font-bold tracking-widest text-sm uppercase">Simulated Accuracy</span>
               </div>
               <h4 className="text-4xl font-bold mb-4 leading-tight">Optimized for Research and Daily Life.</h4>
               <p className="text-slate-400 mb-8 leading-relaxed">
                 Whether you're developing new smart home protocols or just trying to save on your next energy bill, our platform provides the tools you need for success.
               </p>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
                     <span className="block text-2xl font-bold text-white tracking-tight">98%</span>
                     <span className="text-xs text-slate-400 uppercase">Model Accuracy</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
                     <span className="block text-2xl font-bold text-white tracking-tight">Real-time</span>
                     <span className="text-xs text-slate-400 uppercase">State Sync</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-slate-500 text-sm">
        <p>© 2026 SmartSaaS IoT Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
