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
      setQty(itemToEdit.qty?.toString() || '1');
      setUnit(itemToEdit.unit || 'pcs');
      setBrand(itemToEdit.brand || '');
      setAssignedTo(itemToEdit.assignedTo || '');
      setTrialStatus(itemToEdit.trialStatus || 'pending_trial');
      setPriceEstimate(itemToEdit.priceEstimate || '');
      setNotes(itemToEdit.notes || '');
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
      setAssignedTo(teamMembers[0] || '');
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
      id: itemToEdit?.id || `cl-${Date.now()}`,
      name: name.trim(),
      section,
      category: category.trim() || 'General Apparel',
      size: finalSize,
      color: color.trim(),
      qty: qty.trim() || '1',
      unit: unit.trim() || 'pcs',
      brand: brand.trim(),
      assignedTo: assignedTo.trim(),
      trialStatus,
      status: trialStatus === 'purchased' ? 'completed' : 'pending',
      priceEstimate: priceEstimate.trim(),
      notes: notes.trim(),
      updatedAt: new Date().toISOString()
    };

    onSave(clothingData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-pink-100 text-pink-700 rounded-lg">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {itemToEdit ? 'Edit Clothing Item' : 'Add Clothing / Dress Item'}
              </h2>
              <p className="text-xs text-slate-500">
                Specify sizes (S/M/L/XL/waist), colors, trial status, and assignee
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Dress / Item Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Clothing Item Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Formal Cotton Shirt, Stretch Denim Jeans, Anarkali Kurti..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm font-medium"
              autoFocus
            />
          </div>

          {/* Section & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Section / Department
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm bg-white"
              >
                {SECTIONS.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category / Type
              </label>
              <input
                type="text"
                placeholder="e.g. Shirts, Jeans, Kurtis, Shoes"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
              />
            </div>
          </div>

          {/* Size & Color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Size *
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm bg-white font-medium"
              >
                {STANDARD_SIZES.map((sz) => (
                  <option key={sz} value={sz}>{sz}</option>
                ))}
                <option value="custom">-- Custom Size --</option>
              </select>
              {size === 'custom' && (
                <input
                  type="text"
                  placeholder="Type custom size (e.g. 38 Slim Fit, 32/34)"
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  className="mt-1.5 w-full px-3 py-1.5 text-xs rounded-lg border border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-slate-400" />
                <span>Color / Pattern</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Navy Blue, Maroon, Printed"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
              />
            </div>
          </div>

          {/* Qty (Pcs) & Brand */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Quantity (Pcs)
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="w-20 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="flex-1 px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                >
                  <option value="pcs">pcs</option>
                  <option value="pair">pair</option>
                  <option value="set">set</option>
                  <option value="bundle">bundle</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Brand / Store
              </label>
              <input
                type="text"
                placeholder="e.g. Allen Solly, Max, Zudio"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
              />
            </div>
          </div>

          {/* Person (Who this is for) & Trial Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>For Person *</span>
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm bg-white font-medium"
              >
                <option value="">-- Choose Person --</option>
                {teamMembers.map((m) => (
                  <option key={m} value={m}>👤 {m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Trial / Cart Status
              </label>
              <select
                value={trialStatus}
                onChange={(e) => setTrialStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm bg-white font-medium"
              >
                <option value="pending_trial">⏳ Needs Trial / Fitting</option>
                <option value="fitting_checked">👍 Fitting Checked &amp; OK</option>
                <option value="in_cart">🛒 In Cart (To Buy)</option>
                <option value="purchased">✅ Purchased</option>
              </select>
            </div>
          </div>

          {/* Price Estimate & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                <span>Price / Budget</span>
              </label>
              <input
                type="text"
                placeholder="e.g. ₹1,499"
                value={priceEstimate}
                onChange={(e) => setPriceEstimate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Notes</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Cotton fabric, round neck"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-pink-600 hover:bg-pink-700 rounded-lg shadow-xs transition"
            >
              <Check className="w-4 h-4" />
              <span>{itemToEdit ? 'Save Dress Details' : 'Add to Clothing Cart'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
