import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService, aiService } from '../services';
import { Plus, Trash2, ChevronRight, Tag, Clock, Sparkles, CheckCircle2, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useRealTimeBoard } from '../hooks/useSocket';

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: '#71717a' },
  { id: 'in-progress', label: 'In Progress', color: 'var(--accent-2)' },
  { id: 'review', label: 'Review', color: '#c084fc' },
  { id: 'completed', label: 'Completed', color: 'var(--success)' },
];

const PRIORITY_STYLES = {
  urgent: { bg: 'rgba(248,113,113,0.1)', color: 'var(--danger)' },
  high: { bg: 'rgba(251,146,60,0.1)', color: 'var(--warning)' },
  medium: { bg: 'rgba(250,204,21,0.1)', color: 'var(--warning)' },
  low: { bg: 'rgba(74,222,128,0.1)', color: 'var(--success)' },
};

function TaskCard({ task, onStatusChange, onDelete }) {
  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;
  const progress = task.subtaskProgress || 0;

  return (
    <div
      className="group rounded-xl p-4 mb-3 cursor-pointer card-hover"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold leading-tight flex-1 pr-2" style={{ color: 'var(--text)' }}>
          {task.title}
        </h4>
        <button
          onClick={() => onDelete(task._id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-500/10 hover:text-red-400"
          style={{ color: 'var(--subtle)' }}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Tags */}
      {task.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map(t => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Subtask progress */}
      {task.subtasks?.length > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--subtle)' }}>
            <span>Subtasks</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-strong))' }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: priorityStyle.bg, color: priorityStyle.color }}
        >
          {task.priority}
        </span>
        {task.deadline && (
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--subtle)' }}>
            <Clock size={11} />
            {format(new Date(task.deadline), 'MMM d')}
          </div>
        )}
      </div>

      {/* Quick status change */}
      {task.status !== 'completed' && (
        <button
          onClick={() => {
            const next = { 'todo': 'in-progress', 'in-progress': 'review', 'review': 'completed' };
            onStatusChange(task._id, next[task.status]);
          }}
          className="mt-3 w-full text-xs py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
          style={{ background: 'var(--surface-3)', color: 'var(--subtle)' }}
        >
          <ChevronRight size={12} /> Move Forward
        </button>
      )}
    </div>
  );
}

function AddTaskModal({ onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('todo');
  const [aiBreaking, setAiBreaking] = useState(false);
  const [suggestedSubtasks, setSuggestedSubtasks] = useState([]);

  const handleAIBreakdown = async () => {
    if (!title) return toast.error('Enter task title first');
    setAiBreaking(true);
    try {
      const { data } = await aiService.breakdownTask(title);
      setSuggestedSubtasks(data.data.subtasks || []);
      toast.success('AI subtasks generated!');
    } catch {
      toast.error('AI breakdown failed');
    } finally {
      setAiBreaking(false);
    }
  };

  const handleAdd = () => {
    if (!title.trim()) return toast.error('Task title required');
    onAdd({
      title: title.trim(),
      priority,
      status,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      subtasks: suggestedSubtasks.map(s => ({ title: s.title })),
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-panel animate-fade-in"
        style={{ maxWidth: 480 }}
      >
        <h3 className="text-lg font-bold mb-5" style={{ color: 'var(--text)' }}>Create New Task</h3>
        <div className="space-y-4">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Task title..."
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              {['urgent', 'high', 'medium', 'low'].map(p => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              {COLUMNS.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <input
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="Tags (comma separated)"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />

          {/* AI breakdown button */}
          <button
            onClick={handleAIBreakdown}
            disabled={aiBreaking}
            className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            style={{ background: 'rgba(167,139,250,0.1)', color: 'var(--accent)', border: '1px solid rgba(167,139,250,0.2)' }}
          >
            {aiBreaking
              ? <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              : <Sparkles size={14} />
            }
            {aiBreaking ? 'Generating subtasks...' : 'AI: Generate Subtasks'}
          </button>

          {suggestedSubtasks.length > 0 && (
            <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--accent-strong)' }}>AI-Generated Subtasks:</p>
              {suggestedSubtasks.map((s, i) => (
                <div key={i} className="flex items-center gap-2 py-1">
                  <CheckCircle2 size={12} style={{ color: 'var(--success)' }} />
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>{s.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: 'var(--surface-2)', color: 'var(--subtle)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))', color: 'white' }}
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', 'kanban'],
    queryFn: () => taskService.getKanban().then(r => r.data.data.board),
  });

  const createMutation = useMutation({
    mutationFn: taskService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['analytics']);
      toast.success('Task created!');
    },
    onError: () => toast.error('Failed to create task'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => taskService.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries(['tasks']),
  });

  const deleteMutation = useMutation({
    mutationFn: taskService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      toast.success('Task deleted');
    },
  });

  const board = data || {};

  // Real-time: refresh board on socket events
  useRealTimeBoard(() => {
    queryClient.invalidateQueries(['tasks']);
  });

  // Drag handler
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // If column changed, update status
    if (destination.droppableId !== source.droppableId) {
      updateStatusMutation.mutate({ id: draggableId, status: destination.droppableId });
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ height: '100%' }}>
      {/* Header */}
      <div className="px-8 py-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Kanban Board</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--subtle)' }}>Drag and track your tasks</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))', color: 'white' }}
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-auto px-8 py-6 pb-8">
        {isLoading ? (
          <div className="flex gap-5">
            {COLUMNS.map(c => (
              <div key={c.id} className="w-72 flex-shrink-0">
                <div className="skeleton h-8 rounded-xl mb-4" />
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="skeleton h-28 rounded-xl" />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-5" style={{ minWidth: 'max-content' }}>
              {COLUMNS.map(col => (
                <div key={col.id} className="w-72 flex-shrink-0">
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>{col.label}</h3>
                    </div>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${col.color}22`, color: col.color }}
                    >
                      {(board[col.id] || []).length}
                    </span>
                  </div>

                  {/* Droppable column */}
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="rounded-xl p-3 min-h-48 transition-all"
                        style={{
                          background: snapshot.isDraggingOver ? 'var(--accent-soft)' : 'var(--surface)',
                          border: snapshot.isDraggingOver ? '1px dashed var(--accent)' : '1px dashed var(--border)',
                        }}
                      >
                        {(board[col.id] || []).map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.85 : 1,
                                }}
                              >
                                <div {...provided.dragHandleProps} className="mb-0">
                                  <TaskCard
                                    task={task}
                                    onStatusChange={(id, status) => updateStatusMutation.mutate({ id, status })}
                                    onDelete={(id) => deleteMutation.mutate(id)}
                                  />
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {(board[col.id] || []).length === 0 && (
                          <div className="flex items-center justify-center h-24 text-xs" style={{ color: 'var(--border)' }}>
                            Drop tasks here
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}
      </div>

      {showModal && (
        <AddTaskModal
          onClose={() => setShowModal(false)}
          onAdd={(data) => createMutation.mutate(data)}
        />
      )}
    </div>
  );
}
