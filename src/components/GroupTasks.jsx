import React, { useState, useMemo, useCallback } from 'react';
import { 
  Users, Plus, CheckCircle, Clock, AlertTriangle, ArrowRight, 
  Trash2, Edit3, UserCheck, Calendar, Filter, Sparkles, Tag,
  ChevronRight, MessageSquare, Check, X
} from 'lucide-react';

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', bg: 'bg-rose-950/70 text-rose-300 border-rose-500/40 shadow-xs' },
  high: { label: 'High', bg: 'bg-amber-950/70 text-amber-300 border-amber-500/40 shadow-xs' },
  medium: { label: 'Medium', bg: 'bg-indigo-950/70 text-indigo-300 border-indigo-500/40 shadow-xs' },
  low: { label: 'Low', bg: 'bg-slate-800 text-slate-300 border-slate-700/60 shadow-xs' }
};

const STATUS_CONFIG = {
  pending: { label: 'To Do', bg: 'bg-slate-800 text-slate-300 border border-slate-700/60' },
  in_progress: { label: 'In Progress', bg: 'bg-blue-950/80 text-blue-300 border border-blue-500/40' },
  follow_up: { label: 'Follow Up', bg: 'bg-amber-950/80 text-amber-300 border border-amber-500/40' },
  completed: { label: 'Completed ✅', bg: 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' }
};

// ⚡ Memoized Task Card for Smooth 120 FPS Rendering
const TaskCard = React.memo(function TaskCard({
  task,
  onUpdateStatus,
  onEdit,
  onDelete
}) {
  const isDone = task.status === 'completed';
  const priorityStyle = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const statusStyle = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;

  return (
    <div
      className={`virtual-item-row glass-card rounded-2xl p-4 sm:p-5 transition-colors ${
        isDone
          ? 'opacity-60 bg-slate-950/40'
          : 'border-white/10'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border ${priorityStyle.bg}`}>
              {priorityStyle.label}
            </span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg ${statusStyle.bg}`}>
              {statusStyle.label}
            </span>
            {task.category && (
              <span className="spec-tag text-[11px]">
                {task.category}
              </span>
            )}
          </div>

          <h3 className={`item-title ${
            isDone ? 'line-through text-slate-500' : 'text-slate-50'
          }`}>
            {task.title}
          </h3>

          {task.notes && (
            <p className="text-xs text-slate-300 bg-black/20 p-2.5 rounded-xl border border-white/5 whitespace-pre-wrap font-normal">
              💬 {task.notes}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-1.5 font-bold text-indigo-300 bg-indigo-950/70 px-2.5 py-1 rounded-xl border border-indigo-500/30">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Assigned to: {task.assignedTo || 'Unassigned'}</span>
            </div>

            {task.dueDate && (
              <div className="flex items-center gap-1 font-semibold text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Due: {task.dueDate}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 pt-3 sm:pt-0 border-t sm:border-0 border-white/10 shrink-0">
          <select
            value={task.status}
            onChange={(e) => onUpdateStatus(task, e.target.value)}
            className="glass-input text-xs font-bold px-3 py-1.5 rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="pending" className="bg-slate-900 text-slate-100">To Do</option>
            <option value="in_progress" className="bg-slate-900 text-blue-300">In Progress</option>
            <option value="follow_up" className="bg-slate-900 text-amber-300">Follow Up</option>
            <option value="completed" className="bg-slate-900 text-emerald-300">Completed ✅</option>
          </select>

          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
            title="Edit Task"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(task.id, task.title)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
            title="Delete Task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

function GroupTasks({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  teamMembers,
  onAddMember,
  onRemoveMember
}) {
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [newMemberName, setNewMemberName] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  // New task form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('pending');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('Shopping Follow-up');
  const [notes, setNotes] = useState('');

  // Open modal for new or edit
  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title || '');
      setAssignedTo(task.assignedTo || '');
      setPriority(task.priority || 'medium');
      setStatus(task.status || 'pending');
      setDueDate(task.dueDate || '');
      setCategory(task.category || 'Shopping Follow-up');
      setNotes(task.notes || '');
    } else {
      setEditingTask(null);
      setTitle('');
      setAssignedTo(teamMembers[0] || 'Unassigned');
      setPriority('medium');
      setStatus('pending');
      setDueDate(new Date().toISOString().split('T')[0]);
      setCategory('Shopping Follow-up');
      setNotes('');
    }
    setIsModalOpen(true);
  };

  const handleSaveTask = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      id: editingTask?.id || `task-${Date.now()}`,
      title: title.trim(),
      assignedTo: assignedTo.trim() || 'Unassigned',
      priority,
      status,
      dueDate: dueDate || '',
      category: category.trim(),
      notes: notes.trim(),
      updatedAt: new Date().toISOString()
    };

    if (editingTask) {
      onUpdateTask(taskData);
    } else {
      onAddTask(taskData);
    }
    setIsModalOpen(false);
  };

  const handleUpdateStatus = useCallback((task, newStatus) => {
    onUpdateTask({
      ...task,
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
  }, [onUpdateTask]);

  const handleDelete = useCallback((id, taskTitle) => {
    if (window.confirm(`Delete task "${taskTitle}"?`)) {
      onDeleteTask(id);
    }
  }, [onDeleteTask]);

  // Add member
  const handleAddNewMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    onAddMember(newMemberName.trim());
    setNewMemberName('');
    setIsAddingMember(false);
  };

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (selectedAssignee !== 'all' && t.assignedTo !== selectedAssignee) {
        return false;
      }
      if (statusFilter !== 'all' && t.status !== statusFilter) {
        return false;
      }
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) {
        return false;
      }
      return true;
    });
  }, [tasks, selectedAssignee, statusFilter, priorityFilter]);

  // Stats
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const pending = tasks.filter((t) => t.status === 'pending').length;
    const followUp = tasks.filter((t) => t.status === 'follow_up').length;
    return { total, completed, inProgress, pending, followUp };
  }, [tasks]);

  return (
    <div className="space-y-4 pb-16 animate-fadeIn">
      {/* Header Banner with Glassmorphism */}
      <div className="glass-card rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30 shadow-xs">
              <Users className="w-5 h-5 text-indigo-400" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-slate-50 tracking-tight">
                Group Action &amp; Task Delegator
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Delegate shopping follow-ups, price verifications &amp; trial checks to people by name
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => setIsAddingMember(!isAddingMember)}
              className="px-3.5 py-2 text-xs font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl shadow-xs transition"
            >
              + Add Member Name
            </button>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-lg glow-indigo transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Assign New Task</span>
            </button>
          </div>
        </div>

        {/* Add Member inline form */}
        {isAddingMember && (
          <form onSubmit={handleAddNewMember} className="mt-3.5 p-3.5 bg-slate-900/60 rounded-2xl border border-indigo-500/30 flex items-center gap-2.5">
            <span className="text-xs font-extrabold text-indigo-300">Add Collaborator:</span>
            <input
              type="text"
              placeholder="e.g. Nithin, Ramesh, Divya..."
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="glass-input px-3.5 py-2 text-xs rounded-xl focus:outline-none flex-1 max-w-xs font-medium"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow-xs"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAddingMember(false)}
              className="px-2.5 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Team Member Filter Chips */}
        <div className="mt-4 pt-3.5 border-t border-white/10">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Filter by Assignee:
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedAssignee('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                selectedAssignee === 'all'
                  ? 'bg-indigo-600 text-white shadow-md glow-indigo border border-indigo-400/40'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              All Team ({tasks.length})
            </button>

            {teamMembers.map((member) => {
              const memberTasks = tasks.filter((t) => t.assignedTo === member);
              const pendingCount = memberTasks.filter((t) => t.status !== 'completed').length;
              return (
                <button
                  key={member}
                  onClick={() => setSelectedAssignee(member)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedAssignee === member
                      ? 'bg-indigo-600 text-white shadow-md glow-indigo border border-indigo-400/40'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <span>👤 {member}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    selectedAssignee === member ? 'bg-indigo-800 text-white' : 'bg-white/10 text-slate-400'
                  }`}>
                    {pendingCount} open
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Task Status Filters & Counts with Glass Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
          className={`glass-card p-4 rounded-2xl text-left transition ${
            statusFilter === 'pending'
              ? 'ring-2 ring-indigo-400 border-indigo-500/50 glow-indigo'
              : 'border-white/10'
          }`}
        >
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">To Do / Pending</div>
          <div className="text-2xl font-black mt-1 text-slate-100">{taskStats.pending}</div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'in_progress' ? 'all' : 'in_progress')}
          className={`glass-card p-4 rounded-2xl text-left transition ${
            statusFilter === 'in_progress'
              ? 'ring-2 ring-blue-400 border-blue-500/50 glow-indigo'
              : 'border-white/10'
          }`}
        >
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Progress</div>
          <div className="text-2xl font-black mt-1 text-blue-400">
            {taskStats.inProgress}
          </div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'follow_up' ? 'all' : 'follow_up')}
          className={`glass-card p-4 rounded-2xl text-left transition ${
            statusFilter === 'follow_up'
              ? 'ring-2 ring-amber-400 border-amber-500/50'
              : 'border-white/10'
          }`}
        >
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Follow Up</div>
          <div className="text-2xl font-black mt-1 text-amber-400">
            {taskStats.followUp}
          </div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
          className={`glass-card p-4 rounded-2xl text-left transition ${
            statusFilter === 'completed'
              ? 'ring-2 ring-emerald-400 border-emerald-500/50 glow-emerald'
              : 'border-white/10'
          }`}
        >
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</div>
          <div className="text-2xl font-black mt-1 text-emerald-400">
            {taskStats.completed}
          </div>
        </button>
      </div>

      {/* Task List Items with Frosted Glass styling */}
      {filteredTasks.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <CheckCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">No tasks found</h3>
          <p className="text-xs text-slate-400 mt-1">
            There are no tasks matching the selected member or status filters.
          </p>
          <button
            onClick={() => openModal()}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md glow-indigo"
          >
            + Assign New Task
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdateStatus={handleUpdateStatus}
              onEdit={openModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/15">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/60 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
                  <Users className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-50">
                    {editingTask ? 'Edit Task Delegation' : 'Assign New Group Task'}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Assign follow-up responsibility to a person by name
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Check Rice 25kg brand offers at Floor 1..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Assign to Name *
                </label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm font-bold focus:outline-none"
                  required
                >
                  <option value="" className="bg-slate-900 text-slate-100">-- Choose Member Name --</option>
                  {teamMembers.map((m) => (
                    <option key={m} value={m} className="bg-slate-900 text-slate-100">
                      👤 {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none"
                  >
                    <option value="urgent" className="bg-slate-900 text-rose-300">Urgent</option>
                    <option value="high" className="bg-slate-900 text-amber-300">High</option>
                    <option value="medium" className="bg-slate-900 text-indigo-300">Medium</option>
                    <option value="low" className="bg-slate-900 text-slate-300">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none"
                  >
                    <option value="pending" className="bg-slate-900 text-slate-100">To Do</option>
                    <option value="in_progress" className="bg-slate-900 text-blue-300">In Progress</option>
                    <option value="follow_up" className="bg-slate-900 text-amber-300">Follow Up</option>
                    <option value="completed" className="bg-slate-900 text-emerald-300">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Target Date / Follow-up
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Price Check, Billing"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Notes / Follow-up Details
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Check price tags, compare 2 packs vs 1 large pack, verify bill receipt..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-lg glow-indigo transition"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingTask ? 'Save Task' : 'Assign Task'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(GroupTasks);
