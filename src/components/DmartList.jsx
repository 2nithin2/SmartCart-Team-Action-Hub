import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Check, Square, CheckSquare, Edit3, Trash2, 
  Layers, User, Sparkles, Minus, ShoppingBag, Copy, CheckCheck,
  TrendingUp, Clock, Tag, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

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
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [assignedFilter, setAssignedFilter] = useState('all');

  // Quick-Add Bar Form State (per spec)
  const [quickName, setQuickName] = useState('');
  const [quickQty, setQuickQty] = useState('1');
  const [quickUnit, setQuickUnit] = useState('kg');
  const [quickSizeSpec, setQuickSizeSpec] = useState('');
  const [quickFloor, setQuickFloor] = useState(existingFloors[0] || '1st Floor');
  const [quickAssignee, setQuickAssignee] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Helper to extract schema properties cleanly
  const getItemProp = (item) => ({
    id: item.itemId || item.id,
    name: item.name || '',
    category: item.category || 'General',
    floor: item.floor || '1st Floor',
    quantity: item.quantity !== undefined ? item.quantity : (item.qty !== undefined ? item.qty : 1),
    unit: item.unit || 'pcs',
    sizeSpec: item.sizeSpec || item.size || '',
    note: item.note !== undefined ? item.note : (item.notes || ''),
    assignee: item.assignee !== undefined ? item.assignee : (item.assignedTo || ''),
    status: item.status || 'pending'
  });

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((rawItem) => {
      const item = getItemProp(rawItem);

      // Search Query
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

      // Floor Filter
      if (selectedFloor !== 'All' && item.floor !== selectedFloor) {
        return false;
      }

      // Status Filter
      if (statusFilter === 'pending' && item.status === 'completed') return false;
      if (statusFilter === 'completed' && item.status !== 'completed') return false;

      // Assignee Filter
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

  // Group items by physical floor zone
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

  // Overall velocity and completion stats
  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((i) => (i.status === 'completed')).length;
    const pending = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, percent };
  }, [items]);

  // Toggle complete / strikethrough status
  const handleToggleComplete = (rawItem) => {
    const item = getItemProp(rawItem);
    const nextStatus = item.status === 'completed' ? 'pending' : 'completed';
    
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
          spread: 75,
          origin: { y: 0.6 }
        });
      }
    }
  };

  // Quantity stepper increment/decrement
  const handleQtyChange = (rawItem, delta) => {
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

  // Quick-Add submission
  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickName.trim()) return;

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

  // WhatsApp formatted clipboard copy
  const handleCopyForWhatsApp = () => {
    let text = `🛒 *SmartCart - DMart Shopping List*\n`;
    text += `📅 ${new Date().toLocaleDateString()} | Progress: ${stats.completed}/${stats.total} (${stats.percent}% Done)\n\n`;

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

  // Assignee avatar badge color generator with crisp initial letters
  const getAvatarColor = (name) => {
    const colors = [
      'bg-indigo-600 text-white border-indigo-400/40',
      'bg-pink-600 text-white border-pink-400/40',
      'bg-emerald-600 text-white border-emerald-400/40',
      'bg-purple-600 text-white border-purple-400/40',
      'bg-amber-600 text-white border-amber-400/40',
      'bg-cyan-600 text-white border-cyan-400/40'
    ];
    if (!name || name === 'Unassigned') return 'bg-slate-700 text-slate-300 border-slate-600/40';
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="space-y-4 pb-16">
      {/* 1. Velocity Tracker Header with Glassmorphism */}
      <div className="glass-card rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30 shadow-xs">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-slate-50 tracking-tight">
                  DMart Grocery &amp; Staples Cart
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Zone-categorized inventory (1st &amp; 2nd Floor) • Real-time collaborator sync
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons: WhatsApp Export & Add Item */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={handleCopyForWhatsApp}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl shadow-xs transition"
              title="Copy formatted list for WhatsApp"
            >
              {copiedNotification ? (
                <>
                  <CheckCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Copied to WhatsApp!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Copy for WhatsApp</span>
                </>
              )}
            </button>

            <button
              onClick={() => onOpenAddModal()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-linear-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 rounded-xl shadow-lg glow-indigo transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Item</span>
            </button>
          </div>
        </div>

        {/* 4.B Smooth Progress Bar & Velocity Tracker */}
        <div className="mt-4 pt-3.5 border-t border-white/10">
          <div className="flex flex-wrap items-center justify-between text-xs font-semibold text-slate-300 mb-2 gap-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded-md border border-emerald-500/30 font-bold">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Velocity Tracker</span>
              </span>
              <span>{stats.completed} of {stats.total} items picked ({stats.percent}%)</span>
            </div>
            <span className="text-slate-400 font-medium">
              {stats.pending} items remaining
            </span>
          </div>

          <div className="progress-track w-full">
            <div
              className="progress-fill"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Quick-Add Bar with Glassmorphic styling */}
      <div className="glass-card rounded-2xl p-4 border border-indigo-500/30">
        <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Quick-Add Item (Qty • Unit • Size/Specs • Floor)</span>
          </span>
          <span className="text-[11px] font-normal text-slate-400">
            Press Enter to add instantly
          </span>
        </div>

        <form onSubmit={handleQuickAdd} className="grid grid-cols-2 sm:grid-cols-12 gap-2.5">
          {/* Item Name */}
          <div className="col-span-2 sm:col-span-4">
            <input
              type="text"
              placeholder="Item Name (e.g. Sona Masoori Rice, Red Label Tea...)"
              value={quickName}
              onChange={(e) => setQuickName(e.target.value)}
              className="glass-input w-full px-3.5 py-2 text-sm rounded-xl font-medium focus:outline-none"
              required
            />
          </div>

          {/* Qty */}
          <div className="col-span-1 sm:col-span-1">
            <input
              type="number"
              min="0.1"
              step="any"
              placeholder="Qty"
              value={quickQty}
              onChange={(e) => setQuickQty(e.target.value)}
              className="glass-input w-full px-2 py-2 text-sm text-center font-bold rounded-xl focus:outline-none"
            />
          </div>

          {/* Unit Selector */}
          <div className="col-span-1 sm:col-span-2">
            <select
              value={quickUnit}
              onChange={(e) => setQuickUnit(e.target.value)}
              className="glass-input w-full px-2.5 py-2 text-sm rounded-xl font-medium focus:outline-none"
            >
              {UNIT_OPTIONS.map((u) => (
                <option key={u} value={u} className="bg-slate-900 text-slate-100">{u}</option>
              ))}
            </select>
          </div>

          {/* Size / Specs */}
          <div className="col-span-1 sm:col-span-2">
            <input
              type="text"
              placeholder="Size/Specs (e.g. 25kg bag, 1L)"
              value={quickSizeSpec}
              onChange={(e) => setQuickSizeSpec(e.target.value)}
              className="glass-input w-full px-3 py-2 text-sm rounded-xl focus:outline-none"
            />
          </div>

          {/* Floor */}
          <div className="col-span-1 sm:col-span-2">
            <select
              value={quickFloor}
              onChange={(e) => setQuickFloor(e.target.value)}
              className="glass-input w-full px-2.5 py-2 text-xs font-semibold rounded-xl focus:outline-none truncate"
            >
              {existingFloors.map((f) => (
                <option key={f} value={f} className="bg-slate-900 text-slate-100">{f}</option>
              ))}
            </select>
          </div>

          {/* Add Submit Button */}
          <div className="col-span-2 sm:col-span-1 flex">
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition shadow-md glow-indigo flex items-center justify-center shrink-0"
              title="Add Item"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* 3. Smart Filtering & Assignee Avatar Chips */}
      <div className="glass-card rounded-2xl p-4 space-y-3.5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search items by name, category, size/specs, notes, or assignee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-10 pr-16 py-2.5 text-sm rounded-xl focus:outline-none font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/10 px-2 py-0.5 rounded-md"
            >
              Clear
            </button>
          )}
        </div>

        {/* Floor & Status Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-white/10">
          {/* Floor Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedFloor('All')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                selectedFloor === 'All'
                  ? 'bg-indigo-600 text-white shadow-md glow-indigo border border-indigo-400/40'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
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
                  onClick={() => setSelectedFloor(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedFloor === f
                      ? 'bg-indigo-600 text-white shadow-md glow-indigo border border-indigo-400/40'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <span>{f}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedFloor === f ? 'bg-indigo-800 text-white' : 'bg-white/10 text-slate-400'
                  }`}>
                    {floorDone}/{floorTotal}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="glass-input px-3 py-1.5 text-xs rounded-xl font-bold text-slate-200"
            >
              <option value="all" className="bg-slate-900 text-slate-100">Status: All Items</option>
              <option value="pending" className="bg-slate-900 text-slate-100">⏳ Pending to Pick</option>
              <option value="completed" className="bg-slate-900 text-slate-100">✅ Purchased (Struck)</option>
            </select>
          </div>
        </div>

        {/* Assignee Avatar Chips (Smart Filtering) */}
        <div className="pt-2 border-t border-white/10">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Filter by Assignee:
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setAssignedFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                assignedFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              All Assignees
            </button>

            <button
              onClick={() => setAssignedFilter('unassigned')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                assignedFilter === 'unassigned'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              Unassigned ({items.filter((i) => !i.assignee || i.assignee === 'Unassigned').length})
            </button>

            {teamMembers.map((member) => {
              const count = items.filter((i) => (i.assignee === member || i.assignedTo === member)).length;
              const pendingCount = items.filter((i) => (i.assignee === member || i.assignedTo === member) && i.status !== 'completed').length;
              return (
                <button
                  key={member}
                  onClick={() => setAssignedFilter(member)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                    assignedFilter === member
                      ? 'bg-indigo-600 text-white shadow-sm border border-indigo-400/40'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold border ${getAvatarColor(member)}`}>
                    {member.charAt(0)}
                  </span>
                  <span>{member}</span>
                  <span className={`text-[10px] px-1.5 rounded-full ${
                    assignedFilter === member ? 'bg-indigo-800 text-white' : 'bg-white/10 text-slate-400'
                  }`}>
                    {pendingCount}/{count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Zone / Floor Grouped Items with Frosted Glass Cards */}
      {Object.keys(itemsByFloor).length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">No items match your filter</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try clearing your search query or reset the floor / status filter.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedFloor('All');
              setStatusFilter('all');
              setAssignedFilter('all');
            }}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md glow-indigo"
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
              className="glass-card rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Floor Zone Header with Progress */}
              <div className="bg-slate-900/60 backdrop-blur-md px-4 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30">
                    <Layers className="w-4 h-4 text-emerald-400" />
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-50 tracking-tight">
                      {floorName}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {floorCompleted} of {floorTotal} items picked ({floorPercent}%)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-24 sm:w-36 progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${floorPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-extrabold text-slate-300 min-w-8 text-right">
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
                          ? 'bg-slate-950/40 opacity-60'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      {/* Left: Checkbox & Item Spec details */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => handleToggleComplete(rawItem)}
                          className={`mt-0.5 p-1 rounded-lg transition shrink-0 ${
                            isDone
                              ? 'text-emerald-400 bg-emerald-950/70 border border-emerald-500/30'
                              : 'text-slate-400 hover:text-emerald-400 bg-white/5 hover:bg-white/10 border border-white/10'
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
                            {/* 5. Item Title Rule */}
                            <span
                              onClick={() => handleToggleComplete(rawItem)}
                              className={`item-title cursor-pointer select-none transition ${
                                isDone
                                  ? 'line-through text-slate-500'
                                  : 'text-slate-50 hover:text-emerald-300'
                              }`}
                            >
                              {item.name}
                            </span>

                            {/* Category Pill */}
                            {item.category && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/5">
                                {item.category}
                              </span>
                            )}
                          </div>

                          {/* Notes / Special specs */}
                          {item.note && (
                            <p className="text-xs text-slate-400 mt-1 italic font-normal">
                              💡 {item.note}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Stepper, Qty & Unit, SizeSpec, Assignee, Actions */}
                      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-white/5">
                        {/* Qty Stepper */}
                        <div className="flex items-center bg-slate-900/60 rounded-xl p-0.5 border border-white/10 shadow-xs">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(rawItem, -1)}
                            disabled={isDone}
                            className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition disabled:opacity-30"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-extrabold text-slate-100 min-w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(rawItem, 1)}
                            disabled={isDone}
                            className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition disabled:opacity-30"
                            title="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Unit / Pieces Badge */}
                        <span className="spec-tag text-emerald-300 font-bold border-emerald-500/20">
                          {item.unit}
                        </span>

                        {/* 5. Metadata Tags (Sizes/Specs) */}
                        {item.sizeSpec ? (
                          <span className="spec-tag max-w-xs truncate" title={item.sizeSpec}>
                            📏 {item.sizeSpec}
                          </span>
                        ) : null}

                        {/* 5. Assignee Avatar Badge */}
                        <div className="relative">
                          <select
                            value={item.assignee || 'Unassigned'}
                            onChange={(e) => {
                              onUpdateItem({
                                ...rawItem,
                                assignee: e.target.value,
                                assignedTo: e.target.value,
                                updatedAt: new Date().toISOString()
                              });
                            }}
                            className="glass-input text-xs font-semibold px-2.5 py-1 rounded-xl appearance-none pr-6 cursor-pointer"
                          >
                            <option value="Unassigned" className="bg-slate-900 text-slate-200">👤 Unassigned</option>
                            {teamMembers.map((m) => (
                              <option key={m} value={m} className="bg-slate-900 text-slate-200">👤 {m}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-2 top-1.5 text-slate-400 text-[10px]">
                            ▼
                          </div>
                        </div>

                        {/* Actions: Edit & Delete */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onOpenEditModal(rawItem)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                            title="Edit Item Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete "${item.name}" from shopping list?`)) {
                                onDeleteItem(item.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
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
