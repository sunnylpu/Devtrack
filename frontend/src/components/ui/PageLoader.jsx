import { Loader2 } from 'lucide-react';

export default function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center animate-fade-in">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(59,109,251,0.1)' }}
        >
          <Loader2
            size={28}
            className="animate-spin"
            style={{ color: '#3b6dfb' }}
          />
        </div>
        <p className="text-sm font-medium" style={{ color: '#566082' }}>{message}</p>
      </div>
    </div>
  );
}
