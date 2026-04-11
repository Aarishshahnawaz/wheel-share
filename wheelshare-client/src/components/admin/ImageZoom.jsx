import { X, ZoomIn } from 'lucide-react';
import { useState } from 'react';

export function ZoomableImage({ src, alt, className }) {
  const [open, setOpen] = useState(false);
  if (!src) return (
    <div className={`bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-semibold rounded-xl ${className}`}>
      Not uploaded
    </div>
  );
  return (
    <>
      <div className={`relative group cursor-zoom-in overflow-hidden rounded-xl ${className}`} onClick={() => setOpen(true)}>
        <img src={src} alt={alt} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
          <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <button className="absolute top-5 right-5 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <X size={20} />
          </button>
          <img src={src} alt={alt} className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()} />
          <div className="absolute bottom-5 text-white/60 text-sm">{alt} · Click anywhere to close</div>
        </div>
      )}
    </>
  );
}
