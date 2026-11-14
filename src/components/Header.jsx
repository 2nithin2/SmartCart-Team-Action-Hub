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
      {/* Top Frosted Bar with Glassmorphic styling */}
      <div className="glass-header text-white px-4 py-2.5 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Hub Branding */}
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-linear-to-tr from-emerald-500 to-teal-400 p-2 rounded-xl text-slate-950 shadow-md flex items-center justify-center font-black">
              <Sparkles className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  SmartCart &amp; Team Action Hub
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  v3.0 Live Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Zone-Based Grocery • Apparel Fitting • Real-Time Delegation
              </p>
            </div>
          </div>

          {/* Sync Status Badge & Quick Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSyncModal}
              title="Click to configure Real-Time Multi-User Sync"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition shadow-sm backdrop-blur-md ${
                connectionStatus.connected
                  ? 'bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900/90 border border-emerald-500/60 ring-2 ring-emerald-500/20'
                  : 'bg-amber-400/90 text-slate-950 hover:bg-amber-300 font-bold animate-pulse-slow shadow-amber-500/20'
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
                  <span>Connect Multi-User Sync</span>
                </>
              )}
            </button>

            {/* Quick backup / restore tools */}
            <div className="flex items-center gap-1 bg-slate-800/60 p-0.5 rounded-xl border border-white/10 backdrop-blur-md">
              <button
                onClick={onExportData}
                title="Backup / Export JSON"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onImportClick}
                title="Restore / Import JSON"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onResetDefaults}
                title="Reset to Original Defaults"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation with Glassmorphism */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/60 shadow-xs">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex space-x-2 py-2 overflow-x-auto" aria-label="Tabs">
            {/* 1. DMart Groceries Tab */}
            <button
              onClick={() => setActiveTab('dmart')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition whitespace-nowrap ${
                activeTab === 'dmart'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-emerald-50/70'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>🛒 DMart Grocery Cart</span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full font-bold transition ${
                  activeTab === 'dmart'
                    ? 'bg-emerald-700/80 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {itemsCount.pending} pending / {itemsCount.total}
              </span>
            </button>

            {/* 2. Dressing Shopping Cart Tab */}
            <button
              onClick={() => setActiveTab('clothing')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition whitespace-nowrap ${
                activeTab === 'clothing'
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-pink-50/70'
              }`}
            >
              <Shirt className="w-4 h-4" />
              <span>👗 Dressing Shopping Cart</span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full font-bold transition ${
                  activeTab === 'clothing'
                    ? 'bg-pink-700/80 text-white'
                    : 'bg-pink-100 text-pink-800'
                }`}
              >
                {clothingCount.pending} to buy / {clothingCount.total}
              </span>
            </button>

            {/* 3. Group Action & Tasks Tab */}
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition whitespace-nowrap ${
                activeTab === 'tasks'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-indigo-50/70'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>👥 Group Action &amp; Tasks</span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full font-bold transition ${
                  activeTab === 'tasks'
                    ? 'bg-indigo-700/80 text-white'
                    : 'bg-indigo-100 text-indigo-800'
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
