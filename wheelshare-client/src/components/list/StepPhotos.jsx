import { useRef, useState } from 'react';
import { Upload, X, Star, Loader } from 'lucide-react';
import { apiUploadPhotos } from '../../services/api';

export default function StepPhotos({ photos, setPhotos }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const remaining = 8 - photos.length;
    const toUpload  = files.slice(0, remaining);
    if (!toUpload.length) return;

    setError('');
    setUploading(true);

    // Show local previews immediately while uploading
    const previews = toUpload.map(f => ({ url: URL.createObjectURL(f), uploading: true }));
    setPhotos(p => [...p, ...previews]);

    try {
      const res = await apiUploadPhotos(toUpload);
      if (res.success) {
        // Replace previews with real server URLs
        setPhotos(p => {
          const kept = p.filter(ph => !ph.uploading);
          return [...kept, ...res.data];
        });
      } else {
        setError('Upload failed. Please try again.');
        setPhotos(p => p.filter(ph => !ph.uploading));
      }
    } catch {
      setError('Server offline — photos cannot be saved. Start the backend server and try again.');
      setPhotos(p => p.filter(ph => !ph.uploading));
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      e.target.value = '';
    }
  };

  const remove = (i) => setPhotos(p => p.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-gray-900">Upload vehicle photos</h2>
        <p className="text-gray-500 text-sm mt-1">Good photos get 3× more bookings. Add up to 8 photos.</p>
      </div>

      {/* Upload zone */}
      <div
        onClick={() => !uploading && inputRef.current.click()}
        className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all group
          ${uploading ? 'border-orange-200 bg-orange-50 cursor-wait' : 'border-orange-300 cursor-pointer hover:border-orange-400 hover:bg-orange-50'}`}
      >
        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          {uploading
            ? <Loader size={28} className="text-orange-500 animate-spin" />
            : <Upload size={28} className="text-orange-500" />
          }
        </div>
        <p className="font-bold text-gray-800">{uploading ? 'Uploading...' : 'Click to upload photos'}</p>
        <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 10MB each · Max 8 photos</p>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-4 py-3 rounded-2xl">
          ⚠️ {error}
        </div>
      )}

      {/* Preview grid */}
      {photos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-700">{photos.filter(p => !p.uploading).length} photo{photos.length > 1 ? 's' : ''} uploaded</span>
            <span className="text-xs text-gray-400">First photo is your cover</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {photos.map((p, i) => (
              <div key={i} className="relative group rounded-2xl overflow-hidden aspect-square bg-gray-100">
                <img src={p.url} alt="" className="w-full h-full object-cover" />

                {/* Uploading overlay */}
                {p.uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader size={20} className="text-white animate-spin" />
                  </div>
                )}

                {i === 0 && !p.uploading && (
                  <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star size={9} fill="white" /> Cover
                  </div>
                )}
                {!p.uploading && (
                  <button
                    onClick={() => remove(i)}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
            {photos.length < 8 && !uploading && (
              <button onClick={() => inputRef.current.click()} className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-orange-300 hover:bg-orange-50 transition-all">
                <span className="text-2xl text-gray-300">+</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
        <div className="text-sm font-bold text-blue-800">📸 Photo tips</div>
        {['Take photos in good natural light', 'Include front, back, side & interior views', 'Show odometer & any existing damage clearly'].map(t => (
          <div key={t} className="text-xs text-blue-700 flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span> {t}
          </div>
        ))}
      </div>
    </div>
  );
}
