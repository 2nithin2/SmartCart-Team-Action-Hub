import React, { useState, useEffect } from 'react';
import { X, Check, ShoppingBag, Layers, User, Hash, Tag, FileText } from 'lucide-react';

const UNIT_OPTIONS = [
  'pcs',
  'kg',
  'gm',
  'packet',
  'packets',
  'bottle',
  'bottles',
  'box',
  'bundle',
  'litres',
  'bag',
  'dozen'
];

export default function ItemModal({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
  existingFloors = ['1st Floor', '2nd Floor'],
  teamMembers = []
}) {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [size, setSize] = useState('');
  const [floor, setFloor] = useState('1st Floor');
  const [newFloorInput, setNewFloorInput] = useState('');
  const [isAddingNewFloor, setIsAddingNewFloor] = useState(false);
  const [category, setCategory] = useState('Groceries');
  const [assignedTo, setAssignedTo] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name || '');
      setQty(itemToEdit.qty?.toString() || '1');
      setUnit(itemToEdit.unit || 'pcs');
      setSize(itemToEdit.size || '');
      setFloor(itemToEdit.floor || '1st Floor');
      setCategory(itemToEdit.category || 'Groceries');
      setAssignedTo(itemToEdit.assignedTo || '');
      setNotes(itemToEdit.notes || '');
      setStatus(itemToEdit.status || 'pending');
    } else {
      setName('');
      setQty('1');
      setUnit('pcs');
      setSize('');
      setFloor(existingFloors[0] || '1st Floor');
      setCategory('Groceries');
      setAssignedTo('');
      setNotes('');
      setStatus('pending');
    }
    setIsAddingNewFloor(false);
    setNewFloorInput('');
  }, [itemToEdit, isOpen, existingFloors]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalFloor = isAddingNewFloor && newFloorInput.trim()
      ? newFloorInput.trim()
      : floor;

    const itemData = {
      id: itemToEdit?.id || `dm-${Date.now()}`,
      name: name.trim(),
      qty: qty.trim() || '1',
      unit: unit.trim() || 'pcs',
      size: size.trim(),
      floor: finalFloor,
      category: category.trim(),
      assignedTo: assignedTo.trim(),
      notes: notes.trim(),
      status: status || 'pending',
      updatedAt: new Date().toISOString()
    };

    onSave(itemData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {itemToEdit ? 'Edit DMart Item' : 'Add New Item to DMart List'}
              </h2>
              <p className="text-xs text-slate-500">
                Enter item name, quantity, pieces/unit, and size details
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
          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Item Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sona Masoori Rice, Red Label Tea, Vim Liquid..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              autoFocus
            />
          </div>

          {/* Qty, Unit (Pcs), Size Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>Quantity (Qty)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 1, 2, 25, 50"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Unit / Pcs</span>
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
              >
                {UNIT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Size / Specs
              </label>
              <input
                type="text"
                placeholder="e.g. 25 kg, 500ml, 1L, Big"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Floor / Section Selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Floor / Department</span>
              </label>
              <button
                type="button"
                onClick={() => setIsAddingNewFloor(!isAddingNewFloor)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                {isAddingNewFloor ? 'Select Existing' : '+ Add New Floor'}
              </button>
            </div>

            {isAddingNewFloor ? (
              <input
                type="text"
                placeholder="e.g. 3rd Floor - Clothing / Electronics"
                value={newFloorInput}
                onChange={(e) => setNewFloorInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            ) : (
              <select
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
              >
                {existingFloors.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Assigned To Person */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Assign To Team Member / Person</span>
            </label>
            <div className="flex gap-2">
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
              >
                <option value="">-- Unassigned (Anyone can pick) --</option>
                {teamMembers.map((member) => (
                  <option key={member} value={member}>
                    👤 {member}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes / Brand Preference */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Notes / Special Instructions</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Prefer Nandini ghee, check expiry date, buy 1 get 1 offer..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
            />
          </div>

          {/* Status (Pending vs Completed) */}
          {itemToEdit && (
            <div className="flex items-center gap-3 pt-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Status:
              </label>
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="pending"
                    checked={status === 'pending'}
                    onChange={() => setStatus('pending')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Pending</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="completed"
                    checked={status === 'completed'}
                    onChange={() => setStatus('completed')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-emerald-700 font-medium">Purchased (Struck off)</span>
                </label>
              </div>
            </div>
          )}

          {/* Modal Actions */}
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
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition"
            >
              <Check className="w-4 h-4" />
              <span>{itemToEdit ? 'Save Changes' : 'Add Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
