import React, { useState, useEffect } from 'react';
import { 
  X, Cloud, CloudOff, Check, ShieldCheck, Key, Database, 
  ExternalLink, Copy, CheckCheck, RefreshCw, AlertCircle, Sparkles 
} from 'lucide-react';
import { 
  getStoredFirebaseConfig, 
  saveStoredFirebaseConfig 
} from '../services/syncService';

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
      // Check if user pasted JSON or JS object
      const dbUrlMatch = val.match(/databaseURL\s*:\s*["']([^"']+)["']/i);
      const apiKeyMatch = val.match(/apiKey\s*:\s*["']([^"']+)["']/i);
      const projMatch = val.match(/projectId\s*:\s*["']([^"']+)["']/i);

      if (dbUrlMatch) setDatabaseURL(dbUrlMatch[1]);
      if (apiKeyMatch) setApiKey(apiKeyMatch[1]);
      if (projMatch) setProjectId(projMatch[1]);

      // If pure JSON
      if (val.trim().startsWith('{')) {
        const parsed = JSON.parse(val);
        if (parsed.databaseURL) setDatabaseURL(parsed.databaseURL);
        if (parsed.apiKey) setApiKey(parsed.apiKey);
        if (parsed.projectId) setProjectId(parsed.projectId);
      }
    } catch (e) {
      // continue manual entry
    }
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (!databaseURL.trim() || !apiKey.trim()) {
      alert('Please enter at least Database URL and API Key.');
      return;
    }

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
    if (window.confirm('Disconnect from Cloud Database? App will switch to Local Storage mode.')) {
      saveStoredFirebaseConfig(null);
      onReconnect();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${
              connectionStatus.connected
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {connectionStatus.connected ? (
                <Cloud className="w-5 h-5" />
              ) : (
                <CloudOff className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Multi-User Live Cloud Sync
              </h2>
              <p className="text-xs text-slate-500">
                Sync items &amp; task assignments in real-time across all users &amp; phones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert */}
        <div className="p-4 border-b border-slate-100">
          <div className={`p-3 rounded-xl flex items-start gap-2.5 text-xs font-medium ${
            connectionStatus.connected
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-amber-50 text-amber-900 border border-amber-200'
          }`}>
            {connectionStatus.connected ? (
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <span className="font-bold">
                {connectionStatus.connected ? 'Status: Live Synced' : 'Status: Local Storage Only'}
              </span>
              <p className="mt-0.5 opacity-90">{connectionStatus.message}</p>
            </div>
          </div>
        </div>

        {/* Tabs: Quick Setup vs Guide */}
        <div className="px-5 pt-3 flex gap-2 border-b border-slate-100">
          <button
            onClick={() => setActiveTab('quick')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'quick'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            ⚡ Connect Database
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            📖 60-Second Free Setup Guide
          </button>
        </div>

        {/* Tab 1: Connect Form */}
        {activeTab === 'quick' && (
          <form onSubmit={handleSaveConfig} className="p-5 space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              To allow <strong>all users on different phones/laptops</strong> to see and update the list in real-time, connect a free Firebase Realtime Database. Once connected, changes update immediately without refreshing!
            </p>

            {/* Quick paste textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Paste Firebase Config snippet (Auto-Fill)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Paste the 'const firebaseConfig = { ... }' snippet here, or enter fields below..."
                value={configInput}
                onChange={(e) => handleQuickPasteChange(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Database URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-slate-400" />
                <span>Firebase Database URL *</span>
              </label>
              <input
                type="text"
                required
                placeholder="https://your-project-id-default-rtdb.firebaseio.com"
                value={databaseURL}
                onChange={(e) => setDatabaseURL(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* API Key */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                <span>Firebase API Key *</span>
              </label>
              <input
                type="text"
                required
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Project ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Project ID (Optional)
              </label>
              <input
                type="text"
                placeholder="my-dmart-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {connectionStatus.connected ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                >
                  Disconnect Cloud
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition"
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
          <div className="p-5 space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900 font-medium">
              💡 <strong>Free &amp; Zero-Maintenance:</strong> Google Firebase provides a free Realtime Database with 1GB storage and 100 simultaneous connections, perfect for group grocery &amp; team task tracking.
            </div>

            <ol className="list-decimal pl-5 space-y-2.5">
              <li>
                Visit{' '}
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 font-bold underline inline-flex items-center gap-0.5"
                >
                  console.firebase.google.com <ExternalLink className="w-3 h-3" />
                </a>{' '}
                and click <strong>Add project</strong> (e.g. "dmart-team").
              </li>
              <li>
                In the left menu, click <strong>Build</strong> &rarr; <strong>Realtime Database</strong> &rarr; click <strong>Create Database</strong>.
              </li>
              <li>
                Select your closest location, and choose <strong>Start in test mode</strong> (allows read &amp; write for team members).
              </li>
              <li>
                Click on the <strong>Project settings</strong> gear icon (top left) &rarr; scroll to <strong>Your apps</strong> &rarr; click the <strong>Web (&lt;/&gt;)</strong> icon.
              </li>
              <li>
                Copy the <code>firebaseConfig</code> values (specifically <code>databaseURL</code> and <code>apiKey</code>) and paste them in the <strong>Connect Database</strong> tab!
              </li>
            </ol>

            <div className="pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-800 mb-1">
                Hosting on Vercel with Environment Variables:
              </h4>
              <p className="text-slate-500 mb-2">
                You can also add these in Vercel under <em>Settings &rarr; Environment Variables</em>:
              </p>
              <pre className="bg-slate-900 text-emerald-300 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
{`VITE_FIREBASE_DATABASE_URL=https://your-db.firebaseio.com
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_PROJECT_ID=dmart-team`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

