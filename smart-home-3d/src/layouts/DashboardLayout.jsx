import { useAuth } from '../store/AuthContext.jsx';
import { 
  Home, 
  BarChart2, 
  Lightbulb, 
  Cpu, 
  Bell, 
  Settings,
  LogOut,
  User
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Energy Dashboard', path: '/dashboard/energy', icon: <Home size={20} /> },
    { name: 'Analytics', path: '/dashboard/analytics', icon: <BarChart2 size={20} /> },
    { name: 'Smart Recommendations', path: '/dashboard/recommendations', icon: <Lightbulb size={20} /> },
    { name: 'Appliances', path: '/dashboard/appliances', icon: <Cpu size={20} /> },
    { name: 'Alerts & Billing', path: '/dashboard/alerts', icon: <Bell size={20} /> },
    { name: 'Settings', path: '/dashboard/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 border-b border-slate-700">
             <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
               SmartSaaS
             </h1>
             <p className="text-xs text-slate-400 mt-1">Enterprise Home IoT</p>
          </div>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 font-medium border border-indigo-500/30'
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-700">
           <button 
             onClick={handleLogout}
             className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
           >
             <LogOut size={20} />
             <span>Logout</span>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-800/80 backdrop-blur-md border-b border-slate-700 flex items-center justify-between px-6 z-20">
          <div className="md:hidden">
             {/* Mobile Menu Placeholder - we keep it simple for now */}
             <span className="font-bold text-emerald-400">SmartSaaS</span>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
             <button className="text-slate-400 hover:text-white relative">
               <Bell size={20} />
               <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
             </button>
             <div className="h-8 w-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center cursor-pointer hover:border-slate-400 transition-colors">
               <User size={16} className="text-slate-300" />
             </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-hidden relative">
           <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
