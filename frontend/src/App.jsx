import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { 
  LayoutDashboard, CreditCard, PieChart, Target, TrendingUp, FileText, Sparkles, Settings,
  Moon, Sun, Bell, Search, Plus, Briefcase
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import Goals from './pages/Goals';
import Analytics from './pages/Analytics';
import Investments from './pages/Investments';
import Reports from './pages/Reports';
import AIInsights from './pages/AIInsights';
import SettingsPage from './pages/Settings';
import AIAssistant from './components/AIAssistant';
import NotificationsPage from './pages/NotificationsPage';
import { NotificationProvider } from './context/NotificationContext';
import NotificationBell from './components/notifications/NotificationBell';
import BottomNav from './components/mobile/BottomNav';
import FAB from './components/mobile/FAB';
import LockScreen from './components/LockScreen';

// Set up global fetch interceptor for auth headers
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  const password = localStorage.getItem('APP_PASSWORD') || '';
  config = config || {};
  config.headers = {
    ...config.headers,
    'x-app-password': password,
    'x-is-capacitor': Capacitor.isNativePlatform() ? 'true' : 'false'
  };
  return originalFetch(resource, config);
};

function Sidebar() {
  const location = useLocation();
  return (
    <div className="w-64 glass h-screen fixed left-0 top-0 flex flex-col hidden md:flex border-r border-[var(--border)] z-10">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
          T
        </div>
        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">TrackMyMNY</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavItem to="/" icon={<LayoutDashboard size={20}/>} label="Dashboard" active={location.pathname === '/'} />
        <NavItem to="/transactions" icon={<CreditCard size={20}/>} label="Transactions" active={location.pathname === '/transactions'} />
        <NavItem to="/analytics" icon={<PieChart size={20}/>} label="Analytics" active={location.pathname === '/analytics'} />
        <NavItem to="/investments" icon={<Briefcase size={20}/>} label="Investments" active={location.pathname === '/investments'} />
        <NavItem to="/budget" icon={<Target size={20}/>} label="Budget Planner" active={location.pathname === '/budget'} />
        <NavItem to="/goals" icon={<TrendingUp size={20}/>} label="Goals" active={location.pathname === '/goals'} />
        <NavItem to="/reports" icon={<FileText size={20}/>} label="Reports" active={location.pathname === '/reports'} />
        <NavItem to="/ai-insights" icon={<Sparkles size={20}/>} label="AI Insights" className="text-purple-500" active={location.pathname === '/ai-insights'} />
      </nav>

      <div className="p-4 mb-4">
        <NavItem to="/settings" icon={<Settings size={20}/>} label="Settings" active={location.pathname === '/settings'} />
      </div>
    </div>
  );
}

function NavItem({ to, icon, label, active, className = "" }) {
  return (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${active ? 'bg-blue-500/10 text-blue-500 font-semibold shadow-inner' : 'hover:bg-[var(--card)] opacity-80 hover:opacity-100 hover:translate-x-1'} ${className}`}>
      {icon}
      <span>{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>}
    </Link>
  );
}


function TopBar({ isDark, toggleTheme }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="glass-panel sticky top-0 z-20 max-w-7xl mx-auto mt-4 md:mt-6 rounded-2xl px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-2 md:gap-4 w-[calc(100%-2rem)] md:w-[calc(100%-3rem)]">
      <div className="flex items-center glass rounded-xl px-3 md:px-4 py-2 flex-1 min-w-0 max-w-[200px] md:max-w-96 focus-within:ring-2 ring-blue-500/50 transition-all">
        <Search size={18} className="opacity-50 shrink-0" />
        <input 
          type="text" 
          placeholder="Search..." 
          className="bg-transparent border-none outline-none ml-2 w-full text-sm"
        />
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-[var(--card)] transition-colors transform hover:rotate-12 shrink-0">
          {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-blue-600" />}
        </button>
        <div className="relative shrink-0" ref={menuRef}>
          <button 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[2px] cursor-pointer hover:scale-105 transition-transform shadow-lg shadow-purple-500/20 block"
          >
            <div className="w-full h-full rounded-full bg-[var(--background)] overflow-hidden">
              <img src="https://ui-avatars.com/api/?name=User&background=random" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 glass-panel rounded-2xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-top-2 border border-[var(--border)] flex flex-col z-50">
              <div className="p-3 border-b border-[var(--border)]">
                <p className="font-semibold text-sm">User Profile</p>
              </div>
              <div className="py-2 flex flex-col">
                <Link to="/analytics" onClick={() => setIsProfileMenuOpen(false)} className="md:hidden flex items-center gap-3 px-4 py-3 hover:bg-[var(--card)] transition-colors text-sm font-medium"><PieChart size={16}/> Analytics</Link>
                <Link to="/reports" onClick={() => setIsProfileMenuOpen(false)} className="md:hidden flex items-center gap-3 px-4 py-3 hover:bg-[var(--card)] transition-colors text-sm font-medium"><FileText size={16}/> Reports</Link>
                <Link to="/ai" onClick={() => setIsProfileMenuOpen(false)} className="md:hidden flex items-center gap-3 px-4 py-3 hover:bg-[var(--card)] transition-colors text-sm font-medium"><Sparkles size={16}/> AI Insights</Link>
                <Link to="/settings" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--card)] transition-colors text-sm font-medium"><Settings size={16}/> Settings</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [isLocked, setIsLocked] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if auth is required (Web and Mobile)
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: localStorage.getItem('APP_PASSWORD') || '' })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setIsLocked(false);
      } else {
        setIsLocked(true);
      }
    })
    .catch(err => {
      console.error('Failed to check auth', err);
      // Fail open if server is down? No, fail closed.
      setIsLocked(true);
    })
    .finally(() => setIsCheckingAuth(false));
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  if (isCheckingAuth) return null; // Or a loading spinner

  if (isLocked) {
    return <LockScreen onUnlock={(pw) => setIsLocked(false)} />;
  }

  return (
    <NotificationProvider>
      <Router>
        <div className="flex bg-gradient-modern min-h-screen text-[var(--foreground)] w-full overflow-x-hidden">
          <Sidebar />
          
          <main className="flex-1 min-w-0 md:ml-64 relative pb-24 md:pb-10">
            <TopBar isDark={isDark} toggleTheme={() => setIsDark(!isDark)} />
            
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/investments" element={<Investments />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/ai-insights" element={<AIInsights />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="*" element={
                <div className="p-6 text-center opacity-50 mt-20 animate-in fade-in zoom-in duration-500">
                  <div className="text-6xl mb-4">🚧</div>
                  <h2 className="text-2xl font-bold">Work in progress</h2>
                  <p>This module is currently under development.</p>
                </div>
              } />
            </Routes>
          </main>
          <BottomNav />
          <FAB />
          <AIAssistant />
        </div>
      </Router>
    </NotificationProvider>
  );
}
