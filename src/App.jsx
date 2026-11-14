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
import { haptics } from './utils/haptics';

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
    haptics.success();
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
    haptics.warning();
    const updated = items.filter((i) => (i.itemId !== itemId && i.id !== itemId));
    setItems(updated);
    await syncSaveItems(updated);
  };

  // Clothing Handlers
  const handleAddClothing = async (newClothing) => {
    haptics.success();
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
    haptics.warning();
    const updated = clothingItems.filter((c) => (c.itemId !== clothingId && c.id !== clothingId));
    setClothingItems(updated);
    await syncSaveClothing(updated);
  };

  // Task Handlers
  const handleAddTask = async (newTask) => {
    haptics.success();
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
    haptics.warning();
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    await syncSaveTasks(updated);
  };

  // Member Handlers
  const handleAddMember = async (name) => {
    if (!name || teamMembers.includes(name)) return;
    haptics.click();
    const updated = [...teamMembers, name];
    setTeamMembers(updated);
    await syncSaveMembers(updated);
  };

  // Reset to original defaults
  const handleResetDefaults = async () => {
    if (window.confirm('Reset everything to original defaults (DMart groceries, clothing list, and group tasks)?')) {
      haptics.warning();
      await resetAllToDefaults();
      setSyncKey((k) => k + 1);
    }
  };

  // Export JSON backup
  const handleExportData = () => {
    haptics.click();
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
          haptics.success();
          alert('Data imported successfully!');
          setSyncKey((k) => k + 1);
        } else {
          haptics.warning();
          alert(`Import failed: ${res.error}`);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Determine active dark theme class
  const activeThemeClass = 
    activeTab === 'dmart' 
      ? 'theme-dmart' 
      : activeTab === 'clothing' 
      ? 'theme-clothing' 
      : 'theme-tasks';

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-500 ${activeThemeClass}`}>
      {/* Frosted Header with Navigation and Sync Status */}
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

      {/* Main Container - Focused exclusively on the selected cart (isolated per user request) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 pt-4 pb-8">
        {/* Only the selected cart is rendered */}
        {activeTab === 'dmart' && (
          <DmartList
            items={items}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItem}
            onOpenAddModal={() => {
              haptics.click();
              setItemToEdit(null);
              setIsItemModalOpen(true);
            }}
            onOpenEditModal={(item) => {
              haptics.click();
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
              haptics.click();
              setClothingToEdit(null);
              setIsClothingModalOpen(true);
            }}
            onOpenEditModal={(clothing) => {
              haptics.click();
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

      {/* Floating Bottom Navigation for Mobile (Glassmorphic & Haptic) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 dark-glass-header border-t border-white/10 py-2.5 px-4 flex justify-around items-center z-20 shadow-2xl backdrop-blur-2xl">
        <button
          onClick={() => {
            haptics.selection();
            setActiveTab('dmart');
          }}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-black transition-all ${
            activeTab === 'dmart' ? 'text-emerald-400 scale-105' : 'text-slate-400 opacity-60'
          }`}
        >
          <span>🛒 DMart</span>
          <span className="text-[10px] px-1.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-extrabold">{itemsCount.pending}</span>
        </button>

        <div className="h-6 w-px bg-white/10" />

        <button
          onClick={() => {
            haptics.selection();
            setActiveTab('clothing');
          }}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-black transition-all ${
            activeTab === 'clothing' ? 'text-pink-400 scale-105' : 'text-slate-400 opacity-60'
          }`}
        >
          <span>👗 Clothes</span>
          <span className="text-[10px] px-1.5 rounded-full bg-pink-950/80 text-pink-300 border border-pink-500/30 font-extrabold">{clothingCount.pending}</span>
        </button>

        <div className="h-6 w-px bg-white/10" />

        <button
          onClick={() => {
            haptics.selection();
            setActiveTab('tasks');
          }}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-black transition-all ${
            activeTab === 'tasks' ? 'text-indigo-400 scale-105' : 'text-slate-400 opacity-60'
          }`}
        >
          <span>👥 Tasks</span>
          <span className="text-[10px] px-1.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 font-extrabold">{tasksCount.pending}</span>
        </button>
      </div>
    </div>
  );
}
