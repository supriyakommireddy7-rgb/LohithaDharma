import React, { useState } from 'react';
import { 
  Users, 
  MapPin, 
  DollarSign, 
  Home, 
  Clock, 
  ExternalLink,
  MessageSquare,
  Search,
  CheckCircle,
  Clock3
} from 'lucide-react';
import axios from 'axios';

const LeadManagement = ({ emails, refreshEmails, showToast, onViewEmail }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const response = await axios.put(`/api/email/${leadId}/status`, { status: newStatus });
      if (response.data.success) {
        showToast(`Lead status updated to ${newStatus}`, 'success');
        refreshEmails();
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      showToast('Failed to update lead status.', 'error');
    }
  };

  // Filter leads
  const filteredLeads = emails.filter((lead) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchLower) ||
      lead.email.toLowerCase().includes(searchLower) ||
      (lead.phone && lead.phone.includes(searchLower)) ||
      (lead.location && lead.location.toLowerCase().includes(searchLower)) ||
      (lead.propertyType && lead.propertyType.toLowerCase().includes(searchLower));

    const matchesStatus = statusFilter === 'All' || lead.leadStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBg = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Contacted': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Follow-up': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Closed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-slide-in">
      
      {/* Metrics & Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-brand-gold-50 text-brand-gold-800 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Leads</p>
            <h3 className="text-xl font-bold text-slate-800">{filteredLeads.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Closed Deals</p>
            <h3 className="text-xl font-bold text-slate-800">
              {emails.filter(e => e.leadStatus === 'Closed').length}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
            <Clock3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Action Required</p>
            <h3 className="text-xl font-bold text-slate-800">
              {emails.filter(e => e.leadStatus === 'New' || e.leadStatus === 'Follow-up').length}
            </h3>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Search leads by name, email, property, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition-colors"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* CRM Spreadsheet Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-4 px-6">Lead Contact</th>
                <th className="py-4 px-6">Language</th>
                <th className="py-4 px-6">Requirements</th>
                <th className="py-4 px-6">Lead Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No leads matching the query found.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Contact details */}
                    <td className="py-5 px-6">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800 text-sm">{lead.name}</p>
                        <p className="text-slate-400 text-xs font-medium">{lead.email}</p>
                        {lead.phone && (
                          <p className="text-slate-500 text-xs font-semibold font-mono">{lead.phone}</p>
                        )}
                      </div>
                    </td>

                    {/* Language tag */}
                    <td className="py-5 px-6">
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {lead.language}
                      </span>
                    </td>

                    {/* Extracted preferences */}
                    <td className="py-5 px-6">
                      <div className="space-y-1 text-xs text-slate-600">
                        {lead.propertyType && (
                          <p className="flex items-center space-x-1">
                            <Home className="w-3.5 h-3.5 text-slate-400" />
                            <span>{lead.propertyType}</span>
                          </p>
                        )}
                        {lead.location && (
                          <p className="flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{lead.location}</span>
                          </p>
                        )}
                        {lead.budget && (
                          <p className="flex items-center space-x-1">
                            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                            <span>{lead.budget}</span>
                          </p>
                        )}
                        {lead.preferredContactTime && (
                          <p className="flex items-center space-x-1 text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="italic">{lead.preferredContactTime}</span>
                          </p>
                        )}
                        {!lead.propertyType && !lead.location && !lead.budget && (
                          <span className="text-slate-400 italic">No preferences details yet</span>
                        )}
                      </div>
                    </td>

                    {/* Status Pill & Changer */}
                    <td className="py-5 px-6">
                      <select
                        value={lead.leadStatus}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${getStatusBg(lead.leadStatus)}`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>

                    {/* Quick navigation actions */}
                    <td className="py-5 px-6 text-right">
                      <button
                        onClick={() => onViewEmail(lead._id)}
                        className="inline-flex items-center space-x-1 text-xs text-brand-700 hover:text-brand-900 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl font-bold transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat Thread</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default LeadManagement;
