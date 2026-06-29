import React from 'react';
import { ShieldCheck, Server, AlertCircle } from 'lucide-react';

const Header = ({ title, serverConnected }) => {
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight capitalize">{title.replace('-', ' ')}</h2>
      </div>

      {/* Connectivity & User */}
      <div className="flex items-center space-x-6">
        {/* Connection Status Indicator */}
        <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium">
          {serverConnected ? (
            <>
              <Server className="w-4 h-4 text-emerald-500" />
              <span className="text-slate-600">Server connected</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span className="text-slate-600">Connecting to server...</span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            </>
          )}
        </div>

        {/* User Card */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800">LD Administrator</p>
            <p className="text-xs text-slate-500 flex items-center justify-end">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-brand-700" /> System Admin
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-800 text-brand-gold-200 flex items-center justify-center font-bold border border-brand-700 shadow-md">
            LA
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
