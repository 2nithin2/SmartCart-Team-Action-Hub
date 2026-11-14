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
      {/* 🌟 Atmospheric Glass Header */}
      <div className="glass-header text-slate-100 px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Hub Branding with Indigo/Pink Glow */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-linear-to-tr from-indigo-500 via-purple-500 to-pink-500 p-2 rounded-2xl text-white shadow-lg glow-indigo flex items-center justify-center font-black">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-slate-50 flex items-center gap-1.5 drop-shadow-sm">
                  SmartCart &amp; Team Action Hub
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-xs backdrop-blur-md">
                  UI Design Kit
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
                Multi-Layered Grocery • Apparel Sizing • Real-Time Delegation
              </p>
            </div>
          </div>

          {/* Sync Status Badge & Quick Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSyncModal}
              title="Click to configure Real-Time Multi-User Sync"
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-md backdrop-blur-xl ${
                connectionStatus.connected
                  ? 'bg-slate-900/80 text-emerald-300 hover:bg-slate-800 border border-emerald-500/40 glow-emerald'
                  : 'bg-amber-400 text-slate-950 hover:bg-amber-300 font-extrabold shadow-amber-400/25'
              }`}
            >
              {connectionStatus.connected ? (
                <>
                  {/* Ready-to-Drop Pulsing Live-Sync Radar SVG */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                    <circle cx="12" cy="12" r="4" fill="#10b981">
                      <animate attributeName="r" values="3;7;3" dur="2s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="12" cy="12" r="9" stroke="#10b981" stroke-width="1.5" stroke-opacity="0.5"/>
                  </svg>
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
            <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-xl border border-white/10 backdrop-blur-xl shadow-xs">
              <button
                onClick={onExportData}
                title="Backup / Export JSON"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onImportClick}
                title="Restore / Import JSON"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onResetDefaults}
                title="Reset to Original Defaults"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 Translucent Glass Navigation Bar */}
      <div className="bg-slate-950/60 backdrop-blur-md border-b border-white/10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex space-x-2 py-2 overflow-x-auto" aria-label="Tabs">
            {/* 1. DMart Groceries Tab */}
            <button
              onClick={() => setActiveTab('dmart')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                activeTab === 'dmart'
                  ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white shadow-lg glow-emerald'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>🛒 DMart Grocery Cart</span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full font-extrabold transition ${
                  activeTab === 'dmart'
                    ? 'bg-emerald-900/90 text-emerald-100 border border-emerald-400/30'
                    : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/20'
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
                  ? 'bg-linear-to-r from-pink-600 to-rose-600 text-white shadow-lg glow-pink'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              <Shirt className="w-4 h-4" />
              <span>👗 Dressing Shopping Cart</span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full font-extrabold transition ${
                  activeTab === 'clothing'
                    ? 'bg-pink-900/90 text-pink-100 border border-pink-400/30'
                    : 'bg-pink-950/60 text-pink-300 border border-pink-500/20'
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
                  ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-lg glow-indigo'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>👥 Group Action &amp; Tasks</span>
              <span
                className={`px-2 py-0.5 text-xs rounded-full font-extrabold transition ${
                  activeTab === 'tasks'
                    ? 'bg-indigo-900/90 text-indigo-100 border border-indigo-400/30'
                    : 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/20'
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
