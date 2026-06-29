import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RefreshCw, 
  ShieldCheck, 
  Building2,
  ListFilter
} from 'lucide-react';
import axios from 'axios';

const Settings = ({ showToast }) => {
  const [config, setConfig] = useState({
    geminiActive: false,
    openaiActive: false,
    smtpActive: false,
    mongodbActive: false
  });
  const [loading, setLoading] = useState(true);

  const fetchConfigStatus = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/config-status');
      if (response.data.success) {
        setConfig(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching config status:', error);
      showToast('Failed to check configurations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigStatus();
  }, []);

  const StatusRow = ({ name, active, description, optional }) => (
    <div className="flex items-start justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100/50 transition-colors">
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-800 text-sm">{name}</span>
          {optional && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              Optional
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 leading-relaxed max-w-md">{description}</p>
      </div>

      <div className="flex items-center space-x-2 mt-0.5">
        {active ? (
          <span className="flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Active</span>
          </span>
        ) : (
          <span className="flex items-center space-x-1.5 text-xs text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full font-bold">
            <XCircle className="w-4 h-4 text-slate-400" />
            <span>{optional ? 'Inactive' : 'Not Connected'}</span>
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-slide-in">
      
      {/* Configuration Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-slate-800">
            <SettingsIcon className="w-5 h-5 text-brand-gold-600 animate-spin-slow" />
            <h3 className="font-bold text-sm">System Backend Configurations</h3>
          </div>
          
          <button 
            onClick={fetchConfigStatus}
            disabled={loading}
            className="flex items-center space-x-1.5 text-xs text-brand-700 hover:text-brand-800 font-bold border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Test Connection Status</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          These credentials must be set in your backend's <code>.env</code> file. The system checks them dynamically on start-up.
        </p>

        <div className="space-y-4">
          <StatusRow 
            name="MongoDB Database Connection" 
            active={config.mongodbActive} 
            description="Stores customer messages, lead records, and interaction logs. Crucial for CRM functionality."
          />

          <StatusRow 
            name="Gemini LLM API Service" 
            active={config.geminiActive} 
            optional
            description="Used to generate replies, translate languages (Telugu, Hindi), and extract customer preferences. (Recommended free-tier service)."
          />

          <StatusRow 
            name="OpenAI LLM API Service" 
            active={config.openaiActive} 
            optional
            description="Alternative AI generation service using GPT models. Used if Gemini API key is not configured."
          />

          <StatusRow 
            name="Gmail Nodemailer SMTP outbox" 
            active={config.smtpActive} 
            optional
            description="Sends automated email replies. Requires a Google App Password if using a @gmail.com account. (Falls back to simulation logging if inactive)."
          />
        </div>

        {(!config.geminiActive && !config.openaiActive) && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-amber-800">
            <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-xs">Running in AI Simulation Mode</h4>
              <p className="text-[11px] leading-relaxed text-amber-700">
                No active Gemini or OpenAI API keys were found in the <code>.env</code> file. The system will auto-reply using pre-configured static real estate message templates depending on language matches. Add a key to enable dynamic AI reply drafting.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Business Profile / Training Info */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center space-x-2 text-slate-800 pb-3 border-b border-slate-100">
          <Building2 className="w-5 h-5 text-brand-gold-600" />
          <h3 className="font-bold text-sm">Lohitha Dharma AI Knowledge Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed text-slate-600">
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 flex items-center space-x-1.5 uppercase tracking-wider text-[10px]">
              <ShieldCheck className="w-4 h-4 text-brand-700" />
              <span>Ass Assistant Constraints</span>
            </h4>
            <ul className="list-disc pl-5 space-y-2">
              <li>Always reply politely and thank customer for reaching out.</li>
              <li>Inform customers that a team representative will follow up soon.</li>
              <li>Never provide fake inventories or imaginary property rates.</li>
              <li>Reply in the same language: <strong>English</strong>, <strong>Telugu</strong>, or <strong>Hindi</strong>.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 flex items-center space-x-1.5 uppercase tracking-wider text-[10px]">
              <ListFilter className="w-4 h-4 text-brand-700" />
              <span>Leads Collection List</span>
            </h4>
            <p>The AI will capture or request details on the following:</p>
            <div className="grid grid-cols-2 gap-2 text-slate-700 font-semibold font-mono text-[10px]">
              <span className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg">✓ Full Name</span>
              <span className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg">✓ Phone Number</span>
              <span className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg">✓ Preferred Location</span>
              <span className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg">✓ Budget</span>
              <span className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg">✓ Property Type</span>
              <span className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg">✓ Contact Time</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Settings;
