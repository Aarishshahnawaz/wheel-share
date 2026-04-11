import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Camera, X, Upload, Loader } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StepDetails from '../../components/list/StepDetails';
import StepPricing from '../../components/list/StepPricing';
import StepAvailability from '../../components/list/StepAvailability';
import { useVehicleStore } from '../../context/VehicleStoreContext';
import { apiUpdateVehicle, apiUploadPhotos } from '../../services/api';

const FEATURE_LABELS = {
  helmet: 'Helmet included', self_start: 'Self start', abs: 'ABS',
  disc_brake: 'Disc brake', mobile_holder: 'Mobile holder', full_tank: 'Full tank',
  insured: 'Insured', usb_charge: 'USB charging', ac: 'AC', gps: 'GPS',
  bluetooth: 'Bluetooth', sunroof: 'Sunroof', reverse_cam: 'Reverse camera',
  child_seat: 'Child seat', airbags: 'Airbags', cruise_ctrl: 'Cruise control',
};
const LABEL_TO_ID = Object.fromEntries(Object.entries(FEATURE_LABELS).map(([id, label]) => [label, id]));
const TABS = ['Details', 'Pricing', 'Availability', 'Photos'];

export default function EditVehiclePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getVehicle, updateVehicle } = useVehicleStore();
  const fileRef = useRef();

  const [tab,          setTab]          = useState(0);
  const [saving,       setSaving]       = useState(false);
  const [detailErrors, setDetailErrors] = useState({});
  const [notFound,     setNotFound]     = useState(false);
  const [saveError,    setSaveError]    = useState('');

  const [details, setDetails] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [avail,   setAvail]   = useState(null);
  const [photos,  setPhotos]  = useState([]); // [{url, public_id}]
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const v = getVehicle(id);
    if (!v) { setNotFound(true); return; }

    const featureIds = (v.details?.features || v.features || []).map(f => LABEL_TO_ID[f] || f);
    setDetails({
      type:        v.type || 'bike',
      brand:       v.brand || v.details?.brand || '',
      model:       v.model || v.details?.model || '',
      year:        v.year  || v.details?.year  || '',
      fuel:        v.fuel  || v.details?.fuel  || '',
      seats:       v.seats || v.details?.seats || '',
      city:        v.city  || v.details?.city  || '',
      area:        v.area  || v.details?.area  || '',
      description: v.description || v.details?.description || '',
      features:    featureIds,
    });
    setPricing({
      dailyPrice:      v.dailyPrice      || v.pricing?.dailyPrice      || '',
      hourlyPrice:     v.hourlyPrice     || v.pricing?.hourlyPrice     || '',
      weeklyDiscount:  v.weeklyDiscount  ?? v.pricing?.weeklyDiscount  ?? 10,
      monthlyDiscount: v.monthlyDiscount ?? v.pricing?.monthlyDiscount ?? 20,
      deposit:         v.deposit         || v.pricing?.deposit         || '',
    });
    setAvail({
      days:        v.availableDays || v.availability?.days || ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      startTime:   v.startTime    || v.availability?.startTime || '08:00',
      endTime:     v.endTime      || v.availability?.endTime   || '20:00',
      notice:      v.availability?.notice || '3h',
      instantBook: v.instantBook  ?? v.availability?.instantBook ?? true,
      blocked:     v.blockedDates || v.availability?.blocked || [],
    });
    setPhotos(v.photos || []);
  }, [id, getVehicle]);

  // Upload new photos via /api/upload
  const handlePhotoFiles = async (files) => {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024);
    if (!valid.length) return;
    setUploading(true);
    try {
      const res = await apiUploadPhotos(valid);
      if (res.success) setPhotos(prev => [...prev, ...res.data]);
    } catch { /* ignore upload errors silently */ }
    finally { setUploading(false); }
  };

  const removePhoto = (idx) => setPhotos(prev => prev.filter((_, i) => i !== idx));

  const validateDetails = () => {
    const errs = {};
    if (!details.brand) errs.brand = 'Brand is required';
    if (!details.model) errs.model = 'Model name is required';
    if (!details.year)  errs.year  = 'Year is required';
    if (!details.fuel)  errs.fuel  = 'Fuel type is required';
    if (!details.city)  errs.city  = 'City is required';
    if (!details.area)  errs.area  = 'Area is required';
    if (details.type === 'car' && !details.seats) errs.seats = 'Seats required for cars';
    return errs;
  };

  const handleSave = async () => {
    setSaveError('');
    if (tab === 0) {
      const errs = validateDetails();
      if (Object.keys(errs).length > 0) { setDetailErrors(errs); return; }
      setDetailErrors({});
    }
    setSaving(true);
    try {
      const payload = {
        type:            details.type,
        brand:           details.brand,
        model:           details.model,
        year:            Number(details.year),
        fuel:            details.fuel,
        seats:           details.seats ? Number(details.seats) : undefined,
        city:            details.city,
        area:            details.area,
        description:     details.description,
        features:        details.features.map(fid => FEATURE_LABELS[fid] || fid),
        dailyPrice:      Number(pricing.dailyPrice)  || 0,
        hourlyPrice:     Number(pricing.hourlyPrice) || 0,
        weeklyDiscount:  pricing.weeklyDiscount,
        monthlyDiscount: pricing.monthlyDiscount,
        deposit:         pricing.deposit ? Number(pricing.deposit) : 0,
        availableDays:   avail.days,
        startTime:       avail.startTime,
        endTime:         avail.endTime,
        instantBook:     avail.instantBook,
        photos,
      };

      const res = await apiUpdateVehicle(id, payload);
      if (res.success) {
        // Update local store
        updateVehicle(id, {
          ...payload,
          details: { type: details.type, brand: details.brand, model: details.model, year: details.year, fuel: details.fuel, seats: details.seats, city: details.city, area: details.area, description: details.description, features: payload.features },
          pricing: { dailyPrice: payload.dailyPrice, weeklyDiscount: payload.weeklyDiscount, monthlyDiscount: payload.monthlyDiscount, deposit: payload.deposit },
          availability: { days: avail.days, startTime: avail.startTime, endTime: avail.endTime, instantBook: avail.instantBook },
        });
        navigate('/my-vehicles');
      }
    } catch (err) {
      setSaveError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (notFound) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-6xl">🔍</div>
        <h2 className="text-xl font-black text-gray-900">Vehicle not found</h2>
        <button onClick={() => navigate('/my-vehicles')} className="btn-primary px-6 py-3 text-white font-bold rounded-2xl text-sm">Back to My Vehicles</button>
      </div>
    </DashboardLayout>
  );

  if (!details) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-30">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate('/my-vehicles')}
              className="flex items-center gap-1.5 text-gray-500 hover:text-orange-500 text-sm font-semibold transition-colors group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> My Vehicles
            </button>
            <h1 className="text-base font-black text-gray-900">Edit Vehicle</h1>
            <button onClick={handleSave} disabled={saving}
              className="btn-primary flex items-center gap-2 px-5 py-2 text-white font-bold rounded-xl text-sm disabled:opacity-70">
              {saving
                ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</>
                : <><Save size={14} /> Save Changes</>}
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          {/* Tabs */}
          <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1 mb-6 shadow-sm">
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(i)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === i ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
                {t}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
            {tab === 0 && <StepDetails details={details} setDetails={setDetails} errors={detailErrors} />}
            {tab === 1 && <StepPricing pricing={pricing} setPricing={setPricing} vehicleType={details.type} />}
            {tab === 2 && <StepAvailability avail={avail} setAvail={setAvail} />}
            {tab === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-black text-gray-900">Vehicle Photos</h2>
                  <p className="text-gray-500 text-sm mt-1">Update your vehicle photos. First photo is the cover.</p>
                </div>

                {/* Upload zone */}
                <div
                  onClick={() => !uploading && fileRef.current.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handlePhotoFiles(e.dataTransfer.files); }}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${uploading ? 'border-orange-200 bg-orange-50 cursor-wait' : 'border-orange-300 cursor-pointer hover:border-orange-400 hover:bg-orange-50'}`}
                >
                  <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    {uploading ? <Loader size={24} className="text-orange-500 animate-spin" /> : <Upload size={24} className="text-orange-500" />}
                  </div>
                  <p className="font-bold text-gray-800 text-sm">{uploading ? 'Uploading...' : 'Click or drag & drop photos'}</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG · Max 10MB each · Up to 8 photos</p>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={e => handlePhotoFiles(e.target.files)} />
                </div>

                {/* Current photos grid */}
                {photos.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-gray-700">{photos.length} photo{photos.length > 1 ? 's' : ''}</span>
                      <span className="text-xs text-gray-400">First photo is your cover</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {photos.map((p, i) => (
                        <div key={i} className="relative group rounded-2xl overflow-hidden aspect-square bg-gray-100">
                          <img src={p.url} alt="" className="w-full h-full object-cover" />
                          {i === 0 && (
                            <div className="absolute top-1.5 left-1.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">Cover</div>
                          )}
                          <button onClick={() => removePhoto(i)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500">
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                      {photos.length < 8 && !uploading && (
                        <button onClick={() => fileRef.current.click()}
                          className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-orange-300 hover:bg-orange-50 transition-all">
                          <Camera size={20} className="text-gray-300" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error */}
            {saveError && (
              <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-4 py-3 rounded-2xl">
                <AlertCircle size={15} /> {saveError}
              </div>
            )}
            {Object.keys(detailErrors).length > 0 && tab === 0 && (
              <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600 font-semibold">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" /> Please fix the errors above before saving.
              </div>
            )}

            {/* Bottom bar */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <button onClick={() => navigate('/my-vehicles')}
                className="px-5 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="btn-primary flex items-center gap-2 px-7 py-3 text-white font-black rounded-2xl text-sm shadow-lg disabled:opacity-70">
                {saving
                  ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</>
                  : <><Save size={15} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
