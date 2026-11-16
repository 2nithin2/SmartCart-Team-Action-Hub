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

  // Grocery Handlers (Memoized with stable functional updates for 120 FPS performance)
  const handleAddItem = React.useCallback(async (newItem) => {
    setItems((prevItems) => {
      const normalized = normalizeItem(newItem, prevItems.length);
      const updated = [normalized, ...prevItems];
      syncSaveItems(updated);
      return updated;
    });
  }, []);

  const handleUpdateItem = React.useCallback(async (updatedItem) => {
    setItems((prevItems) => {
      const normalized = normalizeItem(updatedItem);
      const targetId = normalized.itemId || normalized.id;
      const updated = prevItems.map((i) => ((i.itemId === targetId || i.id === targetId) ? normalized : i));
      syncSaveItems(updated);
      return updated;
    });
  }, []);

  const handleDeleteItem = React.useCallback(async (itemId) => {
    setItems((prevItems) => {
      const updated = prevItems.filter((i) => (i.itemId !== itemId && i.id !== itemId));
      syncSaveItems(updated);
      return updated;
    });
  }, []);

  // Clothing Handlers (Memoized with stable functional updates)
  const handleAddClothing = React.useCallback(async (newClothing) => {
    setClothingItems((prevClothing) => {
      const normalized = normalizeItem(newClothing, prevClothing.length);
      const updated = [normalized, ...prevClothing];
      syncSaveClothing(updated);
      return updated;
    });
  }, []);

  const handleUpdateClothing = React.useCallback(async (updatedClothing) => {
    setClothingItems((prevClothing) => {
      const normalized = normalizeItem(updatedClothing);
      const targetId = normalized.itemId || normalized.id;
      const updated = prevClothing.map((c) => ((c.itemId === targetId || c.id === targetId) ? normalized : c));
      syncSaveClothing(updated);
      return updated;
    });
  }, []);

  const handleDeleteClothing = React.useCallback(async (clothingId) => {
    setClothingItems((prevClothing) => {
      const updated = prevClothing.filter((c) => (c.itemId !== clothingId && c.id !== clothingId));
      syncSaveClothing(updated);
      return updated;
    });
  }, []);

  // Task Handlers (Memoized with stable functional updates)
  const handleAddTask = React.useCallback(async (newTask) => {
    setTasks((prevTasks) => {
      const updated = [newTask, ...prevTasks];
      syncSaveTasks(updated);
      return updated;
    });
  }, []);

  const handleUpdateTask = React.useCallback(async (updatedTask) => {
    setTasks((prevTasks) => {
      const updated = prevTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
      syncSaveTasks(updated);
      return updated;
    });
  }, []);

  const handleDeleteTask = React.useCallback(async (taskId) => {
    setTasks((prevTasks) => {
      const updated = prevTasks.filter((t) => t.id !== taskId);
      syncSaveTasks(updated);
      return updated;
    });
  }, []);

  // Member Handlers (Add, Edit/Rename, Remove with cascading task & item updates)
  const handleAddMember = React.useCallback(async (name) => {
    const trimmed = name?.trim();
    if (!trimmed) return;
    setTeamMembers((prevMembers) => {
      if (prevMembers.some((m) => m.toLowerCase() === trimmed.toLowerCase())) {
        alert(`Member "${trimmed}" already exists.`);
        return prevMembers;
      }
      const updated = [...prevMembers, trimmed];
      syncSaveMembers(updated);
      return updated;
    });
  }, []);

  const handleEditMember = React.useCallback(async (oldName, newName) => {
    const trimmedNew = newName?.trim();
    if (!trimmedNew || !oldName || trimmedNew === oldName) return;

    let duplicate = false;
    setTeamMembers((prevMembers) => {
      if (prevMembers.some((m) => m.toLowerCase() === trimmedNew.toLowerCase() && m !== oldName)) {
        duplicate = true;
        return prevMembers;
      }
      const updatedMembers = prevMembers.map((m) => (m === oldName ? trimmedNew : m));
      syncSaveMembers(updatedMembers);
      return updatedMembers;
    });

    if (duplicate) {
      alert(`A member named "${trimmedNew}" already exists.`);
      return;
    }

    // Cascade update to tasks
    setTasks((prevTasks) => {
      let changed = false;
      const updatedTasks = prevTasks.map((t) => {
        if (t.assignedTo === oldName) {
          changed = true;
          return { ...t, assignedTo: trimmedNew, updatedAt: new Date().toISOString() };
        }
        return t;
      });
      if (changed) syncSaveTasks(updatedTasks);
      return updatedTasks;
    });

    // Cascade update to DMart grocery items
    setItems((prevItems) => {
      let changed = false;
      const updatedItems = prevItems.map((item) => {
        if (item.assignee === oldName || item.assignedTo === oldName) {
          changed = true;
          return { ...item, assignee: trimmedNew, assignedTo: trimmedNew, updatedAt: new Date().toISOString() };
        }
        return item;
      });
      if (changed) syncSaveItems(updatedItems);
      return updatedItems;
    });

    // Cascade update to clothing items
    setClothingItems((prevClothing) => {
      let changed = false;
      const updatedClothing = prevClothing.map((item) => {
        if (item.assignee === oldName || item.assignedTo === oldName) {
          changed = true;
          return { ...item, assignee: trimmedNew, assignedTo: trimmedNew, updatedAt: new Date().toISOString() };
        }
        return item;
      });
      if (changed) syncSaveClothing(updatedClothing);
      return updatedClothing;
    });
  }, []);

  const handleRemoveMember = React.useCallback(async (memberToRemove) => {
    if (!memberToRemove) return;

    // Remove from teamMembers
    setTeamMembers((prevMembers) => {
      const updatedMembers = prevMembers.filter((m) => m !== memberToRemove);
      syncSaveMembers(updatedMembers);
      return updatedMembers;
    });

    // Reassign tasks to 'Unassigned'
    setTasks((prevTasks) => {
      let changed = false;
      const updatedTasks = prevTasks.map((t) => {
        if (t.assignedTo === memberToRemove) {
          changed = true;
          return { ...t, assignedTo: 'Unassigned', updatedAt: new Date().toISOString() };
        }
        return t;
      });
      if (changed) syncSaveTasks(updatedTasks);
      return updatedTasks;
    });

    // Reassign grocery items
    setItems((prevItems) => {
      let changed = false;
      const updatedItems = prevItems.map((item) => {
        if (item.assignee === memberToRemove || item.assignedTo === memberToRemove) {
          changed = true;
          return { ...item, assignee: 'Unassigned', assignedTo: 'Unassigned', updatedAt: new Date().toISOString() };
        }
        return item;
      });
      if (changed) syncSaveItems(updatedItems);
      return updatedItems;
    });

    // Reassign clothing items
    setClothingItems((prevClothing) => {
      let changed = false;
      const updatedClothing = prevClothing.map((item) => {
        if (item.assignee === memberToRemove || item.assignedTo === memberToRemove) {
          changed = true;
          return { ...item, assignee: 'Unassigned', assignedTo: 'Unassigned', updatedAt: new Date().toISOString() };
        }
        return item;
      });
      if (changed) syncSaveClothing(updatedClothing);
      return updatedClothing;
    });
  }, []);

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
    <div className="smartcart-root min-h-screen flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
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
      <main className="flex-1 max-w-6xl w-full mx-auto px-2 sm:px-4 pt-5 pb-8 relative z-10">
        {/* 🌟 Stylish Landing Page Hub Overview Hero Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
          {/* Card 1: Groceries */}
          <button
            onClick={() => setActiveTab('dmart')}
            className={`glass-card rounded-2xl p-4 text-left transition-all relative overflow-hidden group ${
              activeTab === 'dmart' ? 'border-emerald-500/50 shadow-lg glow-emerald ring-1 ring-emerald-500/30' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-500/30">
                {itemsCount.pending} To Buy
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-50 mt-3 group-hover:text-emerald-300 transition">
              DMart Grocery Cart
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              1st &amp; 2nd Floor staples, spices &amp; household
            </p>
            <div className="mt-3.5 flex items-center justify-between text-xs font-bold text-emerald-300">
              <span>{itemsCount.completed} / {itemsCount.total} Picked</span>
              <span className="text-[11px] opacity-80">
                {itemsCount.total > 0 ? Math.round((itemsCount.completed / itemsCount.total) * 100) : 0}%
              </span>
            </div>
          </button>

          {/* Card 2: Dressing */}
          <button
            onClick={() => setActiveTab('clothing')}
            className={`glass-card rounded-2xl p-4 text-left transition-all relative overflow-hidden group ${
              activeTab === 'clothing' ? 'border-pink-500/50 shadow-lg glow-pink ring-1 ring-pink-500/30' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-500/30">
                <Shirt className="w-5 h-5 text-pink-400" />
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-pink-950/70 text-pink-300 border border-pink-500/30">
                {clothingCount.pending} In Cart
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-50 mt-3 group-hover:text-pink-300 transition">
              Dressing &amp; Apparel Cart
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sizes, colors &amp; trial room fitting status
            </p>
            <div className="mt-3.5 flex items-center justify-between text-xs font-bold text-pink-300">
              <span>{clothingCount.purchased} / {clothingCount.total} Bought</span>
              <span className="text-[11px] opacity-80">
                {clothingCount.total > 0 ? Math.round((clothingCount.purchased / clothingCount.total) * 100) : 0}%
              </span>
            </div>
          </button>

          {/* Card 3: Group Tasks */}
          <button
            onClick={() => setActiveTab('tasks')}
            className={`glass-card rounded-2xl p-4 text-left transition-all relative overflow-hidden group ${
              activeTab === 'tasks' ? 'border-indigo-500/50 shadow-lg glow-indigo ring-1 ring-indigo-500/30' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Users className="w-5 h-5 text-indigo-400" />
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-950/70 text-indigo-300 border border-indigo-500/30">
                {tasksCount.pending} Open
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-50 mt-3 group-hover:text-indigo-300 transition">
              Group Action &amp; Tasks
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Assigned follow-ups, price checks &amp; billing
            </p>
            <div className="mt-3.5 flex items-center justify-between text-xs font-bold text-indigo-300">
              <span>{teamMembers.length} Collaborators</span>
              <span className="text-[11px] opacity-80">
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
            onEditMember={handleEditMember}
            onRemoveMember={handleRemoveMember}
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
    </div>
  );
}
