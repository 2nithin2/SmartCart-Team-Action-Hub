import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Check, Square, CheckSquare, Edit3, Trash2, 
  Shirt, User, Sparkles, Minus, Copy, CheckCheck, Tag, Palette,
  ShoppingBag
} from 'lucide-react';

const TRIAL_STATUS_MAP = {
  pending_trial: { label: '⏳ Needs Trial Room', bg: 'bg-amber-100/80 text-amber-900 border-amber-300/60' },
  fitting_checked: { label: '👍 Fitting Checked', bg: 'bg-blue-100/80 text-blue-900 border-blue-300/60' },
  in_cart: { label: '🛒 In Cart (To Buy)', bg: 'bg-purple-100/80 text-purple-900 border-purple-300/60' },
  purchased: { label: '✅ Purchased', bg: 'bg-emerald-100/80 text-emerald-900 border-emerald-300/60' }
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
    const nextTrial = item.trialStatus === 'purchased' ? 'in_cart' : 'purchased';
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
    <div className="space-y-5 pb-16">
      {/* Top Banner / Progress Header with Glassmorphism */}
      <div className="glass-card rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-pink-100/90 text-pink-700 rounded-xl shadow-xs">
              <Shirt className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
                Dressing &amp; Clothing Shopping Cart
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Size measurements (S/M/L/waist) • Trial room fitting status • Delegated by person
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={handleCopyForWhatsApp}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white/80 hover:bg-white border border-slate-200 rounded-xl shadow-xs transition"
            >
              {copiedNotification ? (
                <>
                  <CheckCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy for WhatsApp</span>
                </>
              )}
            </button>

            <button
              onClick={() => onOpenAddModal()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-linear-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 rounded-xl shadow-md shadow-pink-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Clothing Item</span>
            </button>
          </div>
        </div>

        {/* Status Counters with Glass Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3.5 border-t border-slate-200/60">
          <div className="p-3 bg-white/70 rounded-xl border border-white/80 shadow-2xs">
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Clothes</div>
            <div className="text-xl font-black text-slate-800 mt-0.5">{stats.total}</div>
          </div>
          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 shadow-2xs">
            <div className="text-[11px] text-amber-800 font-bold uppercase tracking-wider">Needs Trial Room</div>
            <div className="text-xl font-black text-amber-900 mt-0.5">{stats.inTrial}</div>
          </div>
          <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200/60 shadow-2xs">
            <div className="text-[11px] text-purple-800 font-bold uppercase tracking-wider">In Cart (Ready)</div>
            <div className="text-xl font-black text-purple-900 mt-0.5">{stats.inCart}</div>
          </div>
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/60 shadow-2xs">
            <div className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider">Purchased</div>
            <div className="text-xl font-black text-emerald-900 mt-0.5">{stats.purchased}</div>
          </div>
        </div>
      </div>

      {/* Quick Add Bar for Clothes */}
      <div className="glass-card rounded-2xl p-4 border border-pink-400/30">
        <div className="text-xs font-bold text-pink-950 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-pink-600" />
          <span>Quick Add Dress / Clothing (Size, Color, For Person)</span>
        </div>
        <form onSubmit={handleQuickAdd} className="grid grid-cols-2 sm:grid-cols-12 gap-2.5">
          <div className="col-span-2 sm:col-span-3">
            <input
              type="text"
              placeholder="Item (Formal Shirt, Kurti, Jeans...)"
              value={quickName}
              onChange={(e) => setQuickName(e.target.value)}
              className="glass-input w-full px-3.5 py-2 text-sm rounded-xl font-medium focus:outline-none"
              required
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <select
              value={quickSection}
              onChange={(e) => setQuickSection(e.target.value)}
              className="glass-input w-full px-2.5 py-2 text-xs font-semibold rounded-xl focus:outline-none bg-white/90"
            >
              {sections.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <input
              type="text"
              placeholder="Size (S/M/L/32/38)"
              value={quickSize}
              onChange={(e) => setQuickSize(e.target.value)}
              className="glass-input w-full px-3 py-2 text-sm rounded-xl font-bold focus:outline-none"
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <input
              type="text"
              placeholder="Color (Blue, Maroon...)"
              value={quickColor}
              onChange={(e) => setQuickColor(e.target.value)}
              className="glass-input w-full px-3 py-2 text-sm rounded-xl focus:outline-none"
            />
          </div>

          <div className="col-span-1 sm:col-span-3 flex gap-1.5">
            <select
              value={quickPerson}
              onChange={(e) => setQuickPerson(e.target.value)}
              className="glass-input w-full px-2 py-2 text-xs font-semibold rounded-xl focus:outline-none bg-white/90 truncate"
            >
              <option value="Unassigned">👤 Unassigned</option>
              {teamMembers.map((m) => (
                <option key={m} value={m}>👤 {m}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-3.5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-sm transition shadow-sm flex items-center justify-center shrink-0"
              title="Add Clothing"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="glass-card rounded-2xl p-4 space-y-3.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search clothes by name, size, color, brand, or person..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-10 pr-16 py-2.5 text-sm rounded-xl focus:outline-none font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-slate-200/60">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedSection('All')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                selectedSection === 'All'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200'
              }`}
            >
              All Sections ({clothingItems.length})
            </button>
            {sections.map((sec) => {
              const count = clothingItems.filter((c) => c.section === sec).length;
              return (
                <button
                  key={sec}
                  onClick={() => setSelectedSection(sec)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedSection === sec
                      ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
                      : 'bg-pink-50/80 text-pink-900 hover:bg-pink-100 border border-pink-200/60'
                  }`}
                >
                  <span>{sec}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedSection === sec ? 'bg-pink-700 text-white' : 'bg-pink-200/80 text-pink-900'
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
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="glass-input px-3 py-1.5 text-xs rounded-xl font-bold text-slate-700 bg-white/90"
            >
              <option value="all">For Person: All</option>
              {teamMembers.map((m) => (
                <option key={m} value={m}>👤 {m}</option>
              ))}
            </select>

            <select
              value={trialFilter}
              onChange={(e) => setTrialFilter(e.target.value)}
              className="glass-input px-3 py-1.5 text-xs rounded-xl font-bold text-slate-700 bg-white/90"
            >
              <option value="all">Trial Status: All</option>
              <option value="pending_trial">Needs Trial Room</option>
              <option value="fitting_checked">Fitting OK</option>
              <option value="in_cart">In Cart</option>
              <option value="purchased">Purchased</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clothing List Cards with Glassmorphism */}
      {filteredClothing.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Shirt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No clothing items match</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try resetting your search query or switching section filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedSection('All');
              setSelectedPerson('all');
              setTrialFilter('all');
            }}
            className="mt-4 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold"
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
                className={`glass-card glass-card-hover rounded-2xl p-4 flex flex-col justify-between gap-3 ${
                  isPurchased
                    ? 'opacity-65'
                    : 'border-white/80'
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg bg-pink-100/80 text-pink-800 border border-pink-200">
                      {item.section}
                    </span>

                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>For: {assigneeName}</span>
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={() => handleTogglePurchased(item)}
                      className={`mt-0.5 p-1 rounded-lg transition shrink-0 ${
                        isPurchased
                          ? 'text-emerald-600 bg-emerald-50'
                          : 'text-slate-400 hover:text-pink-600 bg-slate-100'
                      }`}
                      title={isPurchased ? 'Mark as Not Purchased' : 'Mark as Purchased'}
                    >
                      {isPurchased ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <h3 className={`text-base font-extrabold ${
                        isPurchased ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}>
                        {item.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-white/90 text-slate-800 border border-slate-200 shadow-2xs">
                          📏 Size: {item.size || item.sizeSpec}
                        </span>

                        {item.color && (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-pink-50 text-pink-900 border border-pink-200 flex items-center gap-1 shadow-2xs">
                            <Palette className="w-3 h-3 text-pink-600" />
                            <span>{item.color}</span>
                          </span>
                        )}

                        {item.brand && (
                          <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs">
                            🏷️ {item.brand}
                          </span>
                        )}

                        {item.priceEstimate && (
                          <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                            {item.priceEstimate}
                          </span>
                        )}
                      </div>

                      {item.note && (
                        <p className="text-xs text-slate-500 mt-2 italic bg-white/60 p-2 rounded-xl border border-slate-100">
                          💡 {item.note}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
                  <select
                    value={item.trialStatus}
                    onChange={(e) => {
                      const nextTrial = e.target.value;
                      onUpdateClothing({
                        ...item,
                        trialStatus: nextTrial,
                        status: nextTrial === 'purchased' ? 'completed' : 'pending',
                        updatedAt: new Date().toISOString()
                      });
                    }}
                    className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border transition cursor-pointer shadow-2xs ${trialStyle.bg}`}
                  >
                    <option value="pending_trial">⏳ Needs Trial Room</option>
                    <option value="fitting_checked">👍 Fitting Checked</option>
                    <option value="in_cart">🛒 In Cart (To Buy)</option>
                    <option value="purchased">✅ Purchased</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white/90 rounded-xl p-0.5 border border-slate-200 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item, -1)}
                        className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 text-xs font-extrabold text-slate-800 min-w-8 text-center">
                        {item.quantity || item.qty} {item.unit || 'pcs'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item, 1)}
                        className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => onOpenEditModal(item)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition"
                      title="Edit Clothing Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${item.name}" from clothing cart?`)) {
                          onDeleteClothing(item.itemId || item.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
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
