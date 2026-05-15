import { useState } from 'react';
import { X, Plus } from 'lucide-react';

const STATUS_OPTIONS = ['todo', 'in-progress', 'review', 'completed'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];

export default function CreateTaskModal({ onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [tags, setTags] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      deadline: deadline || undefined,
    };
    onCreate(taskData);
    onClose();
  };

  const inputStyle = {
    background: '#1c2236',
    border: '1px solid #2a3250',
    color: '#e2e8f0',
    width: '100%',
    padding: '10px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold" style={{ color: '#e2e8f0' }}>New Task</h3>
          <button onClick={onClose} style={{ color: '#566082' }}><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g. Implement user authentication"
              style={inputStyle}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Describe the task..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                style={inputStyle}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.replace('-', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                style={inputStyle}
              >
                {PRIORITY_OPTIONS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Tags (comma separated)</label>
            <input
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="react, auth, frontend"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm" style={{ background: '#1c2236', color: '#566082' }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1"
            style={{ background: 'linear-gradient(135deg, #3b6dfb, #7c3aed)', color: 'white' }}
          >
            <Plus size={16} /> Create Task
          </button>
        </div>
      </div>
    </div>
  );
}
