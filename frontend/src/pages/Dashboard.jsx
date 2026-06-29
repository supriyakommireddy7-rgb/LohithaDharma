import React, { useState } from 'react';
import { 
  Inbox, 
  Users, 
  Cpu, 
  Globe, 
  Sparkles, 
  Send,
  Loader2,
  Building
} from 'lucide-react';
import axios from 'axios';

const Dashboard = ({ emails, refreshEmails, showToast, onViewEmail }) => {
  // Inbound simulation form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingInbox, setCheckingInbox] = useState(false);
  const [monitorStatus, setMonitorStatus] = useState({
    isRunning: false,
    lastChecked: null,
    totalAutomaticRepliesSent: 0,
    failedReplies: 0
  });
  const [togglingMonitor, setTogglingMonitor] = useState(false);

  React.useEffect(() => {
    fetchMonitorStatus();
    const interval = setInterval(fetchMonitorStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchMonitorStatus = async () => {
    try {
      const response = await axios.get('/api/monitor/status');
      if (response.data.success) {
        setMonitorStatus(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch monitor status');
    }
  };

  const handleToggleMonitor = async () => {
    setTogglingMonitor(true);
    try {
      const action = monitorStatus.isRunning ? 'stop' : 'start';
      const response = await axios.post('/api/monitor/toggle', { action });
      if (response.data.success) {
        setMonitorStatus(response.data.data);
        showToast(`Auto Monitor is now ${action === 'start' ? 'ON' : 'OFF'}`, 'success');
      }
    } catch (error) {
      showToast('Failed to toggle auto monitor.', 'error');
    } finally {
      setTogglingMonitor(false);
    }
  };

  // Statistics calculation
  const totalEmails = emails.length;
  // Let's filter unique lead contacts by email
  const uniqueEmails = [...new Set(emails.map(e => e.email))];
  const totalLeads = uniqueEmails.length;
  
  // Auto-replied emails (that have an AI Reply)
  const autoReplies = emails.filter(e => e.aiReply && e.aiReply.length > 0).length;
  const autoReplyRate = totalEmails > 0 ? Math.round((autoReplies / totalEmails) * 100) : 0;

  // Language Breakdown count
  const languagesCount = emails.reduce((acc, curr) => {
    const lang = curr.language || 'English';
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, { English: 0, Telugu: 0, Hindi: 0 });

  const handleSimulateInbound = async (e) => {
    e.preventDefault();
    if (!email || !message) {
      showToast('Please provide a valid sender email and message body.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/receive-email', {
        name: name || undefined,
        email,
        phone: phone || undefined,
        subject: subject || undefined,
        message
      });

      if (response.data.success) {
        showToast('Inbound Email Simulated & Auto-replied by AI!', 'success');
        // Clear simulation inputs
        setName('');
        setEmail('');
        setPhone('');
        setSubject('');
        setMessage('');
        // Refresh dashboard list
        await refreshEmails();
      }
    } catch (error) {
      console.error('Error simulating inbound email:', error);
      showToast(error.response?.data?.error || 'Failed to simulate inbound email.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInbox = async () => {
    setCheckingInbox(true);
    showToast('Checking Gmail Inbox for new messages...', 'info');
    try {
      const response = await axios.post('/api/check-inbox');
      if (response.data.success) {
        const stats = response.data.data;
        if (stats) {
          const msg = `Found ${stats.totalFound} unread emails. Sent ${stats.repliesSent} replies. Skipped ${stats.skipped}. Failed ${stats.failed}.`;
          showToast(msg, stats.failed > 0 ? 'error' : 'success');
        } else {
          showToast(response.data.message, 'success');
        }
        await refreshEmails();
      }
    } catch (error) {
      console.error('Error checking inbox:', error);
      showToast('Failed to check inbox.', 'error');
    } finally {
      setCheckingInbox(false);
    }
  };

  const getLanguageColor = (lang) => {
    switch (lang) {
      case 'English': return 'bg-sky-500/10 text-sky-700 border-sky-200';
      case 'Telugu': return 'bg-amber-500/10 text-amber-700 border-amber-200';
      case 'Hindi': return 'bg-emerald-500/10 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-500/10 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-slide-in">
      
      {/* Welcome Banner */}
      <div className="bg-brand-950 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl border border-brand-900">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center pr-12 pointer-events-none">
          <Building className="w-64 h-64" />
        </div>
        <div className="relative z-10 space-y-2">
          <span className="bg-brand-gold-700/20 text-brand-gold-300 border border-brand-gold-600/30 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            Lohitha Dharma Real Estate
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight">AI Email CRM Operations</h2>
          <p className="text-slate-300 max-w-xl text-sm leading-relaxed">
            Welcome back. The automated relationship assistant is online. All incoming enquiries in English, Telugu, and Hindi are being parsed, stored, and replied to instantly.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Total Inquiries */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-brand-50 rounded-xl text-brand-700">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Emails</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalEmails}</h3>
          </div>
        </div>

        {/* Unique Leads */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-brand-gold-50 rounded-xl text-brand-gold-700">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unique Leads</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalLeads}</h3>
          </div>
        </div>

        {/* AI Reply Rate */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Reply Rate</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{autoReplyRate}%</h3>
          </div>
        </div>

        {/* Languages Breakdowns */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-sky-50 rounded-xl text-sky-700">
            <Globe className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Language Breakdowns</p>
            <div className="flex space-x-2 mt-1.5 text-xs font-semibold">
              <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800" title="English">EN: {languagesCount.English}</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800" title="Telugu">TE: {languagesCount.Telugu}</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800" title="Hindi">HI: {languagesCount.Hindi}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Recent Enquiries */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Recent Customer Inquiries</h3>
              <div className="flex items-center space-x-6">
                <button 
                  onClick={handleCheckInbox}
                  disabled={checkingInbox}
                  className="flex items-center space-x-1.5 text-xs text-brand-700 hover:text-brand-800 font-semibold uppercase tracking-wider disabled:opacity-50 transition-colors"
                >
                  {checkingInbox ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Inbox className="w-3.5 h-3.5" />}
                  <span>{checkingInbox ? 'Checking...' : 'Check Inbox Now'}</span>
                </button>
                <button 
                  onClick={refreshEmails}
                  className="text-xs text-brand-700 hover:text-brand-800 font-semibold uppercase tracking-wider transition-colors"
                >
                  Refresh Log
                </button>
              </div>
            </div>
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {emails.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No emails received yet. Use the Simulator panel to trigger an email ingestion!
                </div>
              ) : (
                emails.slice(0, 5).map((mail) => (
                  <div 
                    key={mail._id}
                    onClick={() => onViewEmail(mail._id)}
                    className="p-5 hover:bg-slate-50 transition-colors cursor-pointer flex justify-between items-start space-x-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-800 text-sm">{mail.name}</span>
                        <span className="text-xs text-slate-400">({mail.email})</span>
                      </div>
                      <p className="text-slate-700 font-medium text-sm truncate max-w-md">{mail.subject}</p>
                      <p className="text-slate-500 text-xs truncate max-w-md">{mail.message}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(mail.createdDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getLanguageColor(mail.language)}`}>
                        {mail.language}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column: Simulation Panel & Monitor */}
        <div className="space-y-6">
          {/* Auto Monitor Status Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-brand-900">
                <Cpu className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800">Background AI Monitor</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${monitorStatus.isRunning ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {monitorStatus.isRunning ? '● ONLINE' : '○ OFFLINE'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Total Auto Replies</p>
                <p className="font-semibold text-slate-700">{monitorStatus.totalAutomaticRepliesSent}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Failed</p>
                <p className="font-semibold text-slate-700">{monitorStatus.failedReplies}</p>
              </div>
            </div>
            
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Last checked:</span>
              <span className="font-medium">{monitorStatus.lastChecked ? new Date(monitorStatus.lastChecked).toLocaleTimeString() : 'Never'}</span>
            </div>

            <button
              onClick={handleToggleMonitor}
              disabled={togglingMonitor}
              className={`w-full py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center space-x-2 ${monitorStatus.isRunning ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200' : 'bg-brand-800 text-white hover:bg-brand-900'}`}
            >
              {togglingMonitor ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>{monitorStatus.isRunning ? 'Stop Auto Monitor' : 'Start Auto Monitor'}</span>
              )}
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center space-x-2 text-brand-900">
              <Sparkles className="w-5 h-5 text-brand-gold-600" />
              <h3 className="font-bold text-slate-800">Inbound Email Simulator</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Use this tool to simulate incoming customer emails. The AI assistant will detect language (English/Telugu/Hindi), auto-extract CRM lead details, store the lead, and trigger auto-replies.
            </p>

            <form onSubmit={handleSimulateInbound} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="customer@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Looking for a 3BHK Apartment"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Message Body (Inquire in EN, TE, or HI) *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type inquiry here... (Try: 'హలో, హైదరాబాద్‌లో 2BHK అపార్ట్‌మెంట్స్ కావాలి, ధర ఎంత ఉంటుంది?')"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition-colors font-sans resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-800 hover:bg-brand-900 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-md transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-200" />
                    <span>Processing AI Reply...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Inbound Email</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
