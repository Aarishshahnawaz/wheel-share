import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import StepIndicator from '../../components/booking/StepIndicator';
import StepSchedule from '../../components/booking/StepSchedule';
import StepAddons from '../../components/booking/StepAddons';
import StepReview from '../../components/booking/StepReview';
import BookingConfirmed from '../../components/booking/BookingConfirmed';
import { VEHICLES } from '../../data/vehicles';
import { useVehicleById } from '../../hooks/useVehicleById';
import { useAuth } from '../../context/AuthContext';
import { apiCreateBooking } from '../../services/api';

const ADDON_PRICES = {
  insurance_premium: { price: 199, per: 'day' },
  helmet:            { price: 49,  per: 'day' },
  gps:               { price: 99,  per: 'trip' },
  roadside:          { price: 149, per: 'trip' },
  child_seat:        { price: 99,  per: 'day' },
  fuel_prepaid:      { price: 299, per: 'trip' },
};

export default function BookingPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const rentalMode = searchParams.get('mode') || 'hourly';
  const navigate = useNavigate();
  const { user } = useAuth();
  const { vehicle, loading, notFound } = useVehicleById(id);

  const currentUserId = user?.id || user?._id;
  const isOwner = vehicle?.ownerId && currentUserId &&
    String(vehicle.ownerId) === String(currentUserId);

  const [step,      setStep]      = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [savedBooking, setSavedBooking] = useState(null);

  const [booking, setBooking] = useState({
    startDate: '', endDate: '',
    startTime: '10:00', endTime: '10:00',
    addons: [],
  });

  useEffect(() => {
    if (vehicle && vehicle.ownerListingType === 'personal') {
      const today = new Date().toISOString().split('T')[0];
      setBooking(b => ({
        ...b,
        startDate: today,
        endDate: today,
        startTime: vehicle.startTime || '08:00',
        endTime: vehicle.endTime || '20:00',
      }));
    }
  }, [vehicle]);

  const { days, hours, leftoverHours, totalHours } = useMemo(() => {
    if (!booking.startDate || !booking.endDate) return { days: 0, hours: 0, leftoverHours: 0, totalHours: 0 };
    const start = new Date(`${booking.startDate}T${booking.startTime}`);
    const end   = new Date(`${booking.endDate}T${booking.endTime}`);
    const ms = end - start;
    if (ms <= 0) return { days: 0, hours: 0, leftoverHours: 0, totalHours: 0 };
    const diffHours = Math.ceil(ms / 3600000);
    return {
      days: Math.floor(diffHours / 24),
      hours: diffHours % 24,
      leftoverHours: diffHours % 24,
      totalHours: diffHours
    };
  }, [booking]);

  const isPersonalParams = vehicle?.ownerListingType === 'personal';
  // For personal: use booking.personalMode (set by StepSchedule); for business: use URL mode param
  const isHourly = isPersonalParams
    ? (booking.personalMode || 'hourly') === 'hourly'
    : rentalMode === 'hourly';

  const pricing = useMemo(() => {
    if (!vehicle || (days === 0 && leftoverHours === 0 && !(isPersonalParams && (booking.personalMode || 'hourly') === 'daily'))) return { subtotal: 0, addonsTotal: 0, insurance: 0, serviceFee: 0, total: 0 };
    
    let subtotal = 0;
    if (isHourly) {
       subtotal = (vehicle.hourlyPrice || 0) * totalHours;
    } else if (isPersonalParams && (booking.personalMode || 'hourly') === 'daily') {
       // Personal full-day flat rate
       subtotal = vehicle.price || vehicle.dailyPrice || 0;
    } else {
       const billedDays = Math.max(1, days);
       const billedLeftover = days === 0 ? 0 : leftoverHours;
       const leftoverCost = Math.min(billedLeftover * (vehicle.hourlyPrice || 0), vehicle.price);
       subtotal = (billedDays * vehicle.price) + leftoverCost;
    }
    
    const durationCount = isHourly ? 1 : Math.max(1, days);
    const addonsTotal = booking.addons.reduce((sum, id) => {
      const a = ADDON_PRICES[id];
      return sum + (a ? (a.per === 'day' ? a.price * durationCount : a.price) : 0);
    }, 0);
    
    const insurance   = isPersonalParams ? 99 : 99 * durationCount;
    const serviceFee  = Math.round((subtotal + addonsTotal) * 0.08);
    return { subtotal, addonsTotal, insurance, serviceFee, total: subtotal + addonsTotal + insurance + serviceFee };
  }, [vehicle, days, leftoverHours, totalHours, booking.addons, booking.personalMode, isPersonalParams, isHourly]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen gap-3 text-gray-400">
          <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">Loading vehicle...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (notFound || !vehicle) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="text-6xl">🔍</div>
          <h2 className="text-xl font-black text-gray-900">Vehicle not found</h2>
          <button onClick={() => navigate('/rent')} className="btn-primary px-6 py-3 text-white font-bold rounded-2xl text-sm">
            Browse Vehicles
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Prevent owner from booking their own vehicle
  if (isOwner) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
          <div className="text-6xl">🚗</div>
          <h2 className="text-xl font-black text-gray-900">This is your vehicle</h2>
          <p className="text-gray-500 text-sm max-w-xs">You can't book your own listing. Manage it from My Vehicles.</p>
          <div className="flex gap-3">
            <button onClick={() => navigate('/my-vehicles')} className="btn-primary px-6 py-3 text-white font-bold rounded-2xl text-sm">
              My Vehicles
            </button>
            <button onClick={() => navigate('/rent')} className="px-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-2xl text-sm hover:bg-gray-50 transition-all">
              Browse Others
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const canProceed = () => {
    if (step === 0) {
      // Personal daily mode — just needs a date (already set to today)
      if (isPersonalParams && (booking.personalMode || 'hourly') === 'daily') {
        return !!booking.startDate;
      }
      if (!booking.startDate || !booking.endDate || (days <= 0 && hours <= 0)) return false;
      return true;
    }
    return true;
  };

  const handleNext = async () => {
    if (step < 2) { setStep(s => s + 1); return; }

    // Final step — call real booking API
    setConfirming(true);
    setBookingError('');

    if (vehicle.isCurrentlyBooked) {
      setBookingError('Vehicle already booked for this time');
      setConfirming(false);
      return;
    }

    try {
      // vehicle.id may be numeric (static) or a MongoDB ObjectId string
      // Only MongoDB IDs (24-char hex) are valid for the booking API
      const vehicleIdToSend = vehicle.id || vehicle._id;
      const isMongoId = /^[a-f\d]{24}$/i.test(String(vehicleIdToSend));

      if (!isMongoId) {
        setBookingError('This is a demo vehicle and cannot be booked. Please book a real listed vehicle.');
        setConfirming(false);
        return;
      }

      const res = await apiCreateBooking({
        vehicleId:   String(vehicleIdToSend),
        startDate:   booking.startDate,
        endDate:     booking.endDate,
        startTime:   booking.startTime,
        endTime:     booking.endTime,
        days,
        subtotal:    pricing.subtotal,
        addonsTotal: pricing.addonsTotal,
        insurance:   pricing.insurance,
        serviceFee:  pricing.serviceFee,
        total:       pricing.total,
        addons:      booking.addons,
      });
      setSavedBooking(res.data);
      setConfirmed(true);
    } catch (err) {
      setBookingError(err.message || 'Booking failed. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 sticky top-0 z-30">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <button
              onClick={() => step > 0 ? setStep(s => s - 1) : navigate(`/vehicle/${id}`)}
              className="flex items-center gap-1.5 text-gray-500 hover:text-orange-500 font-semibold text-sm transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:block">{step > 0 ? 'Back' : 'Vehicle details'}</span>
            </button>
            <div className="flex-1">
              <StepIndicator current={step} />
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {confirmed ? (
            <BookingConfirmed vehicle={vehicle} booking={booking} total={pricing.total} savedBooking={savedBooking} />
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main step content */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
                  {step === 0 && <StepSchedule booking={booking} setBooking={setBooking} vehicle={vehicle} isHourly={isHourly} />}
                  {step === 1 && <StepAddons booking={booking} setBooking={setBooking} vehicle={vehicle} days={isHourly ? 1 : Math.max(1, days)} />}
                  {step === 2 && <StepReview booking={booking} vehicle={vehicle} days={days} leftoverHours={leftoverHours} totalHours={totalHours} isHourly={isHourly} pricing={pricing} />}

                  {/* Booking error */}
                  {bookingError && (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-4 py-3 rounded-2xl flex items-center gap-2">
                      ❌ {bookingError}
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                    <button
                      onClick={() => step > 0 ? setStep(s => s - 1) : navigate(`/vehicle/${id}`)}
                      className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all"
                    >
                      <ArrowLeft size={15} /> {step === 0 ? 'Cancel' : 'Back'}
                    </button>

                    <button
                      onClick={handleNext}
                      disabled={!canProceed() || confirming}
                      className={`flex items-center gap-2 px-7 py-3 rounded-2xl text-sm font-black transition-all
                        ${canProceed()
                          ? 'btn-primary text-white shadow-lg shadow-orange-200 hover:shadow-xl hover:-translate-y-0.5'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      {confirming ? (
                        <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Processing...</>
                      ) : step === 2 ? (
                        <><Zap size={15} fill="white" /> Pay ₹{pricing.total.toLocaleString('en-IN')}</>
                      ) : (
                        <>Continue <ArrowRight size={15} /></>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sticky price summary */}
              <div className="hidden lg:block">
                <div className="sticky top-24 space-y-4">
                  {/* Vehicle mini card */}
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <img src={vehicle.image} alt={vehicle.name} className="w-full h-36 object-cover" />
                    <div className="p-4">
                      <div className="font-black text-gray-900 text-sm">{vehicle.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{vehicle.area}, {vehicle.city}</div>
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="text-yellow-400 text-xs">⭐</span>
                        <span className="text-xs font-black text-gray-700">{vehicle.rating}</span>
                        <span className="text-xs text-gray-400 ml-auto mt-0.5">
                          {isHourly ? `₹${vehicle.hourlyPrice}/hr` : `₹${vehicle.price}/day`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Live price summary */}
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                    <div className="text-sm font-black text-gray-900 mb-4">Price Summary</div>

                    {days === 0 && hours === 0 ? (
                      <div className="text-center py-4">
                        <div className="text-3xl mb-2">📅</div>
                        <p className="text-xs text-gray-400">Select dates to see pricing</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <Row 
                          label={isHourly 
                            ? `₹${vehicle.hourlyPrice} × ${totalHours} hr${totalHours > 1 ? 's' : ''}` 
                            : `₹${vehicle.price} × ${Math.max(1, days)} day${Math.max(1, days) > 1 ? 's' : ''}${days > 0 && leftoverHours > 0 ? ` + ${leftoverHours} hr${leftoverHours > 1 ? 's' : ''}` : ''}`} 
                          value={pricing.subtotal} 
                        />
                        {booking.addons.length > 0 && (
                          <Row label={`Add-ons (${booking.addons.length})`} value={pricing.addonsTotal} />
                        )}
                        <Row label="Basic insurance" value={pricing.insurance} />
                        <Row label="Service fee (8%)" value={pricing.serviceFee} />
                        <div className="border-t border-dashed border-gray-200 pt-3 mt-1">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-gray-900 text-sm">Total</span>
                            <span className="text-2xl font-black text-orange-500">
                              ₹{pricing.total.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">Incl. all taxes & fees</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Trust */}
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-2">
                    {['Free cancellation up to 24h before', 'Insured ride guaranteed', 'Secure Razorpay payment'].map(t => (
                      <div key={t} className="flex items-center gap-2 text-xs text-green-700 font-semibold">
                        <span className="text-green-500">✓</span> {t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-bold text-gray-800">₹{value.toLocaleString('en-IN')}</span>
    </div>
  );
}
