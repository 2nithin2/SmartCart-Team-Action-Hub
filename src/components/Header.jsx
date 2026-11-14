import React from 'react';
import { ShoppingCart, CheckSquare, Users, Cloud, CloudOff, RefreshCw, Download, Upload, ShieldCheck } from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  itemsCount,
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
      <div className="bg-emerald-700 text-white px-4 py-2">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-2.5">
            <div className="bg-white p-1.5 rounded-lg text-emerald-700 shadow-xs flex items-center justify-center font-black tracking-wider text-sm">
              DMart
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight flex items-center gap-2">
                DMart Grocery & Team Sync
              </h1>
              <p className="text-xs text-emerald-100 hidden sm:block">
                Multi-user real-time follow-up list &amp; group task assigner
              </p>
            </div>
          </div>

          {/* Sync Status Badge */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSyncModal}
              title="Click to configure Real-Time Multi-User Sync"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition shadow-xs ${
                connectionStatus.connected
                  ? 'bg-emerald-800 text-emerald-100 hover:bg-emerald-900 border border-emerald-500'
                  : 'bg-amber-500 text-slate-900 hover:bg-amber-400 font-semibold animate-pulse'
              }`}
            >
              {connectionStatus.connected ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Realtime Cloud Synced</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5" />
                  <span>Connect Multi-User Sync</span>
                </>
              )}
            </button>

            {/* Quick backup dropdown/buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={onExportData}
                title="Backup / Export JSON"
                className="p-1.5 rounded bg-emerald-800/80 hover:bg-emerald-800 text-emerald-100 transition"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onImportClick}
                title="Restore / Import JSON"
                className="p-1.5 rounded bg-emerald-800/80 hover:bg-emerald-800 text-emerald-100 transition"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onResetDefaults}
                title="Reset to Original docx 81 items"
                className="p-1.5 rounded bg-emerald-800/80 hover:bg-emerald-800 text-emerald-100 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="max-w-6xl mx-auto px-4">
        <nav className="flex space-x-2 py-2.5 overflow-x-auto" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('dmart')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === 'dmart'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>DMart Shopping List</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                activeTab === 'dmart'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {itemsCount.pending} pending / {itemsCount.total}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Group Action &amp; Task Assign</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                activeTab === 'tasks'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-200 text-slate-700'
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
