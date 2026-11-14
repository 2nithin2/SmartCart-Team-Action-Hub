import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import DmartList from './components/DmartList';
import GroupTasks from './components/GroupTasks';
import ItemModal from './components/ItemModal';
import CloudSyncModal from './components/CloudSyncModal';
import { 
  subscribeToSync, 
  syncSaveItems, 
  syncSaveTasks, 
  syncSaveMembers,
  exportAllData,
  importAllData,
  resetAllToDefaults
} from './services/syncService';

export default function App() {
  const [activeTab, setActiveTab] = useState('dmart'); // 'dmart' | 'tasks'
  const [items, setItems] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    mode: 'local',
    message: 'Initializing...'
  });

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Hidden file input for importing backup JSON
  const fileInputRef = useRef(null);

  // Re-subscribe trigger
  const [syncKey, setSyncKey] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToSync({
      onItemsChange: (newItems) => {
        setItems(newItems);
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

  // Compute existing floors
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

  // Tasks stats
  const tasksCount = React.useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status !== 'completed').length;
    return { total, pending };
  }, [tasks]);

  // Item handlers
  const handleAddItem = async (newItem) => {
    const updated = [newItem, ...items];
    setItems(updated);
    await syncSaveItems(updated);
  };

  const handleUpdateItem = async (updatedItem) => {
    const updated = items.map((i) => (i.id === updatedItem.id ? updatedItem : i));
    setItems(updated);
    await syncSaveItems(updated);
  };

  const handleDeleteItem = async (itemId) => {
    const updated = items.filter((i) => i.id !== itemId);
    setItems(updated);
    await syncSaveItems(updated);
  };

  // Task handlers
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

  // Member handlers
  const handleAddMember = async (name) => {
    if (!name || teamMembers.includes(name)) return;
    const updated = [...teamMembers, name];
    setTeamMembers(updated);
    await syncSaveMembers(updated);
  };

  // Reset to original 81 items
  const handleResetDefaults = async () => {
    if (window.confirm('Reset everything to the original DMart docx list (81 items) and sample group tasks?')) {
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
    link.download = `dmart-list-backup-${new Date().toISOString().split('T')[0]}.json`;
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
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Header with Navigation and Sync Status */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        itemsCount={itemsCount}
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

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 pt-5">
        {activeTab === 'dmart' ? (
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
        ) : (
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

      {/* Add / Edit DMart Item Modal */}
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

      {/* Cloud Sync Setup Modal */}
      <CloudSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        connectionStatus={connectionStatus}
        onReconnect={() => setSyncKey((k) => k + 1)}
      />

      {/* Floating Bottom Navigation for Mobile */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-6 flex justify-around items-center z-20 shadow-lg">
        <button
          onClick={() => setActiveTab('dmart')}
          className={`flex flex-col items-center gap-0.5 text-xs font-bold transition ${
            activeTab === 'dmart' ? 'text-emerald-700' : 'text-slate-500'
          }`}
        >
          <span>🛒 DMart List</span>
          <span className="text-[10px] opacity-75">{itemsCount.pending} pending</span>
        </button>

        <div className="h-6 w-px bg-slate-200" />

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center gap-0.5 text-xs font-bold transition ${
            activeTab === 'tasks' ? 'text-indigo-700' : 'text-slate-500'
          }`}
        >
          <span>👥 Group Tasks</span>
          <span className="text-[10px] opacity-75">{tasksCount.pending} open</span>
        </button>
      </div>
    </div>
  );
}
