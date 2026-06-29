import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Building2, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info 
} from 'lucide-react';

// Components & Pages
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Sent from './pages/Sent';
import EmailDetails from './pages/EmailDetails';
import LeadManagement from './pages/LeadManagement';
import Settings from './pages/Settings';

// Set base URL for axios requests (proxy dev port)
axios.defaults.baseURL = 'http://localhost:5001';

// Setup initial token if exists
const initialToken = localStorage.getItem('ld_token');
if (initialToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}

const App = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('ld_auth') === 'true'
  );
  
  // Setup Axios Interceptor for 401s
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Token is invalid or expired
          setIsAuthenticated(false);
          localStorage.removeItem('ld_auth');
          localStorage.removeItem('ld_token');
          delete axios.defaults.headers.common['Authorization'];
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);
  const [loginError, setLoginError] = useState('');

  // Navigation State
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedEmailId, setSelectedEmailId] = useState(null);

  // API Data States
  const [emails, setEmails] = useState([]);
  const [serverConnected, setServerConnected] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  // Trigger toast notifications
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch emails from API
  const refreshEmails = async () => {
    try {
      const response = await axios.get('/api/emails');
      if (response.data.success) {
        setEmails(response.data.data);
        setServerConnected(true);
      }
    } catch (error) {
      console.error('Error fetching emails list:', error);
      setServerConnected(false);
    }
  };

  // Check backend server connection on startup
  useEffect(() => {
    refreshEmails();
    // Auto-poll for new messages every 15 seconds
    const interval = setInterval(() => {
      if (isAuthenticated) {
        refreshEmails();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Auth actions
  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      if (response.data.success) {
        setIsAuthenticated(true);
        localStorage.setItem('ld_auth', 'true');
        localStorage.setItem('ld_token', response.data.token);
        
        // Setup axios default token
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        setLoginError('');
        showToast('Logged in successfully. Welcome!', 'success');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setLoginError(error.response.data.error);
      } else {
        setLoginError('Server connection error. Please try again later.');
      }
      showToast('Login verification failed.', 'error');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('ld_auth');
    localStorage.removeItem('ld_token');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentPage('dashboard');
    showToast('Logged out of system.', 'info');
  };

  // Routing render switcher
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            emails={emails}
            refreshEmails={refreshEmails}
            showToast={showToast}
            onViewEmail={(id) => {
              setSelectedEmailId(id);
              setCurrentPage('email-detail');
            }}
          />
        );
      case 'inbox':
        return (
          <Inbox
            emails={emails}
            onViewEmail={(id) => {
              setSelectedEmailId(id);
              setCurrentPage('email-detail');
            }}
          />
        );
      case 'sent':
        return (
          <Sent
            emails={emails}
            onViewEmail={(id) => {
              setSelectedEmailId(id);
              setCurrentPage('email-detail');
            }}
          />
        );
      case 'leads':
        return (
          <LeadManagement
            emails={emails}
            refreshEmails={refreshEmails}
            showToast={showToast}
            onViewEmail={(id) => {
              setSelectedEmailId(id);
              setCurrentPage('email-detail');
            }}
          />
        );
      case 'settings':
        return <Settings showToast={showToast} />;
      case 'email-detail':
        return (
          <EmailDetails
            emailId={selectedEmailId}
            onBack={() => {
              setSelectedEmailId(null);
              setCurrentPage('inbox');
            }}
            showToast={showToast}
            refreshEmails={refreshEmails}
          />
        );
      default:
        return <div className="p-8">Page Not Found</div>;
    }
  };

  // Unauthenticated viewport
  if (!isAuthenticated) {
    return <Login handleLogin={handleLogin} error={loginError} />;
  }

  // Authenticated Dashboard Layout
  return (
    <div className="flex bg-slate-50 min-h-screen">
      {/* Sidebar Nav */}
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={(page) => {
          setCurrentPage(page);
          setSelectedEmailId(null);
        }} 
        handleLogout={handleLogout} 
      />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={currentPage} serverConnected={serverConnected} />
        
        <main className="p-8 flex-1 overflow-y-auto max-w-[1400px] w-full mx-auto">
          {renderPage()}
        </main>
      </div>

      {/* Toast Alert Component */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in flex items-center space-x-3 bg-white border shadow-2xl p-4 rounded-2xl max-w-sm">
          {toast.type === 'success' && (
            <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-600 border border-emerald-100">
              <CheckCircle className="w-5 h-5" />
            </div>
          )}
          {toast.type === 'error' && (
            <div className="bg-rose-500/10 p-2 rounded-xl text-rose-600 border border-rose-100">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
          {toast.type === 'info' && (
            <div className="bg-sky-500/10 p-2 rounded-xl text-sky-600 border border-sky-100">
              <Info className="w-5 h-5" />
            </div>
          )}
          <div className="flex-1 pr-6">
            <p className="text-xs font-bold text-slate-800">Notification</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-semibold">{toast.message}</p>
          </div>
          <button 
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
