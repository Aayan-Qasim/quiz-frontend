import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, BarChart3, HelpCircle, Layers, Users, Trophy, Sun, Moon
} from 'lucide-react';

import { AuthPage } from './components/AuthPage.js';
import { Analytics } from './components/Analytics.js';
import { QuestionManager } from './components/QuestionManager.js';
import { CategoryManager } from './components/CategoryManager.js';
import { UserManager } from './components/UserManager.js';
import { LeaderboardPage } from './components/LeaderboardPage.js';

type Tab = 'analytics' | 'questions' | 'categories' | 'users' | 'leaderboard';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>('analytics');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('qm_dark_mode') === 'true';
    } catch (_) {
      return false;
    }
  });

  // Auto-restore login on startup
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('qm_token');
      const savedUser = localStorage.getItem('qm_user');
      if (savedToken && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setCurrentUser(parsedUser);
        setActiveTab('analytics');
      }
    } catch (err) {
      console.error('Failed to restore saved user session', err);
      try {
        localStorage.removeItem('qm_token');
        localStorage.removeItem('qm_user');
      } catch (_) {}
      setToken(null);
      setCurrentUser(null);
    }
  }, []);

  // Manage body dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('qm_dark_mode', 'true');
      } catch (_) {}
    } else {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.setItem('qm_dark_mode', 'false');
      } catch (_) {}
    }
  }, [isDarkMode]);

  const handleLoginSuccess = (newToken: string, user: any) => {
    setToken(newToken);
    setCurrentUser(user);
    setActiveTab('analytics');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('qm_token');
      localStorage.removeItem('qm_user');
    } catch (_) {}
    setToken(null);
    setCurrentUser(null);
  };

  if (!token || !currentUser) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Navigation config based on role capabilities
  const navigationItems = [
    { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3 },
    { id: 'questions', label: 'Question Bank', icon: HelpCircle },
    { id: 'categories', label: 'Category Settings', icon: Layers },
    { id: 'users', label: 'Student Management', icon: Users },
    { id: 'leaderboard', label: 'Scholars Leaderboard', icon: Trophy },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-50 font-sans text-xs">
      
      {/* HIGH DENSITY HEADER */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 transition-colors duration-150">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">Q</div>
          <h1 className="text-sm font-bold text-slate-800 tracking-tight">
            QuizMaster <span className="text-slate-400 font-normal">| Admin Portal</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          
          {/* Dynamic Theme Toggle Action */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-750 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center text-slate-600 dark:text-slate-350"
            title={isDarkMode ? "Active Light Mode" : "Active Dark Mode"}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 text-amber-500 animate-pulse" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-500 hover:scale-105 transition-transform" />
            )}
          </button>

          <div className="flex flex-col items-end text-right">
            <span className="text-xs font-semibold text-slate-700 leading-none">{currentUser.name}</span>
            <span className="text-[9px] text-slate-400 tracking-wider font-bold uppercase mt-0.5">
              System Administrator
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-indigo-50 border-2 border-indigo-150 dark:border-indigo-900/50 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-400">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* BODY WITH COMPACT SIDEBAR AND CONTAINER */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* COMPACT SIDEBAR VIEW */}
        <aside className="w-52 border-r border-slate-200 bg-white flex flex-col p-3 gap-1.5 shrink-0 justify-between">
          <div className="space-y-1">
            <div className="px-3 py-1 text-[9px] uppercase text-slate-400 font-bold tracking-widest">
              Navigation Menu
            </div>
            <nav className="space-y-0.5">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as Tab)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-700 font-bold' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-905'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-150 space-y-2">
            <div className="text-[9px] uppercase text-slate-400 font-bold tracking-wider leading-none">
              Client Session
            </div>
            <div className="flex items-center justify-between text-[11px] leading-none text-slate-555">
              <span>Database Status</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                Active
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex justify-center items-center gap-1.5 py-1.5 border border-slate-200 rounded text-slate-500 bg-white hover:text-rose-600 hover:border-rose-150 transition-colors text-[10px] font-bold cursor-pointer leading-none"
            >
              <LogOut className="h-3 w-3" />
              Sign Out Hub
            </button>
          </div>
        </aside>

        {/* CORE PORTAL MAIN BOARD AREA */}
        <main className="flex-1 overflow-auto bg-slate-50 p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="max-w-6xl mx-auto"
            >
              {activeTab === 'analytics' && <Analytics token={token} onNavigateToQuestions={() => setActiveTab('questions')} />}
              
              {activeTab === 'questions' && <QuestionManager token={token} />}
              
              {activeTab === 'categories' && <CategoryManager token={token} />}
              
              {activeTab === 'users' && <UserManager token={token} />}

              {activeTab === 'leaderboard' && <LeaderboardPage token={token} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
