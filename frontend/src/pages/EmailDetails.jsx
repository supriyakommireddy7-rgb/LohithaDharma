import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Trash2, 
  Send, 
  Cpu, 
  Sparkles,
  Loader2,
  Calendar,
  Building
} from 'lucide-react';
import axios from 'axios';

const EmailDetails = ({ emailId, onBack, showToast, refreshEmails }) => {
  const [mail, setMail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [generatingDraft, setGeneratingDraft] = useState(false);

  const fetchEmailDetails = async () => {
    try {
      const response = await axios.get(`/api/email/${emailId}`);
      if (response.data.success) {
        setMail(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching email details:', error);
      showToast('Failed to load email thread.', 'error');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailDetails();
  }, [emailId]);

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await axios.put(`/api/email/${emailId}/status`, { status: newStatus });
      if (response.data.success) {
        setMail(response.data.data);
        showToast(`Lead status updated to ${newStatus}`, 'success');
        refreshEmails();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Failed to update status.', 'error');
    }
  };

  const handleSendManualReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSending(true);
    try {
      const response = await axios.post('/api/send-email', {
        emailId: mail._id,
        message: replyMessage
      });

      if (response.data.success) {
        showToast('Manual reply sent!', 'success');
        setReplyMessage('');
        await fetchEmailDetails();
        refreshEmails();
      }
    } catch (error) {
      console.error('Error sending manual reply:', error);
      showToast('Failed to send reply.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleGenerateAiDraft = async () => {
    setGeneratingDraft(true);
    try {
      // Find the last message sent by the customer to draft a response for it
      const customerMsgs = mail.history.filter(h => h.sender !== 'office@lohithadharma.com');
      const lastCustomerMsg = customerMsgs[customerMsgs.length - 1]?.message || mail.message;

      const response = await axios.post('/api/generate-reply', {
        email: mail.email,
        subject: mail.subject,
        message: lastCustomerMsg
      });

      if (response.data.success) {
        setReplyMessage(response.data.data.replyText);
        showToast('AI Draft generated. You can edit before sending.', 'success');
      }
    } catch (error) {
      console.error('Error generating AI draft:', error);
      showToast('Failed to generate AI draft.', 'error');
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleDeleteThread = async () => {
    if (!window.confirm('Are you sure you want to delete this customer conversation?')) return;
    
    try {
      const response = await axios.delete(`/api/email/${mail._id}`);
      if (response.data.success) {
        showToast('Conversation deleted.', 'success');
        refreshEmails();
        onBack();
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      showToast('Failed to delete conversation.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in">
      
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-sm text-slate-500 hover:text-slate-800 transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to List</span>
        </button>

        <button 
          onClick={handleDeleteThread}
          className="flex items-center space-x-2 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl transition-colors font-semibold"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Conversation</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Thread History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Thread Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Conversation History</h3>
              <span className="text-xs text-slate-400 font-medium">Thread ID: {mail._id.substring(18)}</span>
            </div>
            
            <div className="p-6 flex-1 space-y-6 overflow-y-auto max-h-[500px]">
              {mail.history.map((chat, idx) => {
                const isOutbound = chat.sender === 'office@lohithadharma.com';
                return (
                  <div 
                    key={chat._id || idx}
                    className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl p-5 shadow-sm border ${
                      isOutbound 
                        ? 'bg-brand-50/70 border-brand-100 text-slate-800' 
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}>
                      
                      {/* Meta */}
                      <div className="flex items-center justify-between mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider space-x-4">
                        <span className="flex items-center space-x-1.5">
                          {isOutbound ? (
                            chat.isAiGenerated ? (
                              <span className="flex items-center space-x-1 text-brand-700 bg-brand-100 px-2 py-0.5 rounded-md">
                                <Cpu className="w-3 h-3" />
                                <span>AI Response</span>
                              </span>
                            ) : (
                              <span className="flex items-center space-x-1 text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                                <User className="w-3 h-3" />
                                <span>Manual Response</span>
                              </span>
                            )
                          ) : (
                            <span className="text-slate-600 bg-slate-200 px-2 py-0.5 rounded-md">Customer Inquiry</span>
                          )}
                        </span>
                        
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(chat.createdDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                      </div>

                      {/* Content */}
                      <p className="text-sm leading-relaxed whitespace-pre-line text-slate-700 font-medium">
                        {chat.message}
                      </p>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Box: Send Reply */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Send Response</h3>
              
              <button
                type="button"
                onClick={handleGenerateAiDraft}
                disabled={generatingDraft}
                className="flex items-center space-x-1.5 text-xs text-brand-800 hover:text-brand-900 bg-brand-50 border border-brand-200 hover:bg-brand-100 px-3 py-1.5 rounded-xl font-bold transition-all"
              >
                {generatingDraft ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Drafting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-brand-gold-600" />
                    <span>Autodraft response with AI</span>
                  </>
                )}
              </button>
            </div>

            <form onSubmit={handleSendManualReply} className="space-y-4">
              <textarea
                required
                rows={5}
                placeholder="Type response body here..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-600 focus:bg-white transition-colors font-sans resize-none"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={sending || !replyMessage.trim()}
                  className="bg-brand-800 hover:bg-brand-900 text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-md transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-200" />
                      <span>Sending Email...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Response</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Column: Lead Summary CRM details */}
        <div className="space-y-6">
          
          {/* CRM Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center space-x-2 text-slate-800 pb-2 border-b border-slate-100">
              <User className="w-5 h-5 text-brand-gold-600" />
              <h3 className="font-bold text-sm">Lead Profile Summary</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Building className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Contact Name</p>
                  <p className="text-sm font-semibold text-slate-700">{mail.name}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-semibold text-slate-700 truncate max-w-[180px]" title={mail.email}>{mail.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone Number</p>
                  <p className="text-sm font-semibold text-slate-700">{mail.phone || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Sparkles className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Inquiry Language</p>
                  <span className="inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 border border-brand-100 text-brand-800">
                    {mail.language}
                  </span>
                </div>
              </div>
            </div>

            {/* Lead Status Dropdown Selector */}
            <div className="pt-4 border-t border-slate-100">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Operations Lead Status
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold uppercase tracking-wider">
                {['New', 'Contacted', 'Follow-up', 'Closed'].map((statusOption) => {
                  const isActive = mail.leadStatus === statusOption;
                  return (
                    <button
                      key={statusOption}
                      type="button"
                      onClick={() => handleStatusChange(statusOption)}
                      className={`py-2 px-3 rounded-xl border text-center transition-all ${
                        isActive
                          ? 'bg-brand-900 border-brand-950 text-white font-extrabold shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {statusOption}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default EmailDetails;
