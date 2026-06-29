import React, { useState } from 'react';
import { Search, Filter, Mail, ArrowRight, Calendar } from 'lucide-react';

const Inbox = ({ emails, onViewEmail }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [langFilter, setLangFilter] = useState('All');

  // Filter Emails
  const filteredEmails = emails.filter((mail) => {
    // Search query match
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      mail.name.toLowerCase().includes(searchLower) ||
      mail.email.toLowerCase().includes(searchLower) ||
      mail.subject.toLowerCase().includes(searchLower) ||
      mail.message.toLowerCase().includes(searchLower);

    // Status filter match
    const matchesStatus = statusFilter === 'All' || mail.leadStatus === statusFilter;

    // Language filter match
    const matchesLang = langFilter === 'All' || mail.language === langFilter;

    return matchesSearch && matchesStatus && matchesLang;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Contacted': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Follow-up': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Closed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getLanguageColor = (lang) => {
    switch (lang) {
      case 'English': return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'Telugu': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Hindi': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 animate-slide-in">
      
      {/* Search and Filters panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Search sender, subject, message content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <select
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="All">All Languages</option>
              <option value="English">English</option>
              <option value="Telugu">Telugu</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inbox List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredEmails.length === 0 ? (
            <div className="p-16 text-center text-slate-400 space-y-3">
              <Mail className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="text-sm font-medium">No customer inquiries found matching filters.</p>
            </div>
          ) : (
            filteredEmails.map((mail) => (
              <div 
                key={mail._id}
                onClick={() => onViewEmail(mail._id)}
                className="p-6 hover:bg-slate-50 transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Sender Details & Snippet */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                    <span className="font-bold text-slate-800 text-sm">{mail.name}</span>
                    <span className="text-xs text-slate-400 truncate max-w-xs">{mail.email}</span>
                    {mail.phone && (
                      <span className="text-xs text-slate-500 font-semibold font-mono">({mail.phone})</span>
                    )}
                  </div>
                  <h4 className="text-slate-700 font-semibold text-sm truncate max-w-2xl">{mail.subject}</h4>
                  <p className="text-slate-500 text-xs truncate max-w-3xl leading-relaxed">{mail.message}</p>
                </div>

                {/* Tags and Timestamps */}
                <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${getStatusColor(mail.leadStatus)}`}>
                      {mail.leadStatus}
                    </span>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${getLanguageColor(mail.language)}`}>
                      {mail.language}
                    </span>
                  </div>

                  <div className="text-right text-xs text-slate-400 font-semibold flex items-center space-x-1.5 ml-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(mail.createdDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <ArrowRight className="w-5 h-5 text-slate-300 hidden md:block hover:text-slate-500 transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default Inbox;
