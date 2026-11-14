import React from 'react';
import { 
  ShoppingCart, Shirt, Users, Cloud, CloudOff, 
  RefreshCw, Download, Upload, Sparkles, Layers 
} from 'lucide-react';

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
  return (
    <header className="sticky top-0 z-30 transition-all">
      {/* 🌟 Ultra-Frosted Dark Glass Top Bar */}
      <div className="glass-header-dark text-white px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Hub Branding with Glow Icon */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-linear-to-tr from-emerald-500 via-teal-400 to-indigo-500 p-2 rounded-2xl text-slate-950 shadow-lg glow-emerald flex items-center justify-center font-black animate-float">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5 drop-shadow-xs">
                  SmartCart &amp; Team Action Hub
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Glassmorphism Spec
                </span>
              </div>
              <p className="text-[11px] text-slate-300/80 hidden sm:block font-medium">
                Multi-Layered Grocery • Apparel Sizing • Real-Time Delegation
              </p>
            </div>
          </div>

          {/* Sync Status Badge & Quick Tools with Glassmorphic styling */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSyncModal}
              title="Click to configure Real-Time Multi-User Sync"
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-md backdrop-blur-xl ${
                connectionStatus.connected
                  ? 'bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/50 ring-2 ring-emerald-500/25 glow-emerald'
                  : 'bg-amber-400 text-slate-950 hover:bg-amber-300 font-extrabold animate-pulse-slow shadow-amber-400/25'
              }`}
            >
              {connectionStatus.connected ? (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span>Cloud Live Synced</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5" />
                  <span>Connect Multi-User Sync</span>
                </>
              )}
            </button>

            {/* Quick backup / restore tools */}
            <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-xl border border-white/15 backdrop-blur-xl shadow-xs">
              <button
                onClick={onExportData}
                title="Backup / Export JSON"
                className="p-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-white/15 transition"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onImportClick}
                title="Restore / Import JSON"
                className="p-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-white/15 transition"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onResetDefaults}
                title="Reset to Original Defaults"
                className="p-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-white/15 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 Translucent Glass Navigation Bar */}
      <div className="glass-nav-bar shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex space-x-2 py-2 overflow-x-auto" aria-label="Tabs">
            {/* 1. DMart Groceries Tab */}
            <button
              onClick={() => setActiveTab('dmart')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'dmart'
                  ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-md glow-emerald'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>🛒 DMart Grocery Cart</span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full font-extrabold transition ${
                  activeTab === 'dmart'
                    ? 'bg-emerald-800/80 text-white'
                    : 'bg-emerald-100/90 text-emerald-800'
                }`}
              >
                {itemsCount.pending} pending / {itemsCount.total}
              </span>
            </button>

            {/* 2. Dressing Shopping Cart Tab */}
            <button
              onClick={() => setActiveTab('clothing')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'clothing'
                  ? 'bg-linear-to-r from-pink-600 to-rose-600 text-white shadow-md glow-pink'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Shirt className="w-4 h-4" />
              <span>👗 Dressing Shopping Cart</span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full font-extrabold transition ${
                  activeTab === 'clothing'
                    ? 'bg-pink-800/80 text-white'
                    : 'bg-pink-100/90 text-pink-800'
                }`}
              >
                {clothingCount.pending} to buy / {clothingCount.total}
              </span>
            </button>

            {/* 3. Group Action & Tasks Tab */}
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'tasks'
                  ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md glow-indigo'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>👥 Group Action &amp; Tasks</span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full font-extrabold transition ${
                  activeTab === 'tasks'
                    ? 'bg-indigo-800/80 text-white'
                    : 'bg-indigo-100/90 text-indigo-800'
                }`}
              >
                {tasksCount.pending} open / {tasksCount.total}
              </span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
