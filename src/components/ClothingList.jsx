import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Check, Square, CheckSquare, Edit3, Trash2, 
  Shirt, User, Sparkles, Minus, Copy, CheckCheck, Tag, Palette,
  ShoppingBag
} from 'lucide-react';
import { haptics } from '../utils/haptics';

const TRIAL_STATUS_MAP = {
  pending_trial: { 
    label: '⏳ Needs Trial Room', 
    bg: 'bg-amber-950/70 text-amber-200 border-amber-500/50' 
  },
  fitting_checked: { 
    label: '👍 Fitting Checked', 
    bg: 'bg-sky-950/70 text-sky-200 border-sky-500/50' 
  },
  in_cart: { 
    label: '🛒 In Cart (To Buy)', 
    bg: 'bg-fuchsia-950/70 text-fuchsia-200 border-fuchsia-500/50' 
  },
  purchased: { 
    label: '✅ Purchased', 
    bg: 'bg-emerald-950/70 text-emerald-200 border-emerald-500/50' 
  }
};

export default function ClothingList({
  clothingItems,
  onUpdateClothing,
  onDeleteClothing,
  onAddClothing,
  onOpenAddModal,
  onOpenEditModal,
  teamMembers
}) {
  const [search, setSearch] = useState('');
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedPerson, setSelectedPerson] = useState('all');
  const [trialFilter, setTrialFilter] = useState('all');

  // Quick Add State
  const [quickName, setQuickName] = useState('');
  const [quickSection, setQuickSection] = useState("Men's Wear");
  const [quickSize, setQuickSize] = useState('L');
  const [quickColor, setQuickColor] = useState('');
  const [quickPerson, setQuickPerson] = useState(teamMembers[0] || 'Unassigned');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Sections list
  const sections = ["Men's Wear", "Women's Wear", "Kids Wear", "Footwear", "Ethnic Wear", "Accessories"];

  // Filtered items
  const filteredClothing = useMemo(() => {
    return clothingItems.filter((item) => {
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = item.name?.toLowerCase().includes(query);
        const matchesCategory = item.category?.toLowerCase().includes(query);
        const matchesSize = (item.size || item.sizeSpec)?.toLowerCase().includes(query);
        const matchesColor = item.color?.toLowerCase().includes(query);
        const matchesBrand = item.brand?.toLowerCase().includes(query);
        const matchesPerson = (item.assignee || item.assignedTo)?.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesSize && !matchesColor && !matchesBrand && !matchesPerson) {
          return false;
        }
      }

      if (selectedSection !== 'All' && item.section !== selectedSection) return false;

      const person = item.assignee || item.assignedTo;
      if (selectedPerson !== 'all' && person !== selectedPerson) return false;

      if (trialFilter !== 'all' && item.trialStatus !== trialFilter) return false;

      return true;
    });
  }, [clothingItems, search, selectedSection, selectedPerson, trialFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = clothingItems.length;
    const purchased = clothingItems.filter((c) => c.trialStatus === 'purchased').length;
    const pending = total - purchased;
    const inTrial = clothingItems.filter((c) => c.trialStatus === 'pending_trial').length;
    const inCart = clothingItems.filter((c) => c.trialStatus === 'in_cart').length;
    return { total, purchased, pending, inTrial, inCart };
  }, [clothingItems]);

  // Stepper increment/decrement
  const handleQtyChange = (item, delta) => {
    haptics.tick();
    const currentQtyNum = parseFloat(item.quantity || item.qty) || 1;
    const nextQty = Math.max(1, currentQtyNum + delta);
    onUpdateClothing({
      ...item,
      quantity: nextQty,
      qty: nextQty,
      updatedAt: new Date().toISOString()
    });
  };

  // Toggle purchased status
  const handleTogglePurchased = (item) => {
    const isCurrentlyPurchased = item.trialStatus === 'purchased';
    if (!isCurrentlyPurchased) {
      haptics.success();
    } else {
      haptics.tick();
    }
    const nextTrial = isCurrentlyPurchased ? 'in_cart' : 'purchased';
    onUpdateClothing({
      ...item,
      trialStatus: nextTrial,
      status: nextTrial === 'purchased' ? 'completed' : 'pending',
      updatedAt: new Date().toISOString()
    });
  };

  // Quick inline add
  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickName.trim()) return;

    haptics.click();
    const newItem = {
      itemId: `cl_${Date.now()}`,
      id: `cl_${Date.now()}`,
      name: quickName.trim(),
      section: quickSection,
      category: 'General Apparel',
      size: quickSize.trim() || 'Standard',
      sizeSpec: quickSize.trim() || 'Standard',
      color: quickColor.trim(),
      quantity: 1,
      qty: 1,
      unit: 'pcs',
      brand: '',
      assignee: quickPerson || 'Unassigned',
      assignedTo: quickPerson || 'Unassigned',
      trialStatus: 'pending_trial',
      status: 'pending',
      priceEstimate: '',
      note: '',
      notes: '',
      updatedAt: new Date().toISOString()
    };

    onAddClothing(newItem);
    setQuickName('');
    setQuickColor('');
  };

  // WhatsApp formatted clipboard copy
  const handleCopyForWhatsApp = () => {
    haptics.click();
    let text = `👗 *SmartCart - Dressing & Clothing Shopping List*\n\n`;
    teamMembers.forEach((member) => {
      const memberClothes = clothingItems.filter((c) => (c.assignee === member || c.assignedTo === member));
      if (memberClothes.length > 0) {
        text += `👤 *For: ${member}*\n`;
        memberClothes.forEach((item) => {
          const statusIcon = item.trialStatus === 'purchased' ? '✅' : '👗';
          const sizeStr = item.size ? `[Size: ${item.size}]` : '';
          const colorStr = item.color ? `(${item.color})` : '';
          const trialStr = item.trialStatus === 'pending_trial' ? '⏳(Needs Trial Room)' : '';
          text += `${statusIcon} ${item.name} ${sizeStr} ${colorStr} ${trialStr}\n`;
        });
        text += `\n`;
      }
    });
    text += `Total: ${stats.total} | Bought: ${stats.purchased} | Pending: ${stats.pending}\n`;
    text += `Generated from SmartCart & Team Hub`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    });
  };

  return (
    <div className="space-y-4 pb-16">
      {/* 🌹 Deep Velvet Plum / Rose Header & Stats Card */}
      <div className="dark-glass-card rounded-2xl p-4 sm:p-5 border-pink-500/30 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-3 bg-pink-500/20 text-pink-300 rounded-2xl border border-pink-500/40 shadow-inner">
              <Shirt className="w-6 h-6 text-pink-400 animate-pulse-subtle" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-sm">
                  Dressing &amp; Clothing Cart
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-pink-500/30 text-pink-300 border border-pink-400/40">
                  Plum Velvet Studio
                </span>
              </div>
              <p className="text-xs text-pink-200/80 mt-0.5 font-medium">
                Size measurements (S/M/L/waist) • Trial room fitting status • Delegated by person
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={handleCopyForWhatsApp}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-pink-100 bg-pink-950/50 hover:bg-pink-900/60 border border-pink-500/40 rounded-xl shadow-xs transition hover-wiggle"
            >
              {copiedNotification ? (
                <>
                  <CheckCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-pink-300" />
                  <span>Copy for WhatsApp</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                haptics.click();
                onOpenAddModal();
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-linear-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 rounded-xl shadow-lg shadow-pink-900/40 transition hover-wiggle"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Clothing Item</span>
            </button>
          </div>
        </div>

        {/* Status Counters with Dark Frosted Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3.5 border-t border-pink-500/20">
          <div className="p-3 dark-glass-card rounded-xl border border-pink-500/20 shadow-xs">
            <div className="text-[11px] text-pink-300/80 font-bold uppercase tracking-wider">Total Clothes</div>
            <div className="text-2xl font-black text-white mt-0.5">{stats.total}</div>
          </div>
          <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-500/30 shadow-xs">
            <div className="text-[11px] text-amber-300 font-bold uppercase tracking-wider">Needs Trial Room</div>
            <div className="text-2xl font-black text-amber-200 mt-0.5">{stats.inTrial}</div>
          </div>
          <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-500/30 shadow-xs">
            <div className="text-[11px] text-purple-300 font-bold uppercase tracking-wider">In Cart (Ready)</div>
            <div className="text-2xl font-black text-purple-200 mt-0.5">{stats.inCart}</div>
          </div>
          <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/30 shadow-xs">
            <div className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider">Purchased</div>
            <div className="text-2xl font-black text-emerald-200 mt-0.5">{stats.purchased}</div>
          </div>
        </div>
      </div>

      {/* Quick Add Bar for Clothes */}
      <div className="dark-glass-card rounded-2xl p-4 border border-pink-500/30 shadow-lg">
        <div className="text-xs font-bold text-pink-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>Quick Add Dress / Clothing (Size, Color, For Person)</span>
        </div>
        <form onSubmit={handleQuickAdd} className="grid grid-cols-2 sm:grid-cols-12 gap-2.5">
          <div className="col-span-2 sm:col-span-3">
            <input
              type="text"
              placeholder="Item (Formal Shirt, Kurti, Jeans...)"
              value={quickName}
              onChange={(e) => setQuickName(e.target.value)}
              className="dark-glass-input w-full px-3.5 py-2 text-sm rounded-xl font-medium focus:outline-none"
              required
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <select
              value={quickSection}
              onChange={(e) => setQuickSection(e.target.value)}
              className="dark-glass-input w-full px-2.5 py-2 text-xs font-semibold rounded-xl focus:outline-none"
            >
              {sections.map((s) => (
                <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>
              ))}
            </select>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <input
              type="text"
              placeholder="Size (S/M/L/32/38)"
              value={quickSize}
              onChange={(e) => setQuickSize(e.target.value)}
              className="dark-glass-input w-full px-3 py-2 text-sm rounded-xl font-bold focus:outline-none"
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <input
              type="text"
              placeholder="Color (Blue, Maroon...)"
              value={quickColor}
              onChange={(e) => setQuickColor(e.target.value)}
              className="dark-glass-input w-full px-3 py-2 text-sm rounded-xl focus:outline-none"
            />
          </div>

          <div className="col-span-1 sm:col-span-3 flex gap-1.5">
            <select
              value={quickPerson}
              onChange={(e) => setQuickPerson(e.target.value)}
              className="dark-glass-input w-full px-2 py-2 text-xs font-semibold rounded-xl focus:outline-none truncate"
            >
              <option value="Unassigned" className="bg-slate-900 text-white">👤 Unassigned</option>
              {teamMembers.map((m) => (
                <option key={m} value={m} className="bg-slate-900 text-white">👤 {m}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-3.5 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-sm transition shadow-md hover-wiggle flex items-center justify-center shrink-0"
              title="Add Clothing"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="dark-glass-card rounded-2xl p-4 space-y-3.5 border-pink-500/20">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-pink-300/60" />
          <input
            type="text"
            placeholder="Search clothes by name, size, color, brand, or person..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="dark-glass-input w-full pl-10 pr-16 py-2.5 text-sm rounded-xl focus:outline-none font-medium"
          />
          {search && (
            <button
              onClick={() => {
                haptics.tick();
                setSearch('');
              }}
              className="absolute right-3.5 top-2.5 text-xs font-semibold text-pink-300 hover:text-white bg-pink-900/40 px-2 py-0.5 rounded-md"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-pink-500/20">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => {
                haptics.selection();
                setSelectedSection('All');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                selectedSection === 'All'
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30 border border-pink-400/50'
                  : 'bg-pink-950/40 text-pink-200 hover:bg-pink-900/60 border border-pink-500/30'
              }`}
            >
              All Sections ({clothingItems.length})
            </button>
            {sections.map((sec) => {
              const count = clothingItems.filter((c) => c.section === sec).length;
              return (
                <button
                  key={sec}
                  onClick={() => {
                    haptics.selection();
                    setSelectedSection(sec);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedSection === sec
                      ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30 border border-pink-400/50'
                      : 'bg-pink-950/40 text-pink-200 hover:bg-pink-900/60 border border-pink-500/30'
                  }`}
                >
                  <span>{sec}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedSection === sec ? 'bg-pink-700 text-white' : 'bg-pink-900/80 text-pink-200'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedPerson}
              onChange={(e) => {
                haptics.selection();
                setSelectedPerson(e.target.value);
              }}
              className="dark-glass-input px-3 py-1.5 text-xs rounded-xl font-bold text-pink-100"
            >
              <option value="all" className="bg-slate-900 text-white">For Person: All</option>
              {teamMembers.map((m) => (
                <option key={m} value={m} className="bg-slate-900 text-white">👤 {m}</option>
              ))}
            </select>

            <select
              value={trialFilter}
              onChange={(e) => {
                haptics.selection();
                setTrialFilter(e.target.value);
              }}
              className="dark-glass-input px-3 py-1.5 text-xs rounded-xl font-bold text-pink-100"
            >
              <option value="all" className="bg-slate-900 text-white">Trial Status: All</option>
              <option value="pending_trial" className="bg-slate-900 text-white">Needs Trial Room</option>
              <option value="fitting_checked" className="bg-slate-900 text-white">Fitting OK</option>
              <option value="in_cart" className="bg-slate-900 text-white">In Cart</option>
              <option value="purchased" className="bg-slate-900 text-white">Purchased</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clothing List Cards with Glassmorphism */}
      {filteredClothing.length === 0 ? (
        <div className="dark-glass-card rounded-2xl p-12 text-center border-pink-500/20">
          <Shirt className="w-12 h-12 text-pink-300/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No clothing items match</h3>
          <p className="text-xs text-pink-200/70 mt-1">
            Try resetting your search query or switching section filters.
          </p>
          <button
            onClick={() => {
              haptics.click();
              setSearch('');
              setSelectedSection('All');
              setSelectedPerson('all');
              setTrialFilter('all');
            }}
            className="mt-4 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition shadow-md"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredClothing.map((item) => {
            const isPurchased = item.trialStatus === 'purchased';
            const trialStyle = TRIAL_STATUS_MAP[item.trialStatus] || TRIAL_STATUS_MAP.pending_trial;
            const assigneeName = item.assignee || item.assignedTo || 'Unassigned';

            return (
              <div
                key={item.itemId || item.id}
                className={`dark-glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 transition-all duration-200 border-pink-500/25 hover:border-pink-500/50 ${
                  isPurchased
                    ? 'opacity-60 bg-pink-950/20'
                    : 'shadow-lg hover:shadow-pink-900/20'
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg bg-pink-950/80 text-pink-200 border border-pink-500/40">
                      {item.section}
                    </span>

                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-200 border border-indigo-500/40 flex items-center gap-1">
                      <User className="w-3 h-3 text-indigo-400" />
                      <span>For: {assigneeName}</span>
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={() => handleTogglePurchased(item)}
                      className={`mt-0.5 p-1 rounded-lg transition shrink-0 ${
                        isPurchased
                          ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/40'
                          : 'text-pink-300/60 hover:text-pink-200 bg-white/5 border border-white/10 hover-wiggle'
                      }`}
                      title={isPurchased ? 'Mark as Not Purchased' : 'Mark as Purchased'}
                    >
                      {isPurchased ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400 animate-icon-pop" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <h3 className={`text-base font-extrabold tracking-tight ${
                        isPurchased ? 'line-through text-slate-400' : 'text-white'
                      }`}>
                        {item.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-pink-950/60 text-pink-100 border border-pink-500/40 shadow-xs">
                          📏 Size: {item.size || item.sizeSpec}
                        </span>

                        {item.color && (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-950/60 text-rose-200 border border-rose-500/40 flex items-center gap-1 shadow-xs">
                            <Palette className="w-3 h-3 text-rose-400" />
                            <span>{item.color}</span>
                          </span>
                        )}

                        {item.brand && (
                          <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60 shadow-xs">
                            🏷️ {item.brand}
                          </span>
                        )}

                        {item.priceEstimate && (
                          <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 shadow-xs">
                            {item.priceEstimate}
                          </span>
                        )}
                      </div>

                      {item.note && (
                        <p className="text-xs text-pink-200/90 mt-2 italic bg-black/30 p-2.5 rounded-xl border border-pink-500/20">
                          💡 {item.note}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-pink-500/20 flex flex-wrap items-center justify-between gap-2">
                  <select
                    value={item.trialStatus}
                    onChange={(e) => {
                      haptics.selection();
                      const nextTrial = e.target.value;
                      onUpdateClothing({
                        ...item,
                        trialStatus: nextTrial,
                        status: nextTrial === 'purchased' ? 'completed' : 'pending',
                        updatedAt: new Date().toISOString()
                      });
                    }}
                    className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border transition cursor-pointer shadow-xs ${trialStyle.bg}`}
                  >
                    <option value="pending_trial" className="bg-slate-900 text-amber-200">⏳ Needs Trial Room</option>
                    <option value="fitting_checked" className="bg-slate-900 text-sky-200">👍 Fitting Checked</option>
                    <option value="in_cart" className="bg-slate-900 text-fuchsia-200">🛒 In Cart (To Buy)</option>
                    <option value="purchased" className="bg-slate-900 text-emerald-200">✅ Purchased</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-pink-950/60 rounded-xl p-0.5 border border-pink-500/40 shadow-xs">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item, -1)}
                        className="p-1 text-pink-200 hover:text-white hover:bg-pink-800/60 rounded-lg transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 text-xs font-extrabold text-white min-w-8 text-center">
                        {item.quantity || item.qty} {item.unit || 'pcs'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item, 1)}
                        className="p-1 text-pink-200 hover:text-white hover:bg-pink-800/60 rounded-lg transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        haptics.click();
                        onOpenEditModal(item);
                      }}
                      className="p-1.5 text-pink-300 hover:text-white hover:bg-pink-900/50 rounded-lg transition hover-wiggle"
                      title="Edit Clothing Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        haptics.warning();
                        if (window.confirm(`Delete "${item.name}" from clothing cart?`)) {
                          onDeleteClothing(item.itemId || item.id);
                        }
                      }}
                      className="p-1.5 text-pink-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition hover-wiggle"
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
      )}
    </div>
  );
}
