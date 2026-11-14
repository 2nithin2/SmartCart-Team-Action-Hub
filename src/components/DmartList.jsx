import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Check, Square, CheckSquare, Edit3, Trash2, 
  Layers, User, Sparkles, Minus, ShoppingBag, Copy, CheckCheck,
  TrendingUp, Clock, Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { haptics } from '../utils/haptics';

const UNIT_OPTIONS = [
  'kg',
  'pcs',
  'packet',
  'packets',
  'bottle',
  'bottles',
  'bundle',
  'litres',
  'gm',
  'box',
  'bag',
  'dozen'
];

export default function DmartList({
  items,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
  onOpenAddModal,
  onOpenEditModal,
  teamMembers,
  existingFloors
}) {
  const [search, setSearch] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all');

  // Quick-Add Bar Form State
  const [quickName, setQuickName] = useState('');
  const [quickQty, setQuickQty] = useState('1');
  const [quickUnit, setQuickUnit] = useState('kg');
  const [quickSizeSpec, setQuickSizeSpec] = useState('');
  const [quickFloor, setQuickFloor] = useState(existingFloors[0] || '1st Floor');
  const [quickAssignee, setQuickAssignee] = useState('Unassigned');
  const [copiedNotification, setCopiedNotification] = useState(false);

  const getItemProp = (item) => ({
    id: item.itemId || item.id,
    name: item.name || '',
    category: item.category || 'General',
    floor: item.floor || '1st Floor',
    quantity: item.quantity !== undefined ? item.quantity : (item.qty !== undefined ? item.qty : 1),
    unit: item.unit || 'pcs',
    sizeSpec: item.sizeSpec || item.size || '',
    note: item.note !== undefined ? item.note : (item.notes || ''),
    assignee: item.assignee !== undefined ? item.assignee : (item.assignedTo || 'Unassigned'),
    status: item.status || 'pending'
  });

  const filteredItems = useMemo(() => {
    return items.filter((rawItem) => {
      const item = getItemProp(rawItem);

      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesSize = item.sizeSpec.toLowerCase().includes(query);
        const matchesNote = item.note.toLowerCase().includes(query);
        const matchesAssignee = item.assignee.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesSize && !matchesNote && !matchesAssignee) {
          return false;
        }
      }

      if (selectedFloor !== 'All' && item.floor !== selectedFloor) return false;

      if (statusFilter === 'pending' && item.status === 'completed') return false;
      if (statusFilter === 'completed' && item.status !== 'completed') return false;

      if (assignedFilter !== 'all') {
        if (assignedFilter === 'unassigned') {
          if (item.assignee && item.assignee !== 'Unassigned') return false;
        } else {
          if (item.assignee !== assignedFilter) return false;
        }
      }

      return true;
    });
  }, [items, search, selectedFloor, statusFilter, assignedFilter]);

  const itemsByFloor = useMemo(() => {
    const grouped = {};
    filteredItems.forEach((rawItem) => {
      const item = getItemProp(rawItem);
      const f = item.floor || 'Other';
      if (!grouped[f]) grouped[f] = [];
      grouped[f].push(rawItem);
    });
    return grouped;
  }, [filteredItems]);

  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((i) => i.status === 'completed').length;
    const pending = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, percent };
  }, [items]);

  const handleToggleComplete = (rawItem) => {
    const item = getItemProp(rawItem);
    const nextStatus = item.status === 'completed' ? 'pending' : 'completed';
    
    if (nextStatus === 'completed') {
      haptics.success();
    } else {
      haptics.tick();
    }

    onUpdateItem({
      ...rawItem,
      status: nextStatus,
      updatedAt: new Date().toISOString()
    });

    if (nextStatus === 'completed') {
      const floorItems = items.filter((i) => (i.floor === item.floor && (i.itemId || i.id) !== item.id));
      const allOthersDone = floorItems.every((i) => i.status === 'completed');
      if (allOthersDone && floorItems.length > 0) {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const handleQtyChange = (rawItem, delta) => {
    haptics.tick();
    const item = getItemProp(rawItem);
    const currentNum = parseFloat(item.quantity) || 1;
    const nextQty = Math.max(1, currentNum + delta);
    
    onUpdateItem({
      ...rawItem,
      quantity: nextQty,
      qty: nextQty,
      updatedAt: new Date().toISOString()
    });
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickName.trim()) return;

    haptics.success();
    const newItem = {
      itemId: `item_${Date.now()}`,
      id: `item_${Date.now()}`,
      name: quickName.trim(),
      category: 'Groceries',
      floor: quickFloor,
      quantity: parseFloat(quickQty) || 1,
      qty: parseFloat(quickQty) || 1,
      unit: quickUnit,
      sizeSpec: quickSizeSpec.trim(),
      size: quickSizeSpec.trim(),
      note: '',
      notes: '',
      assignee: quickAssignee || 'Unassigned',
      assignedTo: quickAssignee || 'Unassigned',
      status: 'pending',
      updatedAt: new Date().toISOString()
    };

    onAddItem(newItem);
    setQuickName('');
    setQuickQty('1');
    setQuickSizeSpec('');
  };

  const handleCopyForWhatsApp = () => {
    haptics.click();
    let text = `🛒 *SmartCart - DMart Grocery List*\n`;
    text += `📅 ${new Date().toLocaleDateString()} | Progress: ${stats.completed}/${stats.total} (${stats.percent}% Picked)\n\n`;

    const floors = Object.keys(itemsByFloor);
    floors.forEach((f) => {
      text += `📍 *${f.toUpperCase()}*\n`;
      itemsByFloor[f].forEach((rawItem) => {
        const item = getItemProp(rawItem);
        const check = item.status === 'completed' ? '✅' : '⬜';
        const qtyStr = `(${item.quantity} ${item.unit})`;
        const sizeStr = item.sizeSpec ? `[${item.sizeSpec}]` : '';
        const assignStr = item.assignee && item.assignee !== 'Unassigned' ? `➡️ @${item.assignee}` : '';
        text += `${check} ${item.name} ${qtyStr} ${sizeStr} ${assignStr}\n`;
      });
      text += `\n`;
    });

    text += `Generated from SmartCart & Team Hub`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    });
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-emerald-500 text-slate-950 font-black',
      'bg-teal-400 text-slate-950 font-black',
      'bg-cyan-400 text-slate-950 font-black',
      'bg-amber-400 text-slate-950 font-black',
      'bg-emerald-300 text-slate-950 font-black'
    ];
    if (!name || name === 'Unassigned') return 'bg-slate-700 text-slate-300';
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="space-y-4">
      {/* 🟢 Deep Emerald Progress & Velocity Tracker Card */}
      <div className="dark-glass-card rounded-2xl p-4 sm:p-5 border-emerald-500/30 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-3 bg-emerald-500/20 text-emerald-300 rounded-2xl border border-emerald-500/40 shadow-inner">
              <ShoppingBag className="w-6 h-6 text-emerald-400 animate-pulse-subtle" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-sm">
                  DMart Grocery Cart
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                  Zone Inventory
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5 font-medium">
                1st Floor Staples &amp; Spices • 2nd Floor Cleaning &amp; Pooja • Live Shared Stock
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={handleCopyForWhatsApp}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-black text-emerald-200 bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-500/40 rounded-xl shadow-md transition hover-wiggle"
              title="Copy formatted list for WhatsApp"
            >
              {copiedNotification ? (
                <>
                  <CheckCheck className="w-4 h-4 text-emerald-400 animate-icon-pop" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-emerald-400 icon-target" />
                  <span>Copy for WhatsApp</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                haptics.click();
                onOpenAddModal();
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-black text-slate-950 bg-linear-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 rounded-xl shadow-lg shadow-emerald-500/30 transition hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Item</span>
            </button>
          </div>
        </div>

        {/* Real-time Shopping Velocity Bar */}
        <div className="mt-4 pt-3.5 border-t border-emerald-500/20">
          <div className="flex flex-wrap items-center justify-between text-xs font-bold text-emerald-200 mb-2 gap-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-500/40 font-black">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Cart Velocity</span>
              </span>
              <span className="text-white font-extrabold">{stats.completed} of {stats.total} items picked ({stats.percent}%)</span>
            </div>
            <span className="text-emerald-300/80 font-semibold">
              {stats.pending} remaining
            </span>
          </div>

          <div className="w-full bg-slate-950/80 rounded-full h-3 overflow-hidden p-0.5 border border-emerald-500/30 shadow-inner">
            <div
              className="bg-linear-to-r from-emerald-400 via-teal-400 to-emerald-300 h-full rounded-full transition-all duration-500 ease-out shadow-emerald-500/50"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ⚡ Quick-Add Bar with High-Contrast Dark Inputs */}
      <div className="dark-glass-card rounded-2xl p-4 border-emerald-500/30 shadow-xl">
        <div className="text-xs font-black text-emerald-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Quick-Add Item (Qty • Unit • Size/Specs • Floor)</span>
          </span>
          <span className="text-[11px] font-semibold text-emerald-400/80 hidden sm:inline">
            Press Enter to add instantly
          </span>
        </div>

        <form onSubmit={handleQuickAdd} className="grid grid-cols-2 sm:grid-cols-12 gap-2.5">
          <div className="col-span-2 sm:col-span-4">
            <input
              type="text"
              placeholder="Item Name (e.g. Sona Masoori Rice, Red Label Tea...)"
              value={quickName}
              onChange={(e) => setQuickName(e.target.value)}
              className="dark-glass-input w-full px-3.5 py-2.5 text-sm rounded-xl font-bold focus:outline-none"
              required
            />
          </div>

          <div className="col-span-1 sm:col-span-1">
            <input
              type="number"
              min="0.1"
              step="any"
              placeholder="Qty"
              value={quickQty}
              onChange={(e) => setQuickQty(e.target.value)}
              className="dark-glass-input w-full px-2 py-2.5 text-sm text-center font-black rounded-xl focus:outline-none"
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <select
              value={quickUnit}
              onChange={(e) => {
                haptics.tick();
                setQuickUnit(e.target.value);
              }}
              className="dark-glass-input w-full px-2.5 py-2.5 text-sm rounded-xl font-bold focus:outline-none bg-slate-900"
            >
              {UNIT_OPTIONS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <input
              type="text"
              placeholder="Size/Specs (e.g. 25kg, 1L)"
              value={quickSizeSpec}
              onChange={(e) => setQuickSizeSpec(e.target.value)}
              className="dark-glass-input w-full px-3 py-2.5 text-sm rounded-xl focus:outline-none font-medium"
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <select
              value={quickFloor}
              onChange={(e) => {
                haptics.tick();
                setQuickFloor(e.target.value);
              }}
              className="dark-glass-input w-full px-2.5 py-2.5 text-xs font-bold rounded-xl focus:outline-none bg-slate-900 truncate"
            >
              {existingFloors.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1 flex">
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm transition shadow-lg shadow-emerald-500/30 flex items-center justify-center shrink-0 hover:scale-105 active:scale-95"
              title="Add Item"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* 🔍 Smart Filtering & Assignee Avatar Chips */}
      <div className="dark-glass-card rounded-2xl p-4 space-y-3.5 border-emerald-500/20">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-emerald-400/60" />
          <input
            type="text"
            placeholder="Search items by name, category, size/specs, notes, or assignee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="dark-glass-input w-full pl-10 pr-16 py-2.5 text-sm rounded-xl focus:outline-none font-bold text-white"
          />
          {search && (
            <button
              onClick={() => {
                haptics.click();
                setSearch('');
              }}
              className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 px-2 py-0.5 rounded-md"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                haptics.click();
                setSelectedFloor('All');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition shadow-xs ${
                selectedFloor === 'All'
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                  : 'bg-white/10 text-emerald-200 hover:bg-white/15 border border-white/10'
              }`}
            >
              All Zones ({items.length})
            </button>
            {existingFloors.map((f) => {
              const floorTotal = items.filter((i) => i.floor === f).length;
              const floorDone = items.filter((i) => i.floor === f && i.status === 'completed').length;
              return (
                <button
                  key={f}
                  onClick={() => {
                    haptics.click();
                    setSelectedFloor(f);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                    selectedFloor === f
                      ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                      : 'bg-emerald-950/60 text-emerald-200 hover:bg-emerald-900/60 border border-emerald-500/30'
                  }`}
                >
                  <span>{f}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedFloor === f ? 'bg-slate-950 text-emerald-300' : 'bg-emerald-900/80 text-emerald-300'
                  }`}>
                    {floorDone}/{floorTotal}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                haptics.click();
                setStatusFilter(e.target.value);
              }}
              className="dark-glass-input px-3 py-1.5 text-xs rounded-xl font-black text-emerald-200 bg-slate-950"
            >
              <option value="all">Status: All Items</option>
              <option value="pending">⏳ Pending to Pick</option>
              <option value="completed">✅ Purchased (Struck)</option>
            </select>
          </div>
        </div>

        {/* Assignee Avatar Chips */}
        <div className="pt-2 border-t border-white/10">
          <div className="text-[11px] font-black text-emerald-400/80 uppercase tracking-wider mb-2">
            Filter by Assignee:
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                haptics.click();
                setAssignedFilter('all');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-black transition ${
                assignedFilter === 'all'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'bg-white/10 text-emerald-200 hover:bg-white/15'
              }`}
            >
              Everyone
            </button>
            <button
              onClick={() => {
                haptics.click();
                setAssignedFilter('unassigned');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                assignedFilter === 'unassigned'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-white/10 text-emerald-200/80 hover:bg-white/15'
              }`}
            >
              Unassigned
            </button>
            {teamMembers.map((member) => {
              const count = items.filter((i) => (i.assignee === member || i.assignedTo === member)).length;
              const pendingCount = items.filter((i) => (i.assignee === member || i.assignedTo === member) && i.status !== 'completed').length;
              return (
                <button
                  key={member}
                  onClick={() => {
                    haptics.click();
                    setAssignedFilter(member);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    assignedFilter === member
                      ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${getAvatarColor(member)}`}>
                    {member.charAt(0)}
                  </span>
                  <span>{member}</span>
                  <span className={`text-[10px] px-1.5 rounded-full ${
                    assignedFilter === member ? 'bg-slate-950 text-emerald-300' : 'bg-white/20 text-emerald-100'
                  }`}>
                    {pendingCount}/{count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 📦 Zone Grouped Items */}
      {Object.keys(itemsByFloor).length === 0 ? (
        <div className="dark-glass-card rounded-2xl p-12 text-center border-emerald-500/20">
          <ShoppingBag className="w-12 h-12 text-emerald-500/40 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-white">No items match your filter</h3>
          <p className="text-xs text-emerald-200/60 mt-1">
            Try clearing your search query or reset the floor / status filter.
          </p>
          <button
            onClick={() => {
              haptics.click();
              setSearch('');
              setSelectedFloor('All');
              setStatusFilter('all');
              setAssignedFilter('all');
            }}
            className="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-xl text-xs font-black shadow-md"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        Object.keys(itemsByFloor).map((floorName) => {
          const rawFloorItems = itemsByFloor[floorName];
          const floorTotal = rawFloorItems.length;
          const floorCompleted = rawFloorItems.filter((i) => i.status === 'completed').length;
          const floorPercent = Math.round((floorCompleted / floorTotal) * 100);

          return (
            <div
              key={floorName}
              className="dark-glass-card rounded-2xl overflow-hidden border-emerald-500/25 shadow-xl"
            >
              {/* Floor Zone Header with Progress */}
              <div className="bg-emerald-950/70 px-4 py-3 border-b border-emerald-500/20 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30">
                    <Layers className="w-4 h-4 text-emerald-400" />
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                      {floorName}
                    </h3>
                    <p className="text-[11px] text-emerald-200/80 font-semibold">
                      {floorCompleted} of {floorTotal} items picked ({floorPercent}%)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-24 sm:w-36 bg-slate-950 rounded-full h-2 overflow-hidden border border-emerald-500/20">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-300 shadow-emerald-400/50"
                      style={{ width: `${floorPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-emerald-300 min-w-8 text-right">
                    {floorPercent}%
                  </span>
                </div>
              </div>

              {/* Items in this Floor Zone */}
              <div className="divide-y divide-white/5">
                {rawFloorItems.map((rawItem) => {
                  const item = getItemProp(rawItem);
                  const isDone = item.status === 'completed';

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                        isDone
                          ? 'bg-slate-950/40 opacity-50'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => handleToggleComplete(rawItem)}
                          className={`mt-0.5 p-1 rounded-lg transition-all shrink-0 ${
                            isDone
                              ? 'text-emerald-400 bg-emerald-950/80 ring-1 ring-emerald-500/50 animate-icon-pop'
                              : 'text-slate-400 hover:text-emerald-400 bg-white/10 hover:bg-white/20'
                          }`}
                          title={isDone ? 'Mark as Pending' : 'Mark as Purchased'}
                        >
                          {isDone ? (
                            <CheckSquare className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              onClick={() => handleToggleComplete(rawItem)}
                              className={`text-sm sm:text-base font-black cursor-pointer select-none transition ${
                                isDone
                                  ? 'line-through text-slate-400 decoration-slate-400 decoration-2'
                                  : 'text-white hover:text-emerald-300'
                              }`}
                            >
                              {item.name}
                            </span>

                            {item.category && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-emerald-200 border border-white/10">
                                {item.category}
                              </span>
                            )}
                          </div>

                          {item.note && (
                            <p className="text-xs text-emerald-200/70 mt-1 italic font-normal">
                              💡 {item.note}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-white/5">
                        {/* Qty Stepper */}
                        <div className="flex items-center bg-slate-950/80 rounded-xl p-0.5 border border-emerald-500/30 shadow-inner">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(rawItem, -1)}
                            disabled={isDone}
                            className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition disabled:opacity-40"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-black text-emerald-300 min-w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(rawItem, 1)}
                            disabled={isDone}
                            className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition disabled:opacity-40"
                            title="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Unit Badge */}
                        <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                          {item.unit}
                        </span>

                        {/* Size/Specs */}
                        {item.sizeSpec ? (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-950/80 text-amber-200 border border-amber-500/40 max-w-xs truncate" title={item.sizeSpec}>
                            📏 {item.sizeSpec}
                          </span>
                        ) : null}

                        {/* Assignee Avatar Pill */}
                        <div className="relative">
                          <select
                            value={item.assignee || 'Unassigned'}
                            onChange={(e) => {
                              haptics.tick();
                              onUpdateItem({
                                ...rawItem,
                                assignee: e.target.value,
                                assignedTo: e.target.value,
                                updatedAt: new Date().toISOString()
                              });
                            }}
                            className={`text-xs px-2.5 py-1 rounded-lg border font-black transition cursor-pointer ${
                              item.assignee && item.assignee !== 'Unassigned'
                                ? 'bg-indigo-950/80 text-indigo-200 border-indigo-400/40'
                                : 'bg-slate-900/80 text-slate-400 border-white/10'
                            }`}
                          >
                            <option value="Unassigned">👤 Unassigned</option>
                            {teamMembers.map((m) => (
                              <option key={m} value={m}>
                                👤 {m}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Edit & Delete Controls */}
                        <div className="flex items-center gap-1 pl-1">
                          <button
                            onClick={() => {
                              haptics.click();
                              onOpenEditModal(rawItem);
                            }}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition hover-wiggle"
                            title="Edit Item Details"
                          >
                            <Edit3 className="w-4 h-4 icon-target" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete "${item.name}" from the list?`)) {
                                onDeleteItem(item.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition hover-wiggle"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4 icon-target" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
