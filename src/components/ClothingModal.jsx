import React, { useState, useEffect } from 'react';
import { X, Check, Shirt, User, Tag, Palette, DollarSign, FileText } from 'lucide-react';
import { haptics } from '../utils/haptics';

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

    haptics.success();
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
      <div className="dark-glass-card bg-slate-900/95 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-pink-500/40 text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-pink-500/20 bg-slate-950/60 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-pink-500/20 text-pink-300 rounded-xl border border-pink-500/40">
              <Shirt className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">
                {itemToEdit ? 'Edit Clothing Item' : 'Add Clothing / Dress Item'}
              </h2>
              <p className="text-xs text-pink-200/70 font-medium">
                Specify sizes (S/M/L/XL/waist), colors, trial status, and assignee
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              haptics.tick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Item Name */}
          <div>
            <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-1">
              Clothing Item Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Linen Slim Fit Shirt, Embroidered Kurti, Cotton T-Shirt..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="dark-glass-input w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold focus:outline-none"
              autoFocus
            />
          </div>

          {/* Section & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-1">
                Section *
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="dark-glass-input w-full px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none"
              >
                {SECTIONS.map((s) => (
                  <option key={s} value={s} className="bg-slate-900 text-white">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <input
                type="text"
                placeholder="e.g. Shirts, Jeans, Sarees..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="dark-glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Size & Color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-pink-400" />
                <span>Size</span>
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="dark-glass-input w-full px-3 py-2 rounded-xl text-sm font-bold focus:outline-none"
              >
                {STANDARD_SIZES.map((s) => (
                  <option key={s} value={s} className="bg-slate-900 text-white">
                    {s}
                  </option>
                ))}
                <option value="custom" className="bg-slate-900 text-white">Other / Custom Size...</option>
              </select>
              {size === 'custom' && (
                <input
                  type="text"
                  placeholder="Type custom size (e.g. 34W/32L)"
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  className="dark-glass-input w-full px-3 py-1.5 mt-1.5 rounded-xl text-xs font-bold"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-pink-400" />
                <span>Color / Pattern</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Navy Blue, Maroon..."
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="dark-glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Qty, Unit, Brand */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-1">
                Qty
              </label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="dark-glass-input w-full px-3 py-2 rounded-xl text-sm font-bold focus:outline-none text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="dark-glass-input w-full px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none"
              >
                <option value="pcs" className="bg-slate-900 text-white">pcs</option>
                <option value="pair" className="bg-slate-900 text-white">pair</option>
                <option value="set" className="bg-slate-900 text-white">set</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-1">
                Brand (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Allen Solly"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="dark-glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Assignee & Price Estimate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-pink-400" />
                <span>For Person</span>
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="dark-glass-input w-full px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none"
              >
                <option value="Unassigned" className="bg-slate-900 text-white">-- Unassigned --</option>
                {teamMembers.map((m) => (
                  <option key={m} value={m} className="bg-slate-900 text-white">
                    👤 {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-pink-400" />
                <span>Estimated Price</span>
              </label>
              <input
                type="text"
                placeholder="e.g. ₹999 or Under ₹1500"
                value={priceEstimate}
                onChange={(e) => setPriceEstimate(e.target.value)}
                className="dark-glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Trial Status */}
          <div>
            <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-1.5">
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
                  onClick={() => {
                    haptics.selection();
                    setTrialStatus(st.id);
                  }}
                  className={`p-2 rounded-xl border text-center transition ${
                    trialStatus === st.id
                      ? 'bg-pink-600 text-white border-pink-400 shadow-md shadow-pink-900/40'
                      : 'dark-glass-input text-pink-200 hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-pink-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-pink-400" />
              <span>Notes / Sizing Details</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Check shoulder fit, prefer dark shade, try size 32 if 30 feels tight..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="dark-glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-pink-500/20">
            <button
              type="button"
              onClick={() => {
                haptics.tick();
                onClose();
              }}
              className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-linear-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 rounded-xl shadow-lg shadow-pink-900/40 transition hover-wiggle"
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
