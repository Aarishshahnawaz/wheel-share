import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import ListStepIndicator from '../../components/list/ListStepIndicator';
import StepPhotos from '../../components/list/StepPhotos';
import StepDetails from '../../components/list/StepDetails';
import StepPricing from '../../components/list/StepPricing';
import StepAvailability from '../../components/list/StepAvailability';
import { useVehicleStore } from '../../context/VehicleStoreContext';

const FEATURE_LABELS = {
  helmet: 'Helmet included', self_start: 'Self start', abs: 'ABS',
  disc_brake: 'Disc brake', mobile_holder: 'Mobile holder', full_tank: 'Full tank',
  insured: 'Insured', usb_charge: 'USB charging', ac: 'AC', gps: 'GPS',
  bluetooth: 'Bluetooth', sunroof: 'Sunroof', reverse_cam: 'Reverse camera',
  child_seat: 'Child seat', airbags: 'Airbags', cruise_ctrl: 'Cruise control',
};

// Strip base64 from photos — only keep URL strings (Cloudinary URLs or empty)
// Base64 images are too large for the API and should be uploaded to Cloudinary first.
// For now we store them as-is but truncate to avoid payload limits.
function sanitisePhotos(photos) {
  return photos.map(p => {
    const url = p.url || p;
    // If it's a real URL (not base64), keep it
    if (typeof url === 'string' && !url.startsWith('data:')) {
      return { url, public_id: '' };
    }
    // Base64 — store empty URL (vehicle still saves, just without photo)
    // In production: upload to Cloudinary first, then store the URL
    return { url: '', public_id: '' };
  }).filter(p => p.url); // remove empty
}

export default function ListVehiclePage() {
  const navigate = useNavigate();
  const { addVehicle, backendOnline } = useVehicleStore();

  const [step,         setStep]         = useState(0);
  const [submitting,   setSubmitting]   = useState(false);
  const [submitError,  setSubmitError]  = useState('');
  const [detailErrors, setDetailErrors] = useState({});

  const [photos,  setPhotos]  = useState([]);
  const [details, setDetails] = useState({
    type: 'bike', brand: '', model: '', year: '', fuel: '',
    seats: '', city: '', area: '', address: '', landmark: '', lat: null, lng: null,
    description: '', features: [],
  });
  const [pricing, setPricing] = useState({
    pricingType: 'daily', dailyPrice: '', hourlyPrice: '',
    weeklyDiscount: 10, monthlyDiscount: 20, deposit: '',
    isDailyEnabled: false,
  });
  const [avail, setAvail] = useState({
    days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    availableDates: [],
    startTime: '08:00', endTime: '20:00',
    notice: '3h', instantBook: true, blocked: [],
  });

  const validateDetails = () => {
    const errs = {};
    if (!details.brand)   errs.brand = 'This field is required';
    if (!details.model)   errs.model = 'This field is required';
    if (!details.year)    errs.year  = 'This field is required';
    if (!details.fuel)    errs.fuel  = 'This field is required';
    if (!details.city)    errs.city  = 'This field is required';
    if (!details.address) errs.area  = 'Pickup address is required';
    if (details.type === 'car' && !details.seats) errs.seats = 'This field is required';
    return errs;
  };

  const canNext = () => {
    if (step === 0) return photos.filter(p => !p.uploading).length > 0; // at least 1 uploaded photo
    if (step === 1) return Object.keys(validateDetails()).length === 0;
    if (step === 2) return details.ownerListingType === 'personal'
      ? Number(pricing.hourlyPrice) > 0
      : Number(pricing.dailyPrice) > 0 || Number(pricing.hourlyPrice) > 0;
    return avail.days.length > 0;
  };

  // ── Final submit — properly async, awaits the API call ──────────────────────
  const handleNext = async () => {
    setSubmitError('');

    // Step 1 — validate details before advancing
    if (step === 1) {
      const errs = validateDetails();
      if (Object.keys(errs).length > 0) {
        setDetailErrors(errs);
        return;
      }
      setDetailErrors({});
    }

    if (step < 3) { setStep(s => s + 1); return; }

    // Step 4 — submit to MongoDB via real API
    setSubmitting(true);
    try {
      setDetailErrors({});
      const vehicle = {
        type:  details.type,
        // Sanitise photos — strip base64 to avoid payload size errors
        photos: sanitisePhotos(photos),
        details: {
          ...details,
          features: details.features.map(id => FEATURE_LABELS[id] || id),
        },
        pricing,
        availability: avail,
        name: `${details.brand} ${details.model}`,
      };

      const result = await addVehicle(vehicle);

      if (result) {
        // Success — navigate to My Vehicles
        navigate('/my-vehicles');
      } else {
        setSubmitError('Failed to save vehicle. Please try again.');
      }
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-30">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <button
              onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/my-vehicles')}
              className="flex items-center gap-1.5 text-gray-500 hover:text-orange-500 text-sm font-semibold transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:block">{step > 0 ? 'Back' : 'My Vehicles'}</span>
            </button>
            <div className="flex-1">
              <ListStepIndicator current={step} />
            </div>
          </div>
        </div>

        {/* Offline warning */}
        {!backendOnline && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5">
            <div className="max-w-3xl mx-auto flex items-center gap-2 text-amber-700 text-xs font-semibold">
              <AlertCircle size={13} />
              Server offline — vehicle will be saved locally and synced when reconnected.
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
            {step === 0 && <StepPhotos photos={photos} setPhotos={setPhotos} />}
            {step === 1 && <StepDetails details={details} setDetails={setDetails} errors={detailErrors} />}
            {step === 2 && <StepPricing pricing={pricing} setPricing={setPricing} vehicleType={details.type} ownerListingType={details.ownerListingType || 'business'} />}
            {step === 3 && <StepAvailability avail={avail} setAvail={setAvail} ownerListingType={details.ownerListingType || 'business'} />}

            {/* Submit error */}
            {submitError && (
              <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-4 py-3 rounded-2xl">
                <AlertCircle size={15} className="flex-shrink-0" />
                {submitError}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/my-vehicles')}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
              >
                <ArrowLeft size={15} /> {step === 0 ? 'Cancel' : 'Back'}
              </button>

              <button
                onClick={handleNext}
                disabled={!canNext() || submitting}
                className={`flex items-center gap-2 px-7 py-3 rounded-2xl text-sm font-black transition-all
                  ${canNext()
                    ? 'btn-primary text-white shadow-lg shadow-orange-200 hover:-translate-y-0.5'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                {submitting
                  ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving to database...</>
                  : step === 3
                    ? <><Check size={15} /> Submit Listing</>
                    : <>Continue <ArrowRight size={15} /></>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
