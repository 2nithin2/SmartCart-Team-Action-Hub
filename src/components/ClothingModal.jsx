import React, { useState, useEffect } from 'react';
import { X, Check, Shirt, User, Tag, Palette, DollarSign, FileText } from 'lucide-react';

const SECTIONS = [
  "Men's Wear",
  "Women's Wear",
  "Kids Wear",
  "Footwear",
  "Ethnic Wear",
  "Accessories"
];

const STANDARD_SIZES = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL',
  '28', '30', '32', '34', '36', '38', '40', '42',
  'Free Size',
  'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11',
  'Kids 2-3Y', 'Kids 4-5Y', 'Kids 6-7Y', 'Kids 8-9Y', 'Kids 10-12Y'
];

export default function ClothingModal({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
  teamMembers = []
}) {
  const [name, setName] = useState('');
  const [section, setSection] = useState("Men's Wear");
  const [category, setCategory] = useState('Shirts');
  const [size, setSize] = useState('L');
  const [customSize, setCustomSize] = useState('');
  const [color, setColor] = useState('');
  const [qty, setQty] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [brand, setBrand] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [trialStatus, setTrialStatus] = useState('pending_trial');
  const [priceEstimate, setPriceEstimate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name || '');
      setSection(itemToEdit.section || "Men's Wear");
      setCategory(itemToEdit.category || 'Shirts');
      if (STANDARD_SIZES.includes(itemToEdit.size)) {
        setSize(itemToEdit.size);
        setCustomSize('');
      } else {
        setSize('custom');
        setCustomSize(itemToEdit.size || '');
      }
      setColor(itemToEdit.color || '');
      setQty(itemToEdit.qty?.toString() || itemToEdit.quantity?.toString() || '1');
      setUnit(itemToEdit.unit || 'pcs');
      setBrand(itemToEdit.brand || '');
      setAssignedTo(itemToEdit.assignedTo || itemToEdit.assignee || '');
      setTrialStatus(itemToEdit.trialStatus || 'pending_trial');
      setPriceEstimate(itemToEdit.priceEstimate || '');
      setNotes(itemToEdit.notes || itemToEdit.note || '');
    } else {
      setName('');
      setSection("Men's Wear");
      setCategory('Shirts');
      setSize('L');
      setCustomSize('');
      setColor('');
      setQty('1');
      setUnit('pcs');
      setBrand('');
      setAssignedTo(teamMembers[0] || 'Unassigned');
      setTrialStatus('pending_trial');
      setPriceEstimate('');
      setNotes('');
    }
  }, [itemToEdit, isOpen, teamMembers]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalSize = size === 'custom' ? (customSize.trim() || 'Standard') : size;

    const clothingData = {
      id: itemToEdit?.id || itemToEdit?.itemId || `cl-${Date.now()}`,
      itemId: itemToEdit?.id || itemToEdit?.itemId || `cl-${Date.now()}`,
      name: name.trim(),
      section,
      category: category.trim() || 'General Apparel',
      size: finalSize,
      sizeSpec: finalSize,
      color: color.trim(),
      qty: parseFloat(qty) || 1,
      quantity: parseFloat(qty) || 1,
      unit: unit.trim() || 'pcs',
      brand: brand.trim(),
      assignedTo: assignedTo.trim() || 'Unassigned',
      assignee: assignedTo.trim() || 'Unassigned',
      trialStatus,
      status: trialStatus === 'purchased' ? 'completed' : 'pending',
      priceEstimate: priceEstimate.trim(),
      notes: notes.trim(),
      note: notes.trim(),
      updatedAt: new Date().toISOString()
    };

    onSave(clothingData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/15">
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/60 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-pink-500/20 text-pink-300 rounded-xl border border-pink-500/30">
              <Shirt className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-50">
                {itemToEdit ? 'Edit Clothing Item' : 'Add Clothing / Dress Item'}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Specify sizes (S/M/L/XL/waist), colors, trial status, and assignee
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Dress / Item Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Clothing Item Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Formal Cotton Shirt, Stretch Denim Jeans, Anarkali Kurti..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold focus:outline-none"
              autoFocus
            />
          </div>

          {/* Section & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Section / Department
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none"
              >
                {SECTIONS.map((sec) => (
                  <option key={sec} value={sec} className="bg-slate-900 text-slate-100">{sec}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Category / Type
              </label>
              <input
                type="text"
                placeholder="e.g. Shirts, Jeans, Kurtis"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Size & Color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Size</span>
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl text-sm font-bold focus:outline-none"
              >
                {STANDARD_SIZES.map((s) => (
                  <option key={s} value={s} className="bg-slate-900 text-slate-100">{s}</option>
                ))}
                <option value="custom" className="bg-slate-900 text-slate-100">Other / Custom...</option>
              </select>
              {size === 'custom' && (
                <input
                  type="text"
                  placeholder="Type custom size (e.g. 34W/32L)"
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  className="glass-input w-full px-3 py-1.5 mt-1.5 rounded-xl text-xs font-bold"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-slate-400" />
                <span>Color</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Navy Blue, Maroon"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Qty & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Qty
              </label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl text-sm font-bold text-center focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Brand (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Allen Solly"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Assignee & Price Estimate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Assignee</span>
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none"
              >
                <option value="Unassigned" className="bg-slate-900 text-slate-100">-- Unassigned --</option>
                {teamMembers.map((m) => (
                  <option key={m} value={m} className="bg-slate-900 text-slate-100">👤 {m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                <span>Price Estimate</span>
              </label>
              <input
                type="text"
                placeholder="e.g. ₹999 or Under ₹1500"
                value={priceEstimate}
                onChange={(e) => setPriceEstimate(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Trial Status */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Trial Room / Purchase Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
              {[
                { id: 'pending_trial', label: '⏳ Trial Room' },
                { id: 'fitting_checked', label: '👍 Fitting OK' },
                { id: 'in_cart', label: '🛒 In Cart' },
                { id: 'purchased', label: '✅ Purchased' }
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setTrialStatus(st.id)}
                  className={`p-2 rounded-xl border text-center transition ${
                    trialStatus === st.id
                      ? 'bg-pink-600 text-white border-pink-400 shadow-md glow-pink'
                      : 'glass-input text-slate-300 hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Notes / Sizing Details</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Check shoulder fit, prefer dark shade..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-linear-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 rounded-xl shadow-lg glow-pink transition"
            >
              <Check className="w-4 h-4" />
              <span>{itemToEdit ? 'Save Changes' : 'Add Clothing Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
