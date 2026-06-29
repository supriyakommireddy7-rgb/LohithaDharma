import React from 'react';
import { 
  LayoutDashboard, 
  Inbox, 
  Send, 
  Users, 
  Settings, 
  LogOut,
  Building2
} from 'lucide-react';

const Sidebar = ({ currentPage, setCurrentPage, handleLogout }) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'inbox', name: 'Inbox', icon: Inbox },
    { id: 'sent', name: 'Sent Emails', icon: Send },
    { id: 'leads', name: 'Lead Management', icon: Users },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-brand-950 text-slate-100 flex flex-col justify-between shadow-2xl h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-brand-900 flex items-center space-x-3">
          <div className="bg-brand-gold-700 p-2 rounded-xl text-brand-950 shadow-lg">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-wider text-slate-50">Lohitha Dharma</h1>
            <span className="text-xs text-brand-gold-300 font-medium tracking-widest uppercase">Real Estate AI</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-8 px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${
                  isActive
                    ? 'bg-brand-gold-700 text-brand-950 shadow-lg font-semibold transform translate-x-1'
                    : 'text-slate-300 hover:bg-brand-900 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="p-4 border-t border-brand-900">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-950/40 hover:text-red-300 transition-colors text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
