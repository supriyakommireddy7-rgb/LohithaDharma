import React, { useState } from 'react';
import { Building2, Mail, Lock, LogIn } from 'lucide-react';

const Login = ({ handleLogin, error }) => {
  const [email, setEmail] = useState('admin@lohithadharma.com');
  const [password, setPassword] = useState('admin123');

  const onSubmit = (e) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs for premium decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand-900 rounded-full blur-[120px] opacity-35"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-gold-950 rounded-full blur-[120px] opacity-25"></div>

      <div className="w-full max-w-md glass-dark rounded-3xl shadow-2xl p-8 relative z-10 border border-slate-700/30">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-gold-700 rounded-2xl flex items-center justify-center text-brand-950 mx-auto mb-4 shadow-xl border border-brand-gold-600">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Lohitha Dharma</h2>
          <p className="text-sm text-brand-gold-300 font-medium tracking-widest uppercase mt-1">Real Estate Agent Dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Email field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lohithadharma.com"
                className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-slate-700/60 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold-500 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-slate-700/60 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-brand-gold-500 transition-colors text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-gold-700 hover:bg-brand-gold-600 text-brand-950 font-bold py-3.5 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 text-sm shadow-lg hover:shadow-brand-gold-700/20 transform hover:-translate-y-0.5"
          >
            <span>Log In to Dashboard</span>
            <LogIn className="w-4 h-4 stroke-[2.5px]" />
          </button>
        </form>


      </div>
    </div>
  );
};

export default Login;
