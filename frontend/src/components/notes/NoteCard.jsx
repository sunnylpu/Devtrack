import { Folder, Pin, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function NoteCard({ note, isSelected, onClick, onDelete, onPin }) {
  return (
    <div
      onClick={onClick}
      className="p-4 rounded-xl cursor-pointer card-hover group transition-all"
      style={{
        background: isSelected ? 'rgba(59,109,251,0.1)' : '#1c2236',
        border: `1px solid ${isSelected ? '#3b6dfb' : '#2a3250'}`,
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold flex-1 pr-2 truncate" style={{ color: '#e2e8f0' }}>
          {note.title}
        </h4>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={e => { e.stopPropagation(); onPin(note._id); }}
            className="p-1 rounded hover:bg-yellow-500/10"
          >
            <Pin size={12} style={{ color: note.isPinned ? '#facc15' : '#566082' }} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(note._id); }}
            className="p-1 rounded hover:bg-red-500/10"
          >
            <Trash2 size={12} style={{ color: '#566082' }} />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs" style={{ color: '#566082' }}>
        <Folder size={11} />
        <span>{note.folder}</span>
        <span>·</span>
        <span>{format(new Date(note.updatedAt), 'MMM d')}</span>
      </div>
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {note.tags.slice(0, 3).map(t => (
            <span key={t} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(59,109,251,0.15)', color: '#3b6dfb' }}>
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
