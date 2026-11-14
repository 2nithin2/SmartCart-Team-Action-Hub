import React, { useState, useEffect } from 'react';
import { X, Check, ShoppingBag, Layers, User, Hash, Tag, FileText } from 'lucide-react';

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
  const [unit, setUnit] = useState('kg');
  const [sizeSpec, setSizeSpec] = useState('');
  const [floor, setFloor] = useState('1st Floor');
  const [newFloorInput, setNewFloorInput] = useState('');
  const [isAddingNewFloor, setIsAddingNewFloor] = useState(false);
  const [category, setCategory] = useState('Groceries');
  const [assignee, setAssignee] = useState('Unassigned');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name || '');
      setQty(itemToEdit.quantity?.toString() || itemToEdit.qty?.toString() || '1');
      setUnit(itemToEdit.unit || 'kg');
      setSizeSpec(itemToEdit.sizeSpec || itemToEdit.size || '');
      setFloor(itemToEdit.floor || '1st Floor');
      setCategory(itemToEdit.category || 'Groceries');
      setAssignee(itemToEdit.assignee || itemToEdit.assignedTo || 'Unassigned');
      setNote(itemToEdit.note || itemToEdit.notes || '');
      setStatus(itemToEdit.status || 'pending');
    } else {
      setName('');
      setQty('1');
      setUnit('kg');
      setSizeSpec('');
      setFloor(existingFloors[0] || '1st Floor');
      setCategory('Groceries');
      setAssignee('Unassigned');
      setNote('');
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

    const finalQty = parseFloat(qty) || 1;
    const finalId = itemToEdit?.itemId || itemToEdit?.id || `item_${Date.now()}`;

    const itemData = {
      itemId: finalId,
      id: finalId,
      name: name.trim(),
      quantity: finalQty,
      qty: finalQty,
      unit: unit.trim() || 'pcs',
      sizeSpec: sizeSpec.trim(),
      size: sizeSpec.trim(),
      floor: finalFloor,
      category: category.trim() || 'Groceries',
      assignee: assignee.trim() || 'Unassigned',
      assignedTo: assignee.trim() || 'Unassigned',
      note: note.trim(),
      notes: note.trim(),
      status: status || 'pending',
      updatedAt: new Date().toISOString()
    };

    onSave(itemData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/15">
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/60 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-50">
                {itemToEdit ? 'Edit Grocery Item' : 'Add Item to SmartCart'}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Enter quantity, unit, size specifications, and physical zone
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
          {/* Item Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Item Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sona Masoori Rice, Red Label Tea, Vim Liquid..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold focus:outline-none"
              autoFocus
            />
          </div>

          {/* Qty, Unit, SizeSpec Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>Quantity</span>
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                placeholder="25"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl text-sm font-bold focus:outline-none text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Unit</span>
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none"
              >
                {UNIT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-slate-900 text-slate-100">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Size / Specs
              </label>
              <input
                type="text"
                placeholder="e.g. 25 kgs bag, 1L"
                value={sizeSpec}
                onChange={(e) => setSizeSpec(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Floor / Department Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Floor / Physical Zone</span>
              </label>
              <button
                type="button"
                onClick={() => setIsAddingNewFloor(!isAddingNewFloor)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
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
                className="glass-input w-full px-3 py-2 rounded-xl border-indigo-500/50 text-sm font-medium focus:outline-none"
              />
            ) : (
              <select
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none"
              >
                {existingFloors.map((f) => (
                  <option key={f} value={f} className="bg-slate-900 text-slate-100">
                    {f}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Assignee Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Assignee (Delegated Person)</span>
            </label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="glass-input w-full px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none"
            >
              <option value="Unassigned" className="bg-slate-900 text-slate-100">-- Unassigned (Anyone can pick) --</option>
              {teamMembers.map((member) => (
                <option key={member} value={member} className="bg-slate-900 text-slate-100">
                  👤 {member}
                </option>
              ))}
            </select>
          </div>

          {/* Notes / Special Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Notes / Special Instructions</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Prefer Nandini cow ghee, check best before date, carton deal..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none resize-none"
            />
          </div>

          {/* Status Selection */}
          {itemToEdit && (
            <div className="flex items-center gap-3 pt-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Status:
              </label>
              <div className="flex items-center gap-4 text-sm font-semibold">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="radio"
                    name="status"
                    value="pending"
                    checked={status === 'pending'}
                    onChange={() => setStatus('pending')}
                    className="text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Pending</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-emerald-400">
                  <input
                    type="radio"
                    name="status"
                    value="completed"
                    checked={status === 'completed'}
                    onChange={() => setStatus('completed')}
                    className="text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Purchased (Struck)</span>
                </label>
              </div>
            </div>
          )}

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
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg glow-emerald transition"
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
