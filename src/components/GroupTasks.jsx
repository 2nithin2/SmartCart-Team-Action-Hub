import React, { useState, useMemo, useCallback } from 'react';
import { 
  Users, Plus, CheckCircle, Clock, AlertTriangle, ArrowRight, 
  Trash2, Edit3, UserCheck, Calendar, Filter, Sparkles, Tag,
  ChevronRight, MessageSquare, Check, X, UserPlus, UserMinus,
  Edit2, User
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

// Avatar generator with distinct initials and color hashing
const getAvatarColor = (name) => {
  const colors = [
    'bg-indigo-600 text-white border-indigo-400/40',
    'bg-pink-600 text-white border-pink-400/40',
    'bg-emerald-600 text-white border-emerald-400/40',
    'bg-purple-600 text-white border-purple-400/40',
    'bg-amber-600 text-white border-amber-400/40',
    'bg-cyan-600 text-white border-cyan-400/40'
  ];
  if (!name || name === 'Unassigned') return 'bg-slate-700 text-slate-300 border-slate-600/40';
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

// ⚡ Memoized Task Card for Smooth 120 FPS Rendering
const TaskCard = React.memo(function TaskCard({
  task,
  onUpdateStatus,
  onUpdateAssignee,
  onEdit,
  onDelete,
  teamMembers
}) {
  const isDone = task.status === 'completed';
  const priorityStyle = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const statusStyle = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  const assignedName = task.assignedTo || 'Unassigned';

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

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
            {/* Quick Assignee Switcher directly on the Task Card */}
            <div className="flex items-center gap-1.5 font-bold text-indigo-300 bg-indigo-950/70 px-2.5 py-1 rounded-xl border border-indigo-500/30">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${getAvatarColor(assignedName)}`}>
                {assignedName ? assignedName.charAt(0).toUpperCase() : '?'}
              </span>
              <span className="text-slate-400 text-xs font-normal">For:</span>
              <select
                value={assignedName}
                onChange={(e) => onUpdateAssignee(task, e.target.value)}
                className="bg-transparent text-indigo-200 text-xs font-bold focus:outline-none cursor-pointer"
                title="Change Assignee"
              >
                <option value="Unassigned" className="bg-slate-900 text-slate-400">👤 Unassigned</option>
                {teamMembers.map((m) => (
                  <option key={m} value={m} className="bg-slate-900 text-slate-100">
                    👤 {m}
                  </option>
                ))}
              </select>
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
  teamMembers = [],
  onAddMember,
  onEditMember,
  onRemoveMember
}) {
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // Banner quick add
  const [newMemberName, setNewMemberName] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Manage Team Modal state
  const [isManageTeamOpen, setIsManageTeamOpen] = useState(false);
  const [modalNewMember, setModalNewMember] = useState('');
  const [editingMember, setEditingMember] = useState(null); // oldName
  const [editingMemberName, setEditingMemberName] = useState(''); // text input

  // Task form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('pending');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('Shopping Follow-up');
  const [notes, setNotes] = useState('');

  // Quick add user inside task modal
  const [isAddingMemberInModal, setIsAddingMemberInModal] = useState(false);
  const [newMemberInModal, setNewMemberInModal] = useState('');

  // Open task modal
  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title || '');
      setAssignedTo(task.assignedTo || 'Unassigned');
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
    setIsAddingMemberInModal(false);
    setNewMemberInModal('');
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

  const handleUpdateAssignee = useCallback((task, newAssignee) => {
    onUpdateTask({
      ...task,
      assignedTo: newAssignee,
      updatedAt: new Date().toISOString()
    });
  }, [onUpdateTask]);

  const handleDelete = useCallback((id, taskTitle) => {
    if (window.confirm(`Delete task "${taskTitle}"?`)) {
      onDeleteTask(id);
    }
  }, [onDeleteTask]);

  // Member Operations
  const handleAddNewMember = (e) => {
    e.preventDefault();
    const trimmed = newMemberName.trim();
    if (!trimmed) return;
    onAddMember(trimmed);
    setNewMemberName('');
    setIsAddingMember(false);
  };

  const handleAddMemberFromModal = (e) => {
    e.preventDefault();
    const trimmed = modalNewMember.trim();
    if (!trimmed) return;
    onAddMember(trimmed);
    setModalNewMember('');
  };

  const handleQuickAddInTaskModal = () => {
    const trimmed = newMemberInModal.trim();
    if (!trimmed) return;
    onAddMember(trimmed);
    setAssignedTo(trimmed);
    setNewMemberInModal('');
    setIsAddingMemberInModal(false);
  };

  const handleStartEditMember = (member) => {
    setEditingMember(member);
    setEditingMemberName(member);
  };

  const handleSaveEditMember = (oldName) => {
    const trimmed = editingMemberName.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingMember(null);
      return;
    }
    if (onEditMember) {
      onEditMember(oldName, trimmed);
    }
    if (selectedAssignee === oldName) {
      setSelectedAssignee(trimmed);
    }
    setEditingMember(null);
  };

  const handleRemoveMemberPrompt = (member) => {
    const assignedTasksCount = tasks.filter((t) => t.assignedTo === member).length;
    const confirmMsg = assignedTasksCount > 0
      ? `Remove "${member}" from team? ${assignedTasksCount} task(s) currently assigned to ${member} will be changed to "Unassigned".`
      : `Remove "${member}" from team?`;

    if (window.confirm(confirmMsg)) {
      if (onRemoveMember) {
        onRemoveMember(member);
      }
      if (selectedAssignee === member) {
        setSelectedAssignee('all');
      }
      if (editingMember === member) {
        setEditingMember(null);
      }
    }
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
                Delegate shopping follow-ups, price checks &amp; billing tasks to team members by name
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
            {/* Manage Users & Collaborators Button */}
            <button
              onClick={() => setIsManageTeamOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 rounded-xl shadow-xs transition"
              title="Add, edit, or remove team members"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Manage Users ({teamMembers.length})</span>
            </button>

            {/* Quick Add Member Toggle */}
            <button
              onClick={() => setIsAddingMember(!isAddingMember)}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl shadow-xs transition"
            >
              <UserPlus className="w-3.5 h-3.5 text-slate-300" />
              <span>+ Add User</span>
            </button>

            {/* Assign New Task Button */}
            <button
              onClick={() => openModal()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-lg glow-indigo transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Assign New Task</span>
            </button>
          </div>
        </div>

        {/* Add Member inline banner form */}
        {isAddingMember && (
          <form onSubmit={handleAddNewMember} className="mt-3.5 p-3.5 bg-slate-900/70 rounded-2xl border border-indigo-500/30 flex items-center gap-2.5 animate-fadeIn">
            <span className="text-xs font-extrabold text-indigo-300 flex items-center gap-1">
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Collaborator:</span>
            </span>
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
              Add User
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

        {/* Team Member Filter Chips with Quick Edit & Remove */}
        <div className="mt-4 pt-3.5 border-t border-white/10">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Filter Tasks by Assignee:
            </span>
            <button
              onClick={() => setIsManageTeamOpen(true)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition"
            >
              <span>Edit / Remove Users</span>
              <ChevronRight className="w-3 h-3" />
            </button>
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
              const isSelected = selectedAssignee === member;

              return (
                <div
                  key={member}
                  className={`group inline-flex items-center rounded-xl text-xs font-bold transition shadow-xs border ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md glow-indigo border-indigo-400/50'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border-white/10'
                  }`}
                >
                  <button
                    onClick={() => setSelectedAssignee(member)}
                    className="px-3 py-1.5 flex items-center gap-1.5"
                    title={`Filter tasks for ${member}`}
                  >
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold ${getAvatarColor(member)}`}>
                      {member.charAt(0).toUpperCase()}
                    </span>
                    <span>{member}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isSelected ? 'bg-indigo-800 text-white' : 'bg-white/10 text-slate-400'
                    }`}>
                      {pendingCount} open
                    </span>
                  </button>

                  {/* Inline quick edit & remove icons on member chip */}
                  <div className="flex items-center pr-1.5 pl-0.5 opacity-60 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsManageTeamOpen(true);
                        handleStartEditMember(member);
                      }}
                      className="p-1 hover:text-amber-300 rounded transition"
                      title={`Edit/Rename ${member}`}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMemberPrompt(member);
                      }}
                      className="p-1 hover:text-rose-400 rounded transition"
                      title={`Remove ${member}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
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
              onUpdateAssignee={handleUpdateAssignee}
              onEdit={openModal}
              onDelete={handleDelete}
              teamMembers={teamMembers}
            />
          ))}
        </div>
      )}

      {/* 👥 Dedicated Manage Team & Users Modal */}
      {isManageTeamOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-white/15">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
                  <Users className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-50">
                    Manage Team &amp; Assignees
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Add, edit (rename), or remove team members
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsManageTeamOpen(false);
                  setEditingMember(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Add New User Form */}
              <form onSubmit={handleAddMemberFromModal} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter new user name..."
                  value={modalNewMember}
                  onChange={(e) => setModalNewMember(e.target.value)}
                  className="glass-input px-3.5 py-2.5 rounded-xl text-sm font-semibold flex-1 focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-md glow-indigo shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add User</span>
                </button>
              </form>

              {/* Members List */}
              <div className="space-y-2 mt-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Current Collaborators ({teamMembers.length})
                </div>

                {teamMembers.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs italic bg-white/5 rounded-xl border border-white/5">
                    No team members added yet. Add someone above!
                  </div>
                ) : (
                  teamMembers.map((member) => {
                    const isEditing = editingMember === member;
                    const assignedTasks = tasks.filter((t) => t.assignedTo === member);
                    const openTasksCount = assignedTasks.filter((t) => t.status !== 'completed').length;

                    return (
                      <div
                        key={member}
                        className="flex items-center justify-between gap-3 p-3 bg-slate-900/60 rounded-xl border border-white/10 hover:border-indigo-500/30 transition"
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${getAvatarColor(member)}`}>
                              {member.charAt(0).toUpperCase()}
                            </span>
                            <input
                              type="text"
                              value={editingMemberName}
                              onChange={(e) => setEditingMemberName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEditMember(member);
                                if (e.key === 'Escape') setEditingMember(null);
                              }}
                              className="glass-input px-3 py-1.5 rounded-lg text-sm font-bold flex-1 focus:outline-none border-indigo-400"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEditMember(member)}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                              title="Save name"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingMember(null)}
                              className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${getAvatarColor(member)}`}>
                                {member.charAt(0).toUpperCase()}
                              </span>
                              <div className="min-w-0">
                                <div className="text-sm font-extrabold text-slate-100 truncate">
                                  {member}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  {openTasksCount} active task(s) assigned
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEditMember(member)}
                                className="p-2 text-slate-300 hover:text-amber-300 hover:bg-amber-950/40 rounded-lg transition border border-transparent hover:border-amber-500/30"
                                title={`Edit name for ${member}`}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveMemberPrompt(member)}
                                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition border border-transparent hover:border-rose-500/30"
                                title={`Remove ${member}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-slate-900/70 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsManageTeamOpen(false);
                  setEditingMember(null);
                }}
                className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-md glow-indigo"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Create / Edit Modal */}
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

              {/* Assign To User field with inline quick-add */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Assign to Name *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddingMemberInModal(!isAddingMemberInModal)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{isAddingMemberInModal ? 'Cancel' : '+ Add New User'}</span>
                  </button>
                </div>

                {/* Inline Quick Add User within Task Modal */}
                {isAddingMemberInModal && (
                  <div className="flex items-center gap-2 mb-2.5 p-2 bg-indigo-950/60 rounded-xl border border-indigo-500/40 animate-fadeIn">
                    <input
                      type="text"
                      placeholder="Enter new user name..."
                      value={newMemberInModal}
                      onChange={(e) => setNewMemberInModal(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleQuickAddInTaskModal();
                        }
                      }}
                      className="glass-input text-xs px-2.5 py-1.5 rounded-lg flex-1 focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleQuickAddInTaskModal}
                      className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition shadow-xs flex items-center gap-1 shrink-0"
                    >
                      <Check className="w-3 h-3" />
                      <span>Add &amp; Select</span>
                    </button>
                  </div>
                )}

                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm font-bold focus:outline-none cursor-pointer"
                  required
                >
                  <option value="" className="bg-slate-900 text-slate-400">-- Choose Member Name --</option>
                  <option value="Unassigned" className="bg-slate-900 text-slate-400">👤 Unassigned</option>
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
