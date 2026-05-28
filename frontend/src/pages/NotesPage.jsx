import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noteService } from '../services';
import { Plus, Search, Folder, Pin, Trash2, FileText, X } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function NoteCard({ note, isSelected, onClick, onDelete, onPin }) {
  return (
    <div
      onClick={onClick}
      className="p-4 rounded-xl cursor-pointer card-hover group transition-all"
      style={{
        background: isSelected ? 'var(--accent-soft)' : 'var(--surface-2)',
        border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold flex-1 pr-2 truncate" style={{ color: 'var(--text)' }}>{note.title}</h4>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100">
          <button onClick={e => { e.stopPropagation(); onPin(note._id); }} className="p-1 rounded hover:bg-yellow-500/10">
            <Pin size={12} style={{ color: note.isPinned ? 'var(--warning)' : 'var(--subtle)' }} />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(note._id); }} className="p-1 rounded hover:bg-red-500/10">
            <Trash2 size={12} style={{ color: 'var(--subtle)' }} />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--subtle)' }}>
        <Folder size={11} />
        <span>{note.folder}</span>
        <span>·</span>
        <span>{format(new Date(note.updatedAt), 'MMM d')}</span>
      </div>
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {note.tags.slice(0, 3).map(t => (
            <span key={t} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NotesPage() {
  const [selected, setSelected] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newFolder, setNewFolder] = useState('General');
  const queryClient = useQueryClient();

  const { data: notesData, isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: () => noteService.getAll().then(r => r.data),
  });
  const notes = Array.isArray(notesData?.data) ? notesData.data : [];

  const { data: selectedNoteData } = useQuery({
    queryKey: ['notes', selected],
    queryFn: () => noteService.getOne(selected).then(r => r.data.data.note),
    enabled: !!selected,
  });

  // Sync editor state when a note is selected
  useEffect(() => {
    if (selectedNoteData) {
      setEditTitle(selectedNoteData.title);
      setEditContent(selectedNoteData.content);
    }
  }, [selectedNoteData]);

  const createMutation = useMutation({
    mutationFn: noteService.create,
    onSuccess: (res) => {
      queryClient.invalidateQueries(['notes']);
      setSelected(res.data.data.note._id);
      setShowCreate(false);
      setNewTitle('');
      toast.success('Note created!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => noteService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['notes']),
  });

  const deleteMutation = useMutation({
    mutationFn: noteService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['notes']);
      setSelected(null);
      toast.success('Note deleted');
    },
  });

  const pinMutation = useMutation({
    mutationFn: noteService.togglePin,
    onSuccess: () => queryClient.invalidateQueries(['notes']),
  });

  const handleSave = () => {
    if (!selected) return;
    updateMutation.mutate({ id: selected, data: { title: editTitle, content: editContent } });
    toast.success('Saved!');
  };

  const filteredNotes = search
    ? notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()))
    : notes;

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Note list sidebar */}
      <div className="w-72 lg:w-80 flex-shrink-0 flex flex-col border-r" style={{ borderColor: 'var(--border)', background: 'var(--sidebar)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold" style={{ color: 'var(--text)' }}>Notes</h2>
            <button
              onClick={() => setShowCreate(true)}
              className="p-2 rounded-lg"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--subtle)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading
            ? [1,2,3,4].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)
            : filteredNotes.map(note => (
                <NoteCard
                  key={note._id}
                  note={note}
                  isSelected={selected === note._id}
                  onClick={() => setSelected(note._id)}
                  onDelete={id => deleteMutation.mutate(id)}
                  onPin={id => pinMutation.mutate(id)}
                />
              ))
          }
          {!isLoading && filteredNotes.length === 0 && (
            <div className="text-center py-10">
              <FileText size={32} style={{ color: 'var(--border)', margin: '0 auto 8px' }} />
              <p className="text-sm" style={{ color: 'var(--subtle)' }}>No notes yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col" data-color-mode="dark">
        {selected && selectedNoteData ? (
          <>
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="text-xl font-bold bg-transparent outline-none flex-1"
                style={{ color: 'var(--text)' }}
              />
              <button
                onClick={handleSave}
                className="ml-4 px-5 py-2 rounded-xl text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))', color: 'white' }}
              >
                Save
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <MDEditor
                value={editContent}
                onChange={setEditContent}
                height="100%"
                style={{ borderRadius: 0, background: 'var(--bg)' }}
                preview="live"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--subtle)' }}>
            <div className="text-center">
              <FileText size={56} style={{ color: 'var(--surface-2)', margin: '0 auto 16px' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--border)' }}>Select a note</h3>
              <p className="text-sm">Choose a note from the sidebar or create a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 animate-fade-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold" style={{ color: 'var(--text)' }}>New Note</h3>
              <button onClick={() => setShowCreate(false)} style={{ color: 'var(--subtle)' }}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Note title..."
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
              <input
                value={newFolder}
                onChange={e => setNewFolder(e.target.value)}
                placeholder="Folder name"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            </div>
            <button
              onClick={() => { if(newTitle) createMutation.mutate({ title: newTitle, folder: newFolder, content: `# ${newTitle}\n\n` }); }}
              className="mt-4 w-full py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))', color: 'white' }}
            >
              Create Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
