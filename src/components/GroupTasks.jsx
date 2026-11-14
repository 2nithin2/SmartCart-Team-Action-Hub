import React, { useState, useMemo } from 'react';
import { 
  Users, Plus, CheckCircle, Clock, AlertTriangle, ArrowRight, 
  Trash2, Edit3, UserCheck, Calendar, Filter, Sparkles, Tag,
  ChevronRight, MessageSquare, Check, X
} from 'lucide-react';

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', bg: 'bg-red-100/90 text-red-900 border-red-300/70 shadow-xs' },
  high: { label: 'High', bg: 'bg-amber-100/90 text-amber-900 border-amber-300/70 shadow-xs' },
  medium: { label: 'Medium', bg: 'bg-blue-100/90 text-blue-900 border-blue-300/70 shadow-xs' },
  low: { label: 'Low', bg: 'bg-slate-100/90 text-slate-700 border-slate-300/70 shadow-xs' }
};

const STATUS_CONFIG = {
  pending: { label: 'To Do', bg: 'bg-slate-100/90 text-slate-800' },
  in_progress: { label: 'In Progress', bg: 'bg-blue-100/90 text-blue-900' },
  follow_up: { label: 'Follow Up', bg: 'bg-amber-100/90 text-amber-900' },
  completed: { label: 'Completed', bg: 'bg-emerald-100/90 text-emerald-900' }
};

export default function GroupTasks({
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
    <div className="space-y-5 pb-16">
      {/* Header Banner with Glassmorphism */}
      <div className="glass-card rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-indigo-100/90 text-indigo-700 rounded-xl shadow-xs">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
                Group Action &amp; Task Delegator
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Delegate shopping follow-ups, price verifications &amp; trial checks to people by name
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => setIsAddingMember(!isAddingMember)}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white/80 hover:bg-white border border-slate-200 rounded-xl shadow-xs transition"
            >
              + Add Member Name
            </button>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-md shadow-indigo-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Assign New Task</span>
            </button>
          </div>
        </div>

        {/* Add Member inline form */}
        {isAddingMember && (
          <form onSubmit={handleAddNewMember} className="mt-3.5 p-3.5 glass-panel rounded-2xl border border-indigo-200/80 flex items-center gap-2.5">
            <span className="text-xs font-extrabold text-indigo-950">Add Collaborator:</span>
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
              className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-xs"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAddingMember(false)}
              className="px-2.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Team Member Filter Chips */}
        <div className="mt-4 pt-3.5 border-t border-slate-200/60">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Filter by Assignee:
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedAssignee('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                selectedAssignee === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200'
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
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-indigo-50/80 text-indigo-900 hover:bg-indigo-100 border border-indigo-200/60'
                  }`}
                >
                  <span>👤 {member}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    selectedAssignee === member ? 'bg-indigo-700 text-white' : 'bg-indigo-200/80 text-indigo-950'
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
          className={`glass-card glass-card-hover p-4 rounded-2xl text-left transition ${
            statusFilter === 'pending'
              ? 'ring-2 ring-slate-900 bg-slate-900 text-white !bg-slate-900'
              : 'text-slate-800'
          }`}
        >
          <div className="text-xs font-bold opacity-75 uppercase tracking-wider">To Do / Pending</div>
          <div className="text-2xl font-black mt-1">{taskStats.pending}</div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'in_progress' ? 'all' : 'in_progress')}
          className={`glass-card glass-card-hover p-4 rounded-2xl text-left transition ${
            statusFilter === 'in_progress'
              ? 'ring-2 ring-blue-600 text-blue-900 !bg-blue-50/90 glow-indigo'
              : 'text-slate-800'
          }`}
        >
          <div className="text-xs font-bold opacity-75 uppercase tracking-wider">In Progress</div>
          <div className="text-2xl font-black mt-1 text-blue-600">
            {taskStats.inProgress}
          </div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'follow_up' ? 'all' : 'follow_up')}
          className={`glass-card glass-card-hover p-4 rounded-2xl text-left transition ${
            statusFilter === 'follow_up'
              ? 'ring-2 ring-amber-500 text-amber-900 !bg-amber-50/90'
              : 'text-slate-800'
          }`}
        >
          <div className="text-xs font-bold opacity-75 uppercase tracking-wider">Follow Up</div>
          <div className="text-2xl font-black mt-1 text-amber-600">
            {taskStats.followUp}
          </div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
          className={`glass-card glass-card-hover p-4 rounded-2xl text-left transition ${
            statusFilter === 'completed'
              ? 'ring-2 ring-emerald-600 text-emerald-900 !bg-emerald-50/90 glow-emerald'
              : 'text-slate-800'
          }`}
        >
          <div className="text-xs font-bold opacity-75 uppercase tracking-wider">Completed</div>
          <div className="text-2xl font-black mt-1 text-emerald-600">
            {taskStats.completed}
          </div>
        </button>
      </div>

      {/* Task List Items with Frosted Glass styling */}
      {filteredTasks.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No tasks found</h3>
          <p className="text-xs text-slate-500 mt-1">
            There are no tasks matching the selected member or status filters.
          </p>
          <button
            onClick={() => openModal()}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
          >
            + Assign New Task
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredTasks.map((task) => {
            const isDone = task.status === 'completed';
            const priorityStyle = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
            const statusStyle = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;

            return (
              <div
                key={task.id}
                className={`glass-card glass-card-hover rounded-2xl p-4 sm:p-5 transition ${
                  isDone
                    ? 'opacity-65'
                    : 'border-white/80'
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
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/80 text-slate-600 border border-slate-200">
                          {task.category}
                        </span>
                      )}
                    </div>

                    <h3 className={`text-base font-extrabold ${
                      isDone ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}>
                      {task.title}
                    </h3>

                    {task.notes && (
                      <p className="text-xs text-slate-600 bg-white/70 p-2.5 rounded-xl border border-white/80 whitespace-pre-wrap font-normal">
                        💬 {task.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-800 bg-indigo-50/80 px-2.5 py-1 rounded-xl border border-indigo-200/60 shadow-2xs">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Assigned to: {task.assignedTo || 'Unassigned'}</span>
                      </div>

                      {task.dueDate && (
                        <div className="flex items-center gap-1 font-semibold text-slate-600">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Due: {task.dueDate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100 shrink-0">
                    <select
                      value={task.status}
                      onChange={(e) => {
                        onUpdateTask({
                          ...task,
                          status: e.target.value,
                          updatedAt: new Date().toISOString()
                        });
                      }}
                      className="glass-input text-xs font-bold px-3 py-1.5 rounded-xl bg-white/95 focus:outline-none"
                    >
                      <option value="pending">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="follow_up">Follow Up</option>
                      <option value="completed">Completed ✅</option>
                    </select>

                    <button
                      onClick={() => openModal(task)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition"
                      title="Edit Task"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete task "${task.title}"?`)) {
                          onDeleteTask(task.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Task"
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

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel bg-white/95 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/80">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/70 rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 text-indigo-800 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800">
                    {editingTask ? 'Edit Task Delegation' : 'Assign New Group Task'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Assign follow-up responsibility to a person by name
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assign to Name *
                </label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm font-bold focus:outline-none bg-white"
                  required
                >
                  <option value="">-- Choose Member Name --</option>
                  {teamMembers.map((m) => (
                    <option key={m} value={m}>
                      👤 {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none bg-white"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-sm font-semibold focus:outline-none bg-white"
                  >
                    <option value="pending">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
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
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
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

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-md shadow-indigo-600/20 transition"
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
