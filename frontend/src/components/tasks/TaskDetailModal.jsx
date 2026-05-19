import { useState } from 'react';
import { X, Calendar, Tag, Flag, CheckCircle2, Plus, Trash2, Sparkles } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService, aiService } from '../../services';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const PRIORITY_STYLES = {
  urgent: { bg: 'rgba(248,113,113,0.15)', color: 'var(--danger)', label: 'Urgent' },
  high: { bg: 'rgba(251,146,60,0.15)', color: 'var(--warning)', label: 'High' },
  medium: { bg: 'rgba(250,204,21,0.15)', color: 'var(--warning)', label: 'Medium' },
  low: { bg: 'rgba(74,222,128,0.15)', color: 'var(--success)', label: 'Low' },
};

const STATUS_OPTIONS = ['todo', 'in-progress', 'review', 'completed'];

export default function TaskDetailModal({ task, onClose }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [newSubtask, setNewSubtask] = useState('');
  const [aiSubtasks, setAiSubtasks] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (data) => taskService.update(task._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated');
    },
  });

  const subtaskMutation = useMutation({
    mutationFn: (title) => taskService.addSubtask(task._id, title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const toggleSubtask = useMutation({
    mutationFn: ({ subtaskId, completed }) =>
      taskService.updateSubtask(task._id, subtaskId, completed),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const handleSave = () => {
    updateMutation.mutate({ title, description, status, priority });
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    subtaskMutation.mutate(newSubtask.trim());
    setNewSubtask('');
  };

  const handleAIBreakdown = async () => {
    setAiLoading(true);
    try {
      const { data } = await aiService.breakdownTask(title, description);
      setAiSubtasks(data.data.subtasks);
    } catch {
      toast.error('AI breakdown failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptAISubtask = (sub) => {
    subtaskMutation.mutate(sub.title);
    setAiSubtasks(prev => prev.filter(s => s.title !== sub.title));
    toast.success(`Added: ${sub.title}`);
  };

  const inputStyle = {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    width: '100%',
    padding: '10px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-6 animate-scale-in"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Task Details</h2>
          <button onClick={onClose} style={{ color: 'var(--subtle)' }}><X size={20} /></button>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Status + Priority row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>
              <Flag size={11} className="inline mr-1" />Status
            </label>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                  style={{
                    background: status === s ? 'var(--accent-panel)' : 'var(--surface-2)',
                    color: status === s ? 'var(--accent)' : 'var(--subtle)',
                    border: status === s ? '1px solid var(--accent)' : '1px solid var(--border)',
                  }}
                >
                  {s.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>
              <Tag size={11} className="inline mr-1" />Priority
            </label>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(PRIORITY_STYLES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setPriority(key)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                  style={{
                    background: priority === key ? val.bg : 'var(--surface-2)',
                    color: priority === key ? val.color : 'var(--subtle)',
                    border: priority === key ? `1px solid ${val.color}` : '1px solid var(--border)',
                  }}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Subtasks */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
              <CheckCircle2 size={11} className="inline mr-1" />
              Subtasks ({task.subtasks?.length || 0})
            </label>
            <button
              onClick={handleAIBreakdown}
              disabled={aiLoading}
              className="flex items-center gap-1 text-xs px-3 py-1 rounded-lg font-medium transition-all"
              style={{ background: 'rgba(167,139,250,0.15)', color: 'var(--accent)' }}
            >
              <Sparkles size={12} />
              {aiLoading ? 'Thinking...' : 'AI Breakdown'}
            </button>
          </div>

          {/* Existing subtasks */}
          <div className="space-y-1.5 mb-3">
            {(task.subtasks || []).map(sub => (
              <div
                key={sub._id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: 'var(--surface-2)' }}
              >
                <button
                  onClick={() => toggleSubtask.mutate({ subtaskId: sub._id, completed: !sub.completed })}
                  className="flex-shrink-0"
                >
                  <CheckCircle2
                    size={16}
                    style={{ color: sub.completed ? 'var(--success)' : 'var(--border)' }}
                  />
                </button>
                <span
                  className="text-sm flex-1"
                  style={{
                    color: sub.completed ? 'var(--subtle)' : 'var(--text)',
                    textDecoration: sub.completed ? 'line-through' : 'none',
                  }}
                >
                  {sub.title}
                </span>
              </div>
            ))}
          </div>

          {/* AI suggested subtasks */}
          {aiSubtasks && aiSubtasks.length > 0 && (
            <div className="mb-3 p-3 rounded-xl" style={{ background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.15)' }}>
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--accent)' }}>
                <Sparkles size={11} className="inline mr-1" />AI Suggestions
              </p>
              <div className="space-y-1">
                {aiSubtasks.map((sub, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                    <button
                      onClick={() => handleAcceptAISubtask(sub)}
                      className="text-xs px-2 py-0.5 rounded font-medium"
                      style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                    >
                      + Add
                    </button>
                    <span>{sub.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add new subtask */}
          <div className="flex gap-2">
            <input
              value={newSubtask}
              onChange={e => setNewSubtask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
              placeholder="Add a subtask..."
              className="flex-1 text-sm outline-none"
              style={inputStyle}
            />
            <button
              onClick={handleAddSubtask}
              className="px-3 rounded-xl"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Meta info */}
        {task.createdAt && (
          <div className="flex items-center gap-4 text-xs mb-6" style={{ color: 'var(--subtle)' }}>
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              Created {format(new Date(task.createdAt), 'MMM d, yyyy')}
            </span>
            {task.deadline && (
              <span className="flex items-center gap-1">
                <Flag size={11} style={{ color: 'var(--warning)' }} />
                Due {format(new Date(task.deadline), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        )}

        {/* Save button */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--muted)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))', color: 'white' }}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
