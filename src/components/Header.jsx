import React from 'react';
import { 
  ShoppingCart, Shirt, Users, Cloud, CloudOff, 
  RefreshCw, Download, Upload, Sparkles 
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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Logo & Hub Title */}
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500 p-1.5 rounded-xl text-slate-950 shadow-xs flex items-center justify-center font-black tracking-tight text-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight flex items-center gap-2 text-white">
                SmartCart &amp; Team Action Hub
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                DMart Grocery Cart • Dressing &amp; Apparel Cart • Group Action &amp; Task Delegator
              </p>
            </div>
          </div>

          {/* Sync Status Badge & Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSyncModal}
              title="Click to configure Real-Time Multi-User Sync"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition shadow-xs ${
                connectionStatus.connected
                  ? 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-500'
                  : 'bg-amber-400 text-slate-950 hover:bg-amber-300 animate-pulse'
              }`}
            >
              {connectionStatus.connected ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Realtime Live Synced</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5" />
                  <span>Connect Multi-User Sync</span>
                </>
              )}
            </button>

            {/* Quick backup / restore tools */}
            <div className="flex items-center gap-1">
              <button
                onClick={onExportData}
                title="Backup / Export JSON"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onImportClick}
                title="Restore / Import JSON"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onResetDefaults}
                title="Reset to Original Defaults"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="max-w-6xl mx-auto px-4">
        <nav className="flex space-x-2 py-2 overflow-x-auto" aria-label="Tabs">
          {/* 1. DMart Groceries Tab */}
          <button
            onClick={() => setActiveTab('dmart')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition whitespace-nowrap ${
              activeTab === 'dmart'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>🛒 DMart Grocery Cart</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                activeTab === 'dmart'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {itemsCount.pending} pending / {itemsCount.total}
            </span>
          </button>

          {/* 2. Dressing Shopping Cart Tab */}
          <button
            onClick={() => setActiveTab('clothing')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition whitespace-nowrap ${
              activeTab === 'clothing'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Shirt className="w-4 h-4" />
            <span>👗 Dressing Shopping Cart</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                activeTab === 'clothing'
                  ? 'bg-pink-700 text-white'
                  : 'bg-pink-100 text-pink-800'
              }`}
            >
              {clothingCount.pending} to buy / {clothingCount.total}
            </span>
          </button>

          {/* 3. Group Action & Tasks Tab */}
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>👥 Group Action &amp; Task Assign</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                activeTab === 'tasks'
                  ? 'bg-indigo-700 text-white'
                  : 'bg-indigo-100 text-indigo-800'
              }`}
            >
              {tasksCount.pending} open / {tasksCount.total}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
}
