import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Plus, Snowflake } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isOnline = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-ios-gray dark:bg-black pb-24 text-ios-text dark:text-white font-sans selection:bg-red-100 selection:text-red-900">
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        .glass-header {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        @media (prefers-color-scheme: dark) {
          .glass-header {
            background: rgba(30, 30, 30, 0.85);
            border-bottom-color: rgba(255,255,255,0.1);
          }
        }
      `}</style>

      <main className="max-w-md mx-auto min-h-screen bg-ios-gray dark:bg-black relative shadow-2xl overflow-hidden pt-16">

        {/* Modern Header */}
        <header className="fixed top-0 max-w-md w-full z-40 glass-header h-16 px-5 flex items-center justify-between transition-all duration-300 border-b border-transparent dark:border-white/10">
            {/* Subtle bottom gradient line for light mode */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:hidden"></div>

            {/* Logo Section */}
            <div className="flex items-center gap-3 group cursor-default">
                <div className="relative">
                    {/* Glowing background effect */}
                    <div className="absolute -inset-1 bg-gradient-to-tr from-red-500 to-orange-400 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm ring-1 ring-gray-100 dark:ring-gray-700">
                        <Snowflake className="text-red-600 dark:text-red-500 w-5 h-5 animate-spin-slow" strokeWidth={2.5} />
                    </div>
                </div>

                <div className="flex flex-col justify-center leading-none">
                    <span className="text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-0.5">Kids Wear</span>
                    <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                        REIMA <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">Resale</span>
                    </span>
                </div>
            </div>

            {/* Status Indicator */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all duration-500 ${
                isOnline
                  ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400'
                  : 'bg-gray-50/50 border-gray-100 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
              }`}
            >
                {isOnline ? (
                   <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </div>
                ) : (
                    <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                )}
                <span className="text-[10px] font-bold uppercase tracking-wide">
                    {isOnline ? 'Online' : 'Offline'}
                </span>
            </div>
        </header>

        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
        <div className="max-w-md w-full relative">
          {/* Background with blur */}
          <div className="absolute inset-0 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 rounded-t-2xl shadow-lg" />

          {/* Navigation content */}
          <div className="relative px-8 pb-6 pt-3">
            <div className="flex items-end justify-between">
              {/* Dashboard button */}
              <button
                onClick={() => navigate('/')}
                className={`flex flex-col items-center justify-center min-w-[64px] py-2 transition-all duration-200 ${
                  isActive('/') ? 'text-ios-blue' : 'text-blue-400 active:text-blue-500'
                }`}
              >
                <LayoutDashboard size={26} strokeWidth={isActive('/') ? 2.5 : 2} />
                <span className="text-[10px] font-semibold mt-1">Přehled</span>
              </button>

              {/* Center Add button - raised */}
              <button
                onClick={() => navigate('/add')}
                className="flex items-center justify-center -mt-6 group"
              >
                <div className="bg-gradient-to-br from-ios-blue to-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg shadow-blue-500/40 group-active:scale-95 transition-transform duration-150">
                  <Plus size={28} strokeWidth={2.5} />
                </div>
              </button>

              {/* Inventory button */}
              <button
                onClick={() => navigate('/inventory')}
                className={`flex flex-col items-center justify-center min-w-[64px] py-2 transition-all duration-200 ${
                  isActive('/inventory') ? 'text-ios-blue' : 'text-blue-400 active:text-blue-500'
                }`}
              >
                <ShoppingBag size={26} strokeWidth={isActive('/inventory') ? 2.5 : 2} />
                <span className="text-[10px] font-semibold mt-1">Inventář</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
