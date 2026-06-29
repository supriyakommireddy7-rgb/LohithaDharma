import React, { useState } from 'react';
import { Search, Send, Cpu, User, Calendar, ArrowUpRight } from 'lucide-react';

const Sent = ({ emails, onViewEmail }) => {
  const [search, setSearch] = useState('');

  // Extract all outbound emails from history lists of all emails
  const outboundEmails = [];
  emails.forEach((mail) => {
    mail.history.forEach((hist) => {
      // Outbound emails are sent from the office
      if (hist.sender === 'office@lohithadharma.com') {
        outboundEmails.push({
          parentMailId: mail._id,
          recipient: hist.recipient,
          recipientName: mail.name,
          subject: hist.subject || 'Re: Inquiry',
          message: hist.message,
          isAiGenerated: hist.isAiGenerated,
          createdDate: hist.createdDate
        });
      }
    });
  });

  // Sort by date descending
  outboundEmails.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

  // Filter
  const filteredSent = outboundEmails.filter((sent) => {
    const searchLower = search.toLowerCase();
    return (
      sent.recipient.toLowerCase().includes(searchLower) ||
      sent.recipientName.toLowerCase().includes(searchLower) ||
      sent.subject.toLowerCase().includes(searchLower) ||
      sent.message.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 animate-slide-in">
      
      {/* Search panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Search sent emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Outbox List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredSent.length === 0 ? (
            <div className="p-16 text-center text-slate-400 space-y-3">
              <Send className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="text-sm font-medium">No sent emails logged yet.</p>
            </div>
          ) : (
            filteredSent.map((sent, index) => (
              <div 
                key={index}
                onClick={() => onViewEmail(sent.parentMailId)}
                className="p-6 hover:bg-slate-50 transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Outbox content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="text-xs font-semibold text-slate-400">To:</span>
                    <span className="font-bold text-slate-800 text-sm">{sent.recipientName}</span>
                    <span className="text-xs text-slate-400">({sent.recipient})</span>
                  </div>
                  <h4 className="text-slate-700 font-semibold text-sm truncate max-w-2xl">{sent.subject}</h4>
                  <p className="text-slate-500 text-xs truncate max-w-3xl whitespace-pre-wrap">{sent.message}</p>
                </div>

                {/* Automation badges */}
                <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
                  <div className="flex items-center">
                    {sent.isAiGenerated ? (
                      <span className="flex items-center space-x-1 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
                        <Cpu className="w-3 h-3" />
                        <span>AI Reply</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                        <User className="w-3 h-3" />
                        <span>Manual</span>
                      </span>
                    )}
                  </div>

                  <div className="text-right text-xs text-slate-400 font-semibold flex items-center space-x-1.5 ml-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(sent.createdDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <ArrowUpRight className="w-5 h-5 text-slate-300 hidden md:block" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default Sent;
