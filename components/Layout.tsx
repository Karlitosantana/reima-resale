import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Plus, Snowflake, User, LogOut, Settings } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isOnline = isSupabaseConfigured();

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <div className="min-h-screen bg-ios-gray dark:bg-black text-ios-text dark:text-white font-sans selection:bg-red-100 selection:text-red-900">
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

      <main className="max-w-md mx-auto min-h-screen bg-ios-gray dark:bg-black relative overflow-hidden pt-16 pb-[100px]">

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

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-200/80 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-sm border border-gray-300/50 dark:border-gray-600"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 flex items-center justify-center shadow-md">
                  <User size={15} className="text-white" />
                </div>
                {isOnline && (
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                )}
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#2C2C2E] rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-fade-in-scale">
                    {/* User Info */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-ios-text dark:text-white truncate">
                        {user?.email || 'Uživatel'}
                      </p>
                      <p className="text-xs text-ios-textSec mt-0.5">
                        {isOnline ? 'Připojeno' : 'Offline režim'}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-ios-red hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut size={18} />
                        <span className="font-medium">Odhlásit se</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
        </header>

        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
        <div className="max-w-md w-full relative">
          {/* Background with blur */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 rounded-t-2xl shadow-lg" />

          {/* Navigation content */}
          <div className="relative px-6 pb-3 pt-2">
            <div className="flex items-end justify-center gap-16">
              {/* Dashboard button */}
              <button
                onClick={() => navigate('/')}
                className={`flex flex-col items-center justify-center min-w-[70px] py-2 px-3 rounded-xl transition-all duration-200 active:scale-95 mt-2 ${
                  isActive('/') ? 'text-ios-blue bg-ios-blue/10' : 'text-blue-400 active:text-blue-500'
                }`}
              >
                <LayoutDashboard size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
                <span className="text-[10px] font-semibold mt-1">Přehled</span>
              </button>

              {/* Center Add button - floating above */}
              <button
                onClick={() => navigate('/add')}
                className="flex items-center justify-center -mt-6 group"
              >
                <div className="bg-white dark:bg-[#2C2C2E] rounded-full w-14 h-14 flex items-center justify-center shadow-lg border-2 border-ios-blue group-active:scale-95 transition-transform duration-150">
                  <Plus size={28} strokeWidth={2.5} className="text-ios-blue" />
                </div>
              </button>

              {/* Inventory button */}
              <button
                onClick={() => navigate('/inventory')}
                className={`flex flex-col items-center justify-center min-w-[70px] py-2 px-3 rounded-xl transition-all duration-200 active:scale-95 mt-2 ${
                  isActive('/inventory') ? 'text-ios-blue bg-ios-blue/10' : 'text-blue-400 active:text-blue-500'
                }`}
              >
                <ShoppingBag size={24} strokeWidth={isActive('/inventory') ? 2.5 : 2} />
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
