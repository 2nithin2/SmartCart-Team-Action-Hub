import React, { useState, useEffect } from 'react';
import { 
  X, Cloud, CloudOff, Check, ShieldCheck, Key, Database, 
  ExternalLink, Copy, CheckCheck, RefreshCw, AlertCircle, Sparkles 
} from 'lucide-react';
import { 
  getStoredFirebaseConfig, 
  saveStoredFirebaseConfig 
} from '../services/syncService';
import { haptics } from '../utils/haptics';

export default function CloudSyncModal({
  isOpen,
  onClose,
  connectionStatus,
  onReconnect
}) {
  const [configInput, setConfigInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [databaseURL, setDatabaseURL] = useState('');
  const [projectId, setProjectId] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('quick'); // 'quick' | 'guide'

  useEffect(() => {
    const existing = getStoredFirebaseConfig();
    if (existing) {
      setApiKey(existing.apiKey || '');
      setDatabaseURL(existing.databaseURL || '');
      setProjectId(existing.projectId || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Auto-parse if user pastes full firebaseConfig block
  const handleQuickPasteChange = (val) => {
    setConfigInput(val);

    try {
      const dbUrlMatch = val.match(/databaseURL\s*:\s*["']([^"']+)["']/i);
      const apiKeyMatch = val.match(/apiKey\s*:\s*["']([^"']+)["']/i);
      const projMatch = val.match(/projectId\s*:\s*["']([^"']+)["']/i);

      if (dbUrlMatch) setDatabaseURL(dbUrlMatch[1]);
      if (apiKeyMatch) setApiKey(apiKeyMatch[1]);
      if (projMatch) setProjectId(projMatch[1]);

      if (val.trim().startsWith('{')) {
        const parsed = JSON.parse(val);
        if (parsed.databaseURL) setDatabaseURL(parsed.databaseURL);
        if (parsed.apiKey) setApiKey(parsed.apiKey);
        if (parsed.projectId) setProjectId(parsed.projectId);
      }
    } catch (e) {
      // ignore parse errors during typing
    }
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (!databaseURL.trim() || !apiKey.trim()) {
      alert('Please enter at least Database URL and API Key.');
      return;
    }

    haptics.success();
    const config = {
      apiKey: apiKey.trim(),
      databaseURL: databaseURL.trim(),
      projectId: projectId.trim() || 'dmart-sync',
      authDomain: `${projectId.trim() || 'dmart-sync'}.firebaseapp.com`
    };

    saveStoredFirebaseConfig(config);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onReconnect();
      onClose();
    }, 800);
  };

  const handleDisconnect = () => {
    haptics.warning();
    if (window.confirm('Disconnect from Cloud Database? App will switch to Local Storage mode.')) {
      saveStoredFirebaseConfig(null);
      onReconnect();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="dark-glass-card bg-slate-900/95 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-emerald-500/40 text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-emerald-500/20 bg-slate-950/60 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${
              connectionStatus.connected
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              {connectionStatus.connected ? (
                <Cloud className="w-5 h-5 text-emerald-400" />
              ) : (
                <CloudOff className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight">
                Multi-User Live Cloud Sync
              </h2>
              <p className="text-xs text-emerald-200/70 font-medium">
                Sync items &amp; task assignments in real-time across all users &amp; phones
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              haptics.tick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert */}
        <div className="p-4 border-b border-emerald-500/20">
          <div className={`p-3.5 rounded-xl flex items-start gap-2.5 text-xs font-semibold ${
            connectionStatus.connected
              ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-500/40'
              : 'bg-amber-950/60 text-amber-200 border border-amber-500/40'
          }`}>
            {connectionStatus.connected ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <span className="font-extrabold">
                {connectionStatus.connected ? 'Status: Live Synced' : 'Status: Local Storage Only'}
              </span>
              <p className="mt-0.5 font-normal opacity-90">{connectionStatus.message}</p>
            </div>
          </div>
        </div>

        {/* Tabs: Quick Setup vs Guide */}
        <div className="px-5 pt-3 flex gap-2 border-b border-emerald-500/20">
          <button
            onClick={() => {
              haptics.selection();
              setActiveTab('quick');
            }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'quick'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Connect Database
          </button>
          <button
            onClick={() => {
              haptics.selection();
              setActiveTab('guide');
            }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'guide'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            📖 60-Second Free Setup Guide
          </button>
        </div>

        {/* Tab 1: Connect Form */}
        {activeTab === 'quick' && (
          <form onSubmit={handleSaveConfig} className="p-5 space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              To allow <strong>all users on different phones/laptops</strong> to see and update the list in real-time, connect a free Firebase Realtime Database. Once connected, changes update immediately without refreshing!
            </p>

            <div>
              <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Paste Firebase Config snippet (Auto-Fill)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Paste the 'const firebaseConfig = { ... }' snippet here, or enter fields below..."
                value={configInput}
                onChange={(e) => handleQuickPasteChange(e.target.value)}
                className="dark-glass-input w-full px-3.5 py-2 text-xs font-mono rounded-xl focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Firebase Database URL *</span>
              </label>
              <input
                type="text"
                required
                placeholder="https://your-project-id-default-rtdb.firebaseio.com"
                value={databaseURL}
                onChange={(e) => setDatabaseURL(e.target.value)}
                className="dark-glass-input w-full px-3.5 py-2 text-xs font-mono rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                <span>Firebase API Key *</span>
              </label>
              <input
                type="text"
                required
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="dark-glass-input w-full px-3.5 py-2 text-xs font-mono rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                Project ID (Optional)
              </label>
              <input
                type="text"
                placeholder="my-dmart-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="dark-glass-input w-full px-3.5 py-2 text-xs font-mono rounded-xl focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-emerald-500/20">
              {connectionStatus.connected ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-xl transition"
                >
                  Disconnect Cloud
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    haptics.tick();
                    onClose();
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-900/40 transition hover-wiggle"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Connected!</span>
                    </>
                  ) : (
                    <>
                      <Cloud className="w-4 h-4" />
                      <span>Save &amp; Connect Live</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab 2: Step-by-Step Guide */}
        {activeTab === 'guide' && (
          <div className="p-5 space-y-4 text-xs text-slate-200 leading-relaxed font-normal">
            <div className="bg-emerald-950/60 p-3.5 rounded-xl border border-emerald-500/40 text-emerald-200 font-medium">
              💡 <strong>Free &amp; Zero-Maintenance:</strong> Google Firebase provides a free Realtime Database with 1GB storage and 100 simultaneous connections, perfect for group grocery &amp; team task tracking.
            </div>

            <ol className="list-decimal pl-5 space-y-2.5 text-slate-300">
              <li>
                Visit{' '}
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 font-bold underline inline-flex items-center gap-0.5"
                >
                  console.firebase.google.com <ExternalLink className="w-3 h-3" />
                </a>{' '}
                and click <strong>Add project</strong>.
              </li>
              <li>
                In the left menu, click <strong>Build</strong> &rarr; <strong>Realtime Database</strong> &rarr; click <strong>Create Database</strong>.
              </li>
              <li>
                Select location &rarr; choose <strong>Start in test mode</strong>.
              </li>
              <li>
                Click <strong>Project settings (⚙️)</strong> &rarr; scroll to <strong>Your apps</strong> &rarr; click <strong>Web (&lt;/&gt;)</strong>.
              </li>
              <li>
                Copy the <code>firebaseConfig</code> values and paste them in the <strong>Connect Database</strong> tab!
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
