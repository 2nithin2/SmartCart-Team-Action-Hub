import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import DmartList from './components/DmartList';
import ClothingList from './components/ClothingList';
import GroupTasks from './components/GroupTasks';
import ItemModal from './components/ItemModal';
import ClothingModal from './components/ClothingModal';
import CloudSyncModal from './components/CloudSyncModal';
import { 
  subscribeToSync, 
  syncSaveItems, 
  syncSaveClothing,
  syncSaveTasks, 
  syncSaveMembers,
  exportAllData,
  importAllData,
  resetAllToDefaults
} from './services/syncService';
import { normalizeItem } from './data/seedItems';
import { ShoppingCart, Shirt, Users, Sparkles, TrendingUp } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dmart'); // 'dmart' | 'clothing' | 'tasks'
  const [items, setItems] = useState([]);
  const [clothingItems, setClothingItems] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    mode: 'local',
    message: 'Initializing...'
  });

  // Grocery Item Modal
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  // Clothing Modal
  const [isClothingModalOpen, setIsClothingModalOpen] = useState(false);
  const [clothingToEdit, setClothingToEdit] = useState(null);

  // Cloud Sync Modal
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Hidden file input for importing backup JSON
  const fileInputRef = useRef(null);

  // Re-subscribe trigger
  const [syncKey, setSyncKey] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToSync({
      onItemsChange: (newItems) => {
        setItems(newItems.map(normalizeItem));
      },
      onClothingChange: (newClothing) => {
        setClothingItems(newClothing.map(normalizeItem));
      },
      onTasksChange: (newTasks) => {
        setTasks(newTasks);
      },
      onMembersChange: (newMembers) => {
        setTeamMembers(newMembers);
      },
      onConnectionStatus: (status) => {
        setConnectionStatus(status);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [syncKey]);

  // Compute existing grocery floors
  const existingFloors = React.useMemo(() => {
    const set = new Set(['1st Floor', '2nd Floor']);
    items.forEach((i) => {
      if (i.floor) set.add(i.floor);
    });
    return Array.from(set);
  }, [items]);

  // Items stats
  const itemsCount = React.useMemo(() => {
    const total = items.length;
    const completed = items.filter((i) => i.status === 'completed').length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [items]);

  // Clothing stats
  const clothingCount = React.useMemo(() => {
    const total = clothingItems.length;
    const purchased = clothingItems.filter((c) => c.trialStatus === 'purchased').length;
    const pending = total - purchased;
    return { total, purchased, pending };
  }, [clothingItems]);

  // Tasks stats
  const tasksCount = React.useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status !== 'completed').length;
    return { total, pending };
  }, [tasks]);

  // Grocery Handlers
  const handleAddItem = async (newItem) => {
    const normalized = normalizeItem(newItem, items.length);
    const updated = [normalized, ...items];
    setItems(updated);
    await syncSaveItems(updated);
  };

  const handleUpdateItem = async (updatedItem) => {
    const normalized = normalizeItem(updatedItem);
    const targetId = normalized.itemId || normalized.id;
    const updated = items.map((i) => ((i.itemId === targetId || i.id === targetId) ? normalized : i));
    setItems(updated);
    await syncSaveItems(updated);
  };

  const handleDeleteItem = async (itemId) => {
    const updated = items.filter((i) => (i.itemId !== itemId && i.id !== itemId));
    setItems(updated);
    await syncSaveItems(updated);
  };

  // Clothing Handlers
  const handleAddClothing = async (newClothing) => {
    const normalized = normalizeItem(newClothing, clothingItems.length);
    const updated = [normalized, ...clothingItems];
    setClothingItems(updated);
    await syncSaveClothing(updated);
  };

  const handleUpdateClothing = async (updatedClothing) => {
    const normalized = normalizeItem(updatedClothing);
    const targetId = normalized.itemId || normalized.id;
    const updated = clothingItems.map((c) => ((c.itemId === targetId || c.id === targetId) ? normalized : c));
    setClothingItems(updated);
    await syncSaveClothing(updated);
  };

  const handleDeleteClothing = async (clothingId) => {
    const updated = clothingItems.filter((c) => (c.itemId !== clothingId && c.id !== clothingId));
    setClothingItems(updated);
    await syncSaveClothing(updated);
  };

  // Task Handlers
  const handleAddTask = async (newTask) => {
    const updated = [newTask, ...tasks];
    setTasks(updated);
    await syncSaveTasks(updated);
  };

  const handleUpdateTask = async (updatedTask) => {
    const updated = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    setTasks(updated);
    await syncSaveTasks(updated);
  };

  const handleDeleteTask = async (taskId) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    await syncSaveTasks(updated);
  };

  // Member Handlers
  const handleAddMember = async (name) => {
    if (!name || teamMembers.includes(name)) return;
    const updated = [...teamMembers, name];
    setTeamMembers(updated);
    await syncSaveMembers(updated);
  };

  // Reset to original defaults
  const handleResetDefaults = async () => {
    if (window.confirm('Reset everything to original defaults (DMart groceries, clothing list, and group tasks)?')) {
      await resetAllToDefaults();
      setSyncKey((k) => k + 1);
    }
  };

  // Export JSON backup
  const handleExportData = () => {
    const jsonStr = exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smartcart-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const content = ev.target?.result;
      if (typeof content === 'string') {
        const res = await importAllData(content);
        if (res.success) {
          alert('Data imported successfully!');
          setSyncKey((k) => k + 1);
        } else {
          alert(`Import failed: ${res.error}`);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="relative min-h-screen flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* 🌈 RADIANT AMBIENT GLOW ORBS (Provides the vibrant backdrop for Glassmorphism) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Emerald Glow Top-Left */}
        <div className="absolute -top-32 -left-32 w-[34rem] h-[34rem] bg-emerald-400/30 rounded-full blur-[100px] animate-pulse-slow"></div>
        {/* Indigo Glow Top-Right */}
        <div className="absolute top-10 -right-28 w-[32rem] h-[32rem] bg-indigo-500/25 rounded-full blur-[110px] animate-float"></div>
        {/* Rose Glow Center-Right */}
        <div className="absolute top-[40%] right-[10%] w-[28rem] h-[28rem] bg-pink-400/20 rounded-full blur-[100px]"></div>
        {/* Amber / Yellow Glow Bottom-Left */}
        <div className="absolute bottom-10 left-[15%] w-[30rem] h-[30rem] bg-amber-400/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        {/* Teal Glow Bottom-Right */}
        <div className="absolute -bottom-20 -right-20 w-[28rem] h-[28rem] bg-teal-400/25 rounded-full blur-[90px]"></div>
      </div>

      {/* Frosted Glass Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        itemsCount={itemsCount}
        clothingCount={clothingCount}
        tasksCount={tasksCount}
        connectionStatus={connectionStatus}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onResetDefaults={handleResetDefaults}
        onExportData={handleExportData}
        onImportClick={() => fileInputRef.current?.click()}
      />

      {/* Hidden File Input for Data Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        accept=".json"
        className="hidden"
      />

      {/* Main Glassmorphic Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 pt-5 pb-8">
        {/* 🌟 Stylish Landing Page Hub Overview Hero Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {/* Card 1: Groceries */}
          <button
            onClick={() => setActiveTab('dmart')}
            className={`glass-card glass-card-hover rounded-2xl p-4 text-left transition-all relative overflow-hidden group ${
              activeTab === 'dmart' ? 'ring-2 ring-emerald-500/60 shadow-lg glow-emerald' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-700">
                <ShoppingCart className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {itemsCount.pending} To Buy
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-800 mt-2.5 group-hover:text-emerald-700 transition">
              DMart Grocery Cart
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              1st &amp; 2nd Floor staples, spices &amp; household
            </p>
            <div className="mt-3 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>{itemsCount.completed} / {itemsCount.total} Picked</span>
              <span className="text-[11px] opacity-75">
                {itemsCount.total > 0 ? Math.round((itemsCount.completed / itemsCount.total) * 100) : 0}%
              </span>
            </div>
          </button>

          {/* Card 2: Dressing */}
          <button
            onClick={() => setActiveTab('clothing')}
            className={`glass-card glass-card-hover rounded-2xl p-4 text-left transition-all relative overflow-hidden group ${
              activeTab === 'clothing' ? 'ring-2 ring-pink-500/60 shadow-lg glow-pink' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-pink-500/15 text-pink-700">
                <Shirt className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-pink-100 text-pink-800">
                {clothingCount.pending} In Cart
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-800 mt-2.5 group-hover:text-pink-700 transition">
              Dressing &amp; Apparel Cart
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sizes, colors &amp; trial room fitting status
            </p>
            <div className="mt-3 flex items-center justify-between text-xs font-bold text-pink-700">
              <span>{clothingCount.purchased} / {clothingCount.total} Bought</span>
              <span className="text-[11px] opacity-75">
                {clothingCount.total > 0 ? Math.round((clothingCount.purchased / clothingCount.total) * 100) : 0}%
              </span>
            </div>
          </button>

          {/* Card 3: Group Tasks */}
          <button
            onClick={() => setActiveTab('tasks')}
            className={`glass-card glass-card-hover rounded-2xl p-4 text-left transition-all relative overflow-hidden group ${
              activeTab === 'tasks' ? 'ring-2 ring-indigo-500/60 shadow-lg glow-indigo' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-700">
                <Users className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                {tasksCount.pending} Open
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-800 mt-2.5 group-hover:text-indigo-700 transition">
              Group Action &amp; Tasks
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned follow-ups, price checks &amp; billing
            </p>
            <div className="mt-3 flex items-center justify-between text-xs font-bold text-indigo-700">
              <span>{teamMembers.length} Collaborators</span>
              <span className="text-[11px] opacity-75">
                {tasksCount.total - tasksCount.pending} Done
              </span>
            </div>
          </button>
        </div>

        {/* Tab Views */}
        {activeTab === 'dmart' && (
          <DmartList
            items={items}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItem}
            onOpenAddModal={() => {
              setItemToEdit(null);
              setIsItemModalOpen(true);
            }}
            onOpenEditModal={(item) => {
              setItemToEdit(item);
              setIsItemModalOpen(true);
            }}
            teamMembers={teamMembers}
            existingFloors={existingFloors}
          />
        )}

        {activeTab === 'clothing' && (
          <ClothingList
            clothingItems={clothingItems}
            onUpdateClothing={handleUpdateClothing}
            onDeleteClothing={handleDeleteClothing}
            onAddClothing={handleAddClothing}
            onOpenAddModal={() => {
              setClothingToEdit(null);
              setIsClothingModalOpen(true);
            }}
            onOpenEditModal={(clothing) => {
              setClothingToEdit(clothing);
              setIsClothingModalOpen(true);
            }}
            teamMembers={teamMembers}
          />
        )}

        {activeTab === 'tasks' && (
          <GroupTasks
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            teamMembers={teamMembers}
            onAddMember={handleAddMember}
          />
        )}
      </main>

      {/* DMart Grocery Modal */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={(itemData) => {
          if (itemToEdit) {
            handleUpdateItem(itemData);
          } else {
            handleAddItem(itemData);
          }
        }}
        itemToEdit={itemToEdit}
        existingFloors={existingFloors}
        teamMembers={teamMembers}
      />

      {/* Clothing Modal */}
      <ClothingModal
        isOpen={isClothingModalOpen}
        onClose={() => setIsClothingModalOpen(false)}
        onSave={(clothingData) => {
          if (clothingToEdit) {
            handleUpdateClothing(clothingData);
          } else {
            handleAddClothing(clothingData);
          }
        }}
        itemToEdit={clothingToEdit}
        teamMembers={teamMembers}
      />

      {/* Cloud Sync Setup Modal */}
      <CloudSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        connectionStatus={connectionStatus}
        onReconnect={() => setSyncKey((k) => k + 1)}
      />

      {/* Floating Bottom Navigation for Mobile (Glassmorphic) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 glass-panel bg-white/90 border-t border-slate-200/80 py-2.5 px-4 flex justify-around items-center z-20 shadow-xl">
        <button
          onClick={() => setActiveTab('dmart')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-bold transition ${
            activeTab === 'dmart' ? 'text-emerald-700' : 'text-slate-500'
          }`}
        >
          <span>🛒 DMart</span>
          <span className="text-[10px] opacity-75">{itemsCount.pending}</span>
        </button>

        <div className="h-6 w-px bg-slate-200" />

        <button
          onClick={() => setActiveTab('clothing')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-bold transition ${
            activeTab === 'clothing' ? 'text-pink-600' : 'text-slate-500'
          }`}
        >
          <span>👗 Clothes</span>
          <span className="text-[10px] opacity-75">{clothingCount.pending}</span>
        </button>

        <div className="h-6 w-px bg-slate-200" />

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-bold transition ${
            activeTab === 'tasks' ? 'text-indigo-700' : 'text-slate-500'
          }`}
        >
          <span>👥 Tasks</span>
          <span className="text-[10px] opacity-75">{tasksCount.pending}</span>
        </button>
      </div>
    </div>
  );
}
