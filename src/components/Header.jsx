import React from 'react';
import { 
  ShoppingCart, Shirt, Users, Cloud, CloudOff, 
  RefreshCw, Download, Upload, Sparkles 
} from 'lucide-react';
import { haptics } from '../utils/haptics';

export default function Header({
  activeTab,
  setActiveTab,
  itemsCount,
  clothingCount,
  tasksCount,
  connectionStatus,
  onOpenSyncModal,
  onResetDefaults,
  onExportData,
  onImportClick
}) {
  const handleTabChange = (tab) => {
    haptics.selection();
    setActiveTab(tab);
  };

  // Theme-specific accent colors
  const activeColorRing = 
    activeTab === 'dmart' 
      ? 'border-emerald-500/40 shadow-emerald-500/10' 
      : activeTab === 'clothing'
      ? 'border-pink-500/40 shadow-pink-500/10'
      : 'border-indigo-500/40 shadow-indigo-500/10';

  return (
    <header className="sticky top-0 z-30 transition-all">
      {/* 🌟 Dynamic Dark Frosted Glass Top Bar */}
      <div className="dark-glass-header text-white px-4 py-2.5 shadow-xl">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Hub Branding with Active Glowing Icon */}
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 p-2 rounded-2xl text-slate-950 shadow-lg flex items-center justify-center font-black transition-all duration-300 ${
              activeTab === 'dmart'
                ? 'bg-linear-to-tr from-emerald-400 to-teal-300 shadow-emerald-500/30'
                : activeTab === 'clothing'
                ? 'bg-linear-to-tr from-pink-400 to-rose-300 shadow-pink-500/30'
                : 'bg-linear-to-tr from-indigo-400 to-cyan-300 shadow-indigo-500/30'
            }`}>
              {activeTab === 'dmart' ? (
                <ShoppingCart className="w-5 h-5 text-slate-950 animate-icon-pop" />
              ) : activeTab === 'clothing' ? (
                <Shirt className="w-5 h-5 text-slate-950 animate-icon-pop" />
              ) : (
                <Users className="w-5 h-5 text-slate-950 animate-icon-pop" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5 drop-shadow-md">
                  SmartCart &amp; Action Hub
                </h1>
                <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border transition-all ${
                  activeTab === 'dmart'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : activeTab === 'clothing'
                    ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                }`}>
                  {activeTab === 'dmart' ? '🛒 Grocery Cart' : activeTab === 'clothing' ? '👗 Dressing Cart' : '👥 Group Tasks'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300/80 hidden sm:block font-medium">
                Distinct Dark Zone Themes • Haptic Android Feedback • Real-Time Sync
              </p>
            </div>
          </div>

          {/* Sync Status Badge & Quick Tools with Glassmorphic styling */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                haptics.click();
                onOpenSyncModal();
              }}
              title="Click to configure Real-Time Multi-User Sync"
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-md backdrop-blur-xl ${
                connectionStatus.connected
                  ? 'bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/50 ring-2 ring-emerald-500/25 shadow-emerald-500/20'
                  : 'bg-amber-400 text-slate-950 hover:bg-amber-300 font-extrabold animate-pulse shadow-amber-400/25'
              }`}
            >
              {connectionStatus.connected ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Cloud Live Synced</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5" />
                  <span>Connect Cloud Sync</span>
                </>
              )}
            </button>

            {/* Quick backup / restore tools */}
            <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-xl border border-white/15 backdrop-blur-xl shadow-xs">
              <button
                onClick={() => {
                  haptics.click();
                  onExportData();
                }}
                title="Backup / Export JSON"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/15 transition hover-wiggle"
              >
                <Download className="w-3.5 h-3.5 icon-target" />
              </button>
              <button
                onClick={() => {
                  haptics.click();
                  onImportClick();
                }}
                title="Restore / Import JSON"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/15 transition hover-wiggle"
              >
                <Upload className="w-3.5 h-3.5 icon-target" />
              </button>
              <button
                onClick={() => {
                  haptics.warning();
                  onResetDefaults();
                }}
                title="Reset to Original Defaults"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/15 transition hover-wiggle"
              >
                <RefreshCw className="w-3.5 h-3.5 icon-target" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 Modern Dark Tab Switcher (Senses Active Cart) */}
      <div className="dark-glass-header border-t border-white/5 shadow-md">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex space-x-2.5 py-2 overflow-x-auto" aria-label="Tabs">
            {/* 1. DMart Groceries Tab (Deep Emerald) */}
            <button
              onClick={() => handleTabChange('dmart')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-black rounded-xl transition-all whitespace-nowrap group ${
                activeTab === 'dmart'
                  ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/40 ring-2 ring-emerald-500/30'
                  : 'text-emerald-200/60 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <ShoppingCart className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                activeTab === 'dmart' ? 'animate-bounce' : ''
              }`} />
              <span>🛒 DMart Grocery Cart</span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full font-black transition ${
                  activeTab === 'dmart'
                    ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-400/40'
                    : 'bg-emerald-950/40 text-emerald-300/80'
                }`}
              >
                {itemsCount.pending} to pick
              </span>
            </button>

            {/* 2. Dressing Shopping Cart Tab (Deep Plum/Rose) */}
            <button
              onClick={() => handleTabChange('clothing')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-black rounded-xl transition-all whitespace-nowrap group ${
                activeTab === 'clothing'
                  ? 'bg-linear-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/25 border border-pink-400/40 ring-2 ring-pink-500/30'
                  : 'text-pink-200/60 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Shirt className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                activeTab === 'clothing' ? 'animate-bounce' : ''
              }`} />
              <span>👗 Dressing Shopping Cart</span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full font-black transition ${
                  activeTab === 'clothing'
                    ? 'bg-pink-950/80 text-pink-200 border border-pink-400/40'
                    : 'bg-pink-950/40 text-pink-300/80'
                }`}
              >
                {clothingCount.pending} to buy
              </span>
            </button>

            {/* 3. Group Action & Tasks Tab (Deep Midnight Indigo) */}
            <button
              onClick={() => handleTabChange('tasks')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-black rounded-xl transition-all whitespace-nowrap group ${
                activeTab === 'tasks'
                  ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/40 ring-2 ring-indigo-500/30'
                  : 'text-indigo-200/60 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Users className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                activeTab === 'tasks' ? 'animate-bounce' : ''
              }`} />
              <span>👥 Group Action &amp; Tasks</span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full font-black transition ${
                  activeTab === 'tasks'
                    ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-400/40'
                    : 'bg-indigo-950/40 text-indigo-300/80'
                }`}
              >
                {tasksCount.pending} open
              </span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
