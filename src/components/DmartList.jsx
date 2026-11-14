import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Check, Square, CheckSquare, Edit3, Trash2, 
  Share2, Filter, Layers, User, AlertCircle, ArrowUpDown, 
  Sparkles, Minus, ShoppingBag, Copy, CheckCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

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
  const [quickName, setQuickName] = useState('');
  const [quickQty, setQuickQty] = useState('1');
  const [quickUnit, setQuickUnit] = useState('pcs');
  const [quickSize, setQuickSize] = useState('');
  const [quickFloor, setQuickFloor] = useState(existingFloors[0] || '1st Floor');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesNotes = item.notes?.toLowerCase().includes(query);
        const matchesCategory = item.category?.toLowerCase().includes(query);
        const matchesSize = item.size?.toLowerCase().includes(query);
        const matchesAssignee = item.assignedTo?.toLowerCase().includes(query);
        if (!matchesName && !matchesNotes && !matchesCategory && !matchesSize && !matchesAssignee) {
          return false;
        }
      }

      // Floor
      if (selectedFloor !== 'All' && item.floor !== selectedFloor) {
        return false;
      }

      // Status
      if (statusFilter === 'pending' && item.status === 'completed') return false;
      if (statusFilter === 'completed' && item.status !== 'completed') return false;

      // Assignee
      if (assignedFilter !== 'all') {
        if (assignedFilter === 'unassigned') {
          if (item.assignedTo) return false;
        } else {
          if (item.assignedTo !== assignedFilter) return false;
        }
      }

      return true;
    });
  }, [items, search, selectedFloor, statusFilter, assignedFilter]);

  // Group items by floor
  const itemsByFloor = useMemo(() => {
    const grouped = {};
    filteredItems.forEach((item) => {
      const f = item.floor || 'Other';
      if (!grouped[f]) grouped[f] = [];
      grouped[f].push(item);
    });
    return grouped;
  }, [filteredItems]);

  // Overall Stats
  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((i) => i.status === 'completed').length;
    const pending = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, percent };
  }, [items]);

  // Toggle item completed status
  const handleToggleComplete = (item) => {
    const nextStatus = item.status === 'completed' ? 'pending' : 'completed';
    onUpdateItem({
      ...item,
      status: nextStatus,
      updatedAt: new Date().toISOString()
    });

    if (nextStatus === 'completed') {
      // Check if floor completed
      const floorItems = items.filter((i) => i.floor === item.floor && i.id !== item.id);
      const allOthersDone = floorItems.every((i) => i.status === 'completed');
      if (allOthersDone && floorItems.length > 0) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    }
  };

  // Stepper increment/decrement
  const handleQtyChange = (item, delta) => {
    const currentQtyNum = parseFloat(item.qty) || 1;
    const nextQty = Math.max(1, currentQtyNum + delta);
    onUpdateItem({
      ...item,
      qty: nextQty.toString(),
      updatedAt: new Date().toISOString()
    });
  };

  // Quick inline add
  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickName.trim()) return;

    const newItem = {
      id: `dm-${Date.now()}`,
      name: quickName.trim(),
      qty: quickQty.trim() || '1',
      unit: quickUnit,
      size: quickSize.trim(),
      floor: quickFloor,
      category: 'General',
      assignedTo: '',
      notes: '',
      status: 'pending',
      updatedAt: new Date().toISOString()
    };

    onAddItem(newItem);
    setQuickName('');
    setQuickQty('1');
    setQuickSize('');
  };

  // Copy list for WhatsApp sharing
  const handleCopyForWhatsApp = () => {
    let text = `🛒 *DMart Shopping List Follow-up*\n\n`;
    const floors = Object.keys(itemsByFloor);
    floors.forEach((f) => {
      text += `📍 *${f}*\n`;
      itemsByFloor[f].forEach((item) => {
        const check = item.status === 'completed' ? '✅' : '⬜';
        const qtyStr = item.qty ? `(${item.qty} ${item.unit || ''})` : '';
        const sizeStr = item.size ? `[${item.size}]` : '';
        const assignStr = item.assignedTo ? `➡️ @${item.assignedTo}` : '';
        text += `${check} ${item.name} ${qtyStr} ${sizeStr} ${assignStr}\n`;
      });
      text += `\n`;
    });
    text += `Total items: ${stats.total} | Completed: ${stats.completed} | Pending: ${stats.pending}\n`;
    text += `Generated from DMart Real-Time Sync App`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner / Progress Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <span>DMart Shopping &amp; Item List</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Enter quantity, pieces, size &amp; follow up in real-time with all family / team members
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={handleCopyForWhatsApp}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              title="Copy formatted list for WhatsApp"
            >
              {copiedNotification ? (
                <>
                  <CheckCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy for WhatsApp</span>
                </>
              )}
            </button>

            <button
              onClick={() => onOpenAddModal()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Item</span>
            </button>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-1.5">
            <span>Overall Shopping Progress</span>
            <span className="font-bold text-emerald-700">
              {stats.completed} of {stats.total} items picked ({stats.percent}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Add Bar (Desktop & Mobile 1-Tap Form) */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 sm:p-4 shadow-2xs">
        <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Quick Add Item (Qty / Pcs / Size)</span>
        </div>
        <form onSubmit={handleQuickAdd} className="grid grid-cols-2 sm:grid-cols-12 gap-2">
          {/* Item Name */}
          <div className="col-span-2 sm:col-span-4">
            <input
              type="text"
              placeholder="Item Name (e.g. Basmati Rice, Vim Liquid...)"
              value={quickName}
              onChange={(e) => setQuickName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              required
            />
          </div>

          {/* Qty */}
          <div className="col-span-1 sm:col-span-2">
            <input
              type="text"
              placeholder="Qty (1, 2, 25)"
              value={quickQty}
              onChange={(e) => setQuickQty(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Unit / Pcs */}
          <div className="col-span-1 sm:col-span-2">
            <select
              value={quickUnit}
              onChange={(e) => setQuickUnit(e.target.value)}
              className="w-full px-2.5 py-2 text-sm bg-white rounded-lg border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="pcs">pcs</option>
              <option value="kg">kg</option>
              <option value="gm">gm</option>
              <option value="packet">packet</option>
              <option value="packets">packets</option>
              <option value="bottle">bottle</option>
              <option value="bottles">bottles</option>
              <option value="box">box</option>
              <option value="bundle">bundle</option>
              <option value="litres">litres</option>
              <option value="bag">bag</option>
              <option value="dozen">dozen</option>
            </select>
          </div>

          {/* Size */}
          <div className="col-span-1 sm:col-span-2">
            <input
              type="text"
              placeholder="Size (500g, 1L)"
              value={quickSize}
              onChange={(e) => setQuickSize(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Floor & Submit Button */}
          <div className="col-span-1 sm:col-span-2 flex gap-1.5">
            <select
              value={quickFloor}
              onChange={(e) => setQuickFloor(e.target.value)}
              className="w-full px-2 py-2 text-xs bg-white rounded-lg border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 truncate"
            >
              {existingFloors.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition shadow-xs flex items-center justify-center shrink-0"
              title="Add Item"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search items by name, quantity, size, notes, or assignee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Floor Pills & Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
          {/* Floor Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedFloor('All')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                selectedFloor === 'All'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Floors ({items.length})
            </button>
            {existingFloors.map((f) => {
              const count = items.filter((i) => i.floor === f).length;
              const pendingCount = items.filter((i) => i.floor === f && i.status !== 'completed').length;
              return (
                <button
                  key={f}
                  onClick={() => setSelectedFloor(f)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                    selectedFloor === f
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  <span>{f}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedFloor === f ? 'bg-emerald-700 text-white' : 'bg-emerald-200 text-emerald-900'
                  }`}>
                    {pendingCount}/{count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status & Assignee Dropdowns */}
          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
            >
              <option value="all">Status: All</option>
              <option value="pending">Pending Only</option>
              <option value="completed">Purchased (Struck)</option>
            </select>

            {/* Assignee Filter */}
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
            >
              <option value="all">Assignee: All</option>
              <option value="unassigned">Unassigned</option>
              {teamMembers.map((m) => (
                <option key={m} value={m}>👤 {m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Item List by Floor */}
      {Object.keys(itemsByFloor).length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No items match your filter</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try clearing your search query or switching floor/status filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedFloor('All');
              setStatusFilter('all');
              setAssignedFilter('all');
            }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        Object.keys(itemsByFloor).map((floorName) => {
          const floorItems = itemsByFloor[floorName];
          const floorCompleted = floorItems.filter((i) => i.status === 'completed').length;
          const floorPercent = Math.round((floorCompleted / floorItems.length) * 100);

          return (
            <div
              key={floorName}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
            >
              {/* Floor Header */}
              <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-md">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-800">
                      {floorName}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {floorCompleted} of {floorItems.length} items picked
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-24 sm:w-32 bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${floorPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600 min-w-8 text-right">
                    {floorPercent}%
                  </span>
                </div>
              </div>

              {/* Items in this Floor */}
              <div className="divide-y divide-slate-100">
                {floorItems.map((item) => {
                  const isDone = item.status === 'completed';

                  return (
                    <div
                      key={item.id}
                      className={`p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        isDone
                          ? 'bg-slate-50/60 opacity-65'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Left: Checkbox & Name */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => handleToggleComplete(item)}
                          className={`mt-0.5 p-1 rounded-md transition shrink-0 ${
                            isDone
                              ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                              : 'text-slate-400 hover:text-emerald-600 bg-slate-100 hover:bg-slate-200'
                          }`}
                          title={isDone ? 'Mark as Pending' : 'Mark as Purchased'}
                        >
                          {isDone ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              onClick={() => handleToggleComplete(item)}
                              className={`text-sm sm:text-base font-semibold cursor-pointer select-none ${
                                isDone
                                  ? 'line-through text-slate-400 decoration-slate-400 decoration-2'
                                  : 'text-slate-800 hover:text-emerald-700'
                              }`}
                            >
                              {item.name}
                            </span>

                            {/* Category Pill */}
                            {item.category && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                {item.category}
                              </span>
                            )}
                          </div>

                          {/* Notes */}
                          {item.notes && (
                            <p className="text-xs text-slate-500 mt-0.5 italic">
                              💡 {item.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Qty Stepper, Pcs/Unit, Size, Assignee, Actions */}
                      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                        {/* Qty Stepper */}
                        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item, -1)}
                            disabled={isDone}
                            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition disabled:opacity-40"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-800 min-w-8 text-center">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item, 1)}
                            disabled={isDone}
                            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition disabled:opacity-40"
                            title="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Unit / Pcs Badge */}
                        <span className="text-xs font-medium px-2 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {item.unit || 'pcs'}
                        </span>

                        {/* Size Badge */}
                        {item.size ? (
                          <span className="text-xs font-medium px-2 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                            📏 {item.size}
                          </span>
                        ) : null}

                        {/* Assigned To Pill */}
                        <div className="relative">
                          <select
                            value={item.assignedTo || ''}
                            onChange={(e) => {
                              onUpdateItem({
                                ...item,
                                assignedTo: e.target.value,
                                updatedAt: new Date().toISOString()
                              });
                            }}
                            className={`text-xs px-2 py-1 rounded-md border font-medium transition cursor-pointer ${
                              item.assignedTo
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : 'bg-slate-50 text-slate-500 border-slate-200'
                            }`}
                          >
                            <option value="">👤 Unassigned</option>
                            {teamMembers.map((m) => (
                              <option key={m} value={m}>
                                👤 {m}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Edit & Delete Actions */}
                        <div className="flex items-center gap-1 pl-1">
                          <button
                            onClick={() => onOpenEditModal(item)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            title="Edit Item Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete "${item.name}" from the list?`)) {
                                onDeleteItem(item.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
