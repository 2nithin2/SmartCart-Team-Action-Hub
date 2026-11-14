import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Check, Square, CheckSquare, Edit3, Trash2, 
  Shirt, User, Sparkles, Minus, Copy, CheckCheck, Tag, Palette
} from 'lucide-react';

const TRIAL_STATUS_MAP = {
  pending_trial: { label: '⏳ Needs Trial Room', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
  fitting_checked: { label: '👍 Fitting Checked', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
  in_cart: { label: '🛒 In Cart (To Buy)', bg: 'bg-purple-100 text-purple-800 border-purple-200' },
  purchased: { label: '✅ Purchased', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
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
  const [quickPerson, setQuickPerson] = useState(teamMembers[0] || '');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Sections list
  const sections = ["Men's Wear", "Women's Wear", "Kids Wear", "Footwear", "Ethnic Wear", "Accessories"];

  // Filtered items
  const filteredClothing = useMemo(() => {
    return clothingItems.filter((item) => {
      // Search
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCategory = item.category?.toLowerCase().includes(query);
        const matchesSize = item.size?.toLowerCase().includes(query);
        const matchesColor = item.color?.toLowerCase().includes(query);
        const matchesBrand = item.brand?.toLowerCase().includes(query);
        const matchesPerson = item.assignedTo?.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesSize && !matchesColor && !matchesBrand && !matchesPerson) {
          return false;
        }
      }

      // Section
      if (selectedSection !== 'All' && item.section !== selectedSection) {
        return false;
      }

      // Person
      if (selectedPerson !== 'all' && item.assignedTo !== selectedPerson) {
        return false;
      }

      // Trial Filter
      if (trialFilter !== 'all' && item.trialStatus !== trialFilter) {
        return false;
      }

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
    const currentQtyNum = parseFloat(item.qty) || 1;
    const nextQty = Math.max(1, currentQtyNum + delta);
    onUpdateClothing({
      ...item,
      qty: nextQty.toString(),
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
      id: `cl-${Date.now()}`,
      name: quickName.trim(),
      section: quickSection,
      category: 'General Apparel',
      size: quickSize.trim() || 'Standard',
      color: quickColor.trim(),
      qty: '1',
      unit: 'pcs',
      brand: '',
      assignedTo: quickPerson || teamMembers[0] || 'Unassigned',
      trialStatus: 'pending_trial',
      status: 'pending',
      priceEstimate: '',
      notes: '',
      updatedAt: new Date().toISOString()
    };

    onAddClothing(newItem);
    setQuickName('');
    setQuickColor('');
  };

  // Copy WhatsApp list for dressing shopping
  const handleCopyForWhatsApp = () => {
    let text = `👗 *Dressing & Clothing Shopping List*\n\n`;
    teamMembers.forEach((member) => {
      const memberClothes = clothingItems.filter((c) => c.assignedTo === member);
      if (memberClothes.length > 0) {
        text += `👤 *For: ${member}*\n`;
        memberClothes.forEach((item) => {
          const statusIcon = item.trialStatus === 'purchased' ? '✅' : '👗';
          const sizeStr = item.size ? `[Size: ${item.size}]` : '';
          const colorStr = item.color ? `(${item.color})` : '';
          const trialStr = item.trialStatus === 'pending_trial' ? '⏳(Needs Trial)' : '';
          text += `${statusIcon} ${item.name} ${sizeStr} ${colorStr} ${trialStr}\n`;
        });
        text += `\n`;
      }
    });
    text += `Total items: ${stats.total} | Purchased: ${stats.purchased} | Pending: ${stats.pending}\n`;
    text += `Generated from SmartCart & Team Hub`;

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
              <Shirt className="w-5 h-5 text-pink-600" />
              <span>Dressing &amp; Clothing Shopping Cart</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Track dress sizes (S/M/L/waist), colors, trial room fitting &amp; assign to person
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={handleCopyForWhatsApp}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
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
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-pink-600 hover:bg-pink-700 rounded-lg shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Clothing Item</span>
            </button>
          </div>
        </div>

        {/* Status Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-slate-100">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[11px] text-slate-500 font-medium">Total Clothes</div>
            <div className="text-lg font-bold text-slate-800">{stats.total} items</div>
          </div>
          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">
            <div className="text-[11px] text-amber-700 font-medium">Needs Trial Room</div>
            <div className="text-lg font-bold text-amber-800">{stats.inTrial} items</div>
          </div>
          <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100">
            <div className="text-[11px] text-purple-700 font-medium">In Cart (Ready to Buy)</div>
            <div className="text-lg font-bold text-purple-800">{stats.inCart} items</div>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="text-[11px] text-emerald-700 font-medium">Purchased</div>
            <div className="text-lg font-bold text-emerald-800">{stats.purchased} items</div>
          </div>
        </div>
      </div>

      {/* Quick Add Bar for Clothes */}
      <div className="bg-pink-50/80 border border-pink-200 rounded-2xl p-3.5 sm:p-4 shadow-2xs">
        <div className="text-xs font-bold text-pink-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-pink-600" />
          <span>Quick Add Dress / Clothing (Size, Color, For Person)</span>
        </div>
        <form onSubmit={handleQuickAdd} className="grid grid-cols-2 sm:grid-cols-12 gap-2">
          {/* Dress Name */}
          <div className="col-span-2 sm:col-span-3">
            <input
              type="text"
              placeholder="Item (Formal Shirt, Kurti, Jeans...)"
              value={quickName}
              onChange={(e) => setQuickName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
              required
            />
          </div>

          {/* Section */}
          <div className="col-span-1 sm:col-span-2">
            <select
              value={quickSection}
              onChange={(e) => setQuickSection(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-white rounded-lg border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {sections.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Size */}
          <div className="col-span-1 sm:col-span-2">
            <input
              type="text"
              placeholder="Size (S/M/L/32/38)"
              value={quickSize}
              onChange={(e) => setQuickSize(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500 font-semibold"
            />
          </div>

          {/* Color */}
          <div className="col-span-1 sm:col-span-2">
            <input
              type="text"
              placeholder="Color (Blue, Maroon...)"
              value={quickColor}
              onChange={(e) => setQuickColor(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* For Person & Add Button */}
          <div className="col-span-1 sm:col-span-3 flex gap-1.5">
            <select
              value={quickPerson}
              onChange={(e) => setQuickPerson(e.target.value)}
              className="w-full px-2 py-2 text-xs bg-white rounded-lg border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium truncate"
            >
              {teamMembers.map((m) => (
                <option key={m} value={m}>👤 For: {m}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-3.5 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg text-sm transition shadow-xs flex items-center justify-center shrink-0"
              title="Add Clothing"
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
            placeholder="Search clothes by name, size, color, brand, or person..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
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

        {/* Section Pills & Person Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
          {/* Section Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedSection('All')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                selectedSection === 'All'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                    selectedSection === sec
                      ? 'bg-pink-600 text-white'
                      : 'bg-pink-50 text-pink-900 hover:bg-pink-100'
                  }`}
                >
                  <span>{sec}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedSection === sec ? 'bg-pink-700 text-white' : 'bg-pink-200 text-pink-900'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Person & Trial Filter Dropdowns */}
          <div className="flex items-center gap-2">
            <select
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
            >
              <option value="all">For Person: All</option>
              {teamMembers.map((m) => (
                <option key={m} value={m}>👤 {m}</option>
              ))}
            </select>

            <select
              value={trialFilter}
              onChange={(e) => setTrialFilter(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
            >
              <option value="all">Trial Status: All</option>
              <option value="pending_trial">Needs Trial</option>
              <option value="fitting_checked">Fitting OK</option>
              <option value="in_cart">In Cart</option>
              <option value="purchased">Purchased</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clothing List Cards */}
      {filteredClothing.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
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
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredClothing.map((item) => {
            const isPurchased = item.trialStatus === 'purchased';
            const trialStyle = TRIAL_STATUS_MAP[item.trialStatus] || TRIAL_STATUS_MAP.pending_trial;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-4 shadow-xs transition flex flex-col justify-between gap-3 ${
                  isPurchased
                    ? 'border-slate-200 bg-slate-50/70 opacity-70'
                    : 'border-slate-200 hover:border-pink-300'
                }`}
              >
                <div>
                  {/* Top tags row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-pink-50 text-pink-800 border border-pink-200">
                      {item.section}
                    </span>

                    {/* Person Badge */}
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>For: {item.assignedTo || 'Unassigned'}</span>
                    </span>
                  </div>

                  {/* Name and checkbox */}
                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={() => handleTogglePurchased(item)}
                      className={`mt-0.5 p-1 rounded-md transition shrink-0 ${
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
                      <h3 className={`text-base font-bold ${
                        isPurchased ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}>
                        {item.name}
                      </h3>

                      {/* Specs: Size, Color, Brand */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {/* Size chip */}
                        <span className="text-xs font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                          📏 Size: {item.size}
                        </span>

                        {/* Color chip */}
                        {item.color && (
                          <span className="text-xs font-medium px-2 py-1 rounded-md bg-pink-50 text-pink-900 border border-pink-200 flex items-center gap-1">
                            <Palette className="w-3 h-3 text-pink-600" />
                            <span>{item.color}</span>
                          </span>
                        )}

                        {/* Brand chip */}
                        {item.brand && (
                          <span className="text-xs font-medium px-2 py-1 rounded-md bg-slate-50 text-slate-600 border border-slate-200">
                            🏷️ {item.brand}
                          </span>
                        )}

                        {/* Price estimate */}
                        {item.priceEstimate && (
                          <span className="text-xs font-semibold px-2 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {item.priceEstimate}
                          </span>
                        )}
                      </div>

                      {/* Notes */}
                      {item.notes && (
                        <p className="text-xs text-slate-500 mt-2 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                          💡 {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Bar: Trial Status Selector, Qty Stepper, Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  {/* Trial status selector */}
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
                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${trialStyle.bg}`}
                  >
                    <option value="pending_trial">⏳ Needs Trial Room</option>
                    <option value="fitting_checked">👍 Fitting Checked</option>
                    <option value="in_cart">🛒 In Cart (To Buy)</option>
                    <option value="purchased">✅ Purchased</option>
                  </select>

                  <div className="flex items-center gap-2">
                    {/* Qty Stepper */}
                    <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item, -1)}
                        className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 text-xs font-bold text-slate-800 min-w-8 text-center">
                        {item.qty} {item.unit || 'pcs'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item, 1)}
                        className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Edit & Delete */}
                    <button
                      onClick={() => onOpenEditModal(item)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      title="Edit Clothing Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${item.name}" from clothing cart?`)) {
                          onDeleteClothing(item.id);
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

