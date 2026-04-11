import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Lock, ChevronDown, ChevronUp, Check, CreditCard, Smartphone, Building2, ArrowLeft, Zap } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { VEHICLES } from '../../data/vehicles';

const MOCK = { days: 3, subtotal: 0, addons: 597, insurance: 297, serviceFee: 0, total: 0 };

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const vehicle = VEHICLES.find(v => v.id === Number(id)) || VEHICLES[0];

  const days = 3;
  const subtotal = vehicle.price * days;
  const addons = 597;
  const insurance = 99 * days;
  const serviceFee = Math.round((subtotal + addons) * 0.08);
  const total = subtotal + addons + insurance + serviceFee;

  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => { setPaying(false); setPaid(true); }, 2000);
  };

  const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const fmtExpiry = (v) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? `${d.slice(0,2)}/${d.slice(2)}` : d; };

  if (paid) return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center space-y-5">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check size={40} className="text-green-500" strokeWidth={3} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Payment Successful!</h2>
            <p className="text-gray-500 text-sm mt-1">₹{total.toLocaleString('en-IN')} paid via {method.toUpperCase()}</p>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-blue-600 rounded-2xl p-4 text-white">
            <div className="text-xs opacity-80 mb-1">Booking ID</div>
            <div className="text-xl font-black tracking-widest">WS{Date.now().toString().slice(-8)}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-left space-y-1.5 text-sm text-green-700">
            <p>✓ Confirmation sent to your WhatsApp & email</p>
            <p>✓ Owner notified — will confirm in 30 min</p>
            <p>✓ Pickup details shared after confirmation</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn-primary w-full py-4 text-white font-black rounded-2xl">
            Go to My Bookings →
          </button>
        </div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-30">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-500 hover:text-orange-500 text-sm font-semibold transition-colors group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
            </button>
            <div className="flex-1 text-center">
              <span className="font-black text-gray-900">Secure Payment</span>
            </div>
            <div className="flex items-center gap-1.5 text-green-600 text-xs font-bold">
              <Lock size={13} /> SSL Secured
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid lg:grid-cols-5 gap-8">

            {/* LEFT: Payment form */}
            <div className="lg:col-span-3 space-y-5">

              {/* Method selector */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-black text-gray-900 mb-5">Choose Payment Method</h3>
                <div className="space-y-3">
                  {[
                    { id: 'upi',        icon: <Smartphone size={20} className="text-purple-500" />, label: 'UPI',          sub: 'GPay, PhonePe, Paytm, BHIM' },
                    { id: 'card',       icon: <CreditCard size={20} className="text-blue-500" />,   label: 'Debit / Credit Card', sub: 'Visa, Mastercard, RuPay' },
                    { id: 'netbanking', icon: <Building2 size={20} className="text-green-500" />,   label: 'Net Banking',  sub: 'All major Indian banks' },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left
                        ${method === m.id ? 'border-orange-400 bg-orange-50 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${method === m.id ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                        {m.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-sm">{m.label}</div>
                        <div className="text-xs text-gray-500">{m.sub}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                        ${method === m.id ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                        {method === m.id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Method-specific input */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                {method === 'upi' && (
                  <div className="space-y-4">
                    <h3 className="font-black text-gray-900">Enter UPI ID</h3>
                    <div className="relative">
                      <input
                        type="text"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                        className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                      {upiId.includes('@') && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                          <Check size={16} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'GPay', emoji: '🟢' },
                        { label: 'PhonePe', emoji: '🟣' },
                        { label: 'Paytm', emoji: '🔵' },
                        { label: 'BHIM', emoji: '🟠' },
                      ].map(app => (
                        <button key={app.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all">
                          <span className="text-xl">{app.emoji}</span>
                          <span className="text-xs font-bold text-gray-600">{app.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {method === 'card' && (
                  <div className="space-y-4">
                    <h3 className="font-black text-gray-900">Card Details</h3>
                    {/* Card preview */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="text-xs opacity-60 mb-4">DEBIT / CREDIT CARD</div>
                      <div className="text-lg font-mono tracking-widest mb-4">
                        {card.number || '•••• •••• •••• ••••'}
                      </div>
                      <div className="flex justify-between text-xs">
                        <div>
                          <div className="opacity-60">CARD HOLDER</div>
                          <div className="font-bold mt-0.5">{card.name || 'YOUR NAME'}</div>
                        </div>
                        <div className="text-right">
                          <div className="opacity-60">EXPIRES</div>
                          <div className="font-bold mt-0.5">{card.expiry || 'MM/YY'}</div>
                        </div>
                      </div>
                    </div>
                    <input value={fmtCard(card.number)} onChange={e => setCard(c => ({ ...c, number: e.target.value }))}
                      placeholder="Card number" className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400 font-mono" />
                    <input value={card.name} onChange={e => setCard(c => ({ ...c, name: e.target.value.toUpperCase() }))}
                      placeholder="Name on card" className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    <div className="grid grid-cols-2 gap-3">
                      <input value={fmtExpiry(card.expiry)} onChange={e => setCard(c => ({ ...c, expiry: e.target.value }))}
                        placeholder="MM/YY" className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400" />
                      <input value={card.cvv} onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g,'').slice(0,3) }))}
                        placeholder="CVV" type="password" className="px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    </div>
                  </div>
                )}

                {method === 'netbanking' && (
                  <div className="space-y-4">
                    <h3 className="font-black text-gray-900">Select Your Bank</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB', 'BOB', 'Canara'].map(bank => (
                        <button key={bank} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-orange-300 hover:bg-orange-50 transition-all text-sm font-bold text-gray-700">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-black text-gray-600">{bank.slice(0,2)}</div>
                          {bank} Bank
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pay button */}
              <button
                onClick={handlePay}
                disabled={paying}
                className="btn-primary w-full py-5 text-white font-black text-base rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-orange-200 hover:shadow-2xl hover:-translate-y-0.5 transition-all disabled:opacity-70"
              >
                {paying ? (
                  <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Processing payment...</>
                ) : (
                  <><Lock size={18} /> Pay ₹{total.toLocaleString('en-IN')} Securely</>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                <Shield size={12} className="text-green-500" />
                Secured by Razorpay · 256-bit SSL · PCI DSS Compliant
              </p>
            </div>

            {/* RIGHT: Booking summary */}
            <div className="lg:col-span-2 space-y-4">
              {/* Vehicle card */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <img src={vehicle.image} alt={vehicle.name} className="w-full h-40 object-cover" />
                <div className="p-5">
                  <div className="text-xs font-bold text-orange-500 mb-1">{vehicle.type === 'bike' ? '🏍️ Bike' : '🚗 Car'}</div>
                  <h3 className="font-black text-gray-900">{vehicle.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{vehicle.area}, {vehicle.city} · {days} days</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="text-yellow-400 text-xs">⭐</span>
                    <span className="text-xs font-bold text-gray-700">{vehicle.rating} ({vehicle.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                <button onClick={() => setShowBreakdown(!showBreakdown)} className="w-full flex items-center justify-between mb-1">
                  <span className="font-black text-gray-900 text-sm">Price Breakdown</span>
                  {showBreakdown ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
                </button>

                {showBreakdown && (
                  <div className="space-y-2.5 mt-4 pt-4 border-t border-gray-100">
                    {[
                      { label: `₹${vehicle.price} × ${days} days`, val: subtotal },
                      { label: 'Add-ons', val: addons },
                      { label: 'Basic insurance', val: insurance },
                      { label: 'Service fee (8%)', val: serviceFee },
                    ].map(r => (
                      <div key={r.label} className="flex justify-between text-sm">
                        <span className="text-gray-500">{r.label}</span>
                        <span className="font-bold text-gray-800">₹{r.val.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className={`flex items-center justify-between ${showBreakdown ? 'mt-4 pt-4 border-t border-dashed border-gray-200' : 'mt-2'}`}>
                  <span className="font-black text-gray-900">Total</span>
                  <div className="text-right">
                    <div className="text-2xl font-black text-orange-500">₹{total.toLocaleString('en-IN')}</div>
                    <div className="text-xs text-gray-400">Incl. all taxes</div>
                  </div>
                </div>
              </div>

              {/* Trust */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-2">
                {['Free cancellation up to 24h before pickup', 'Instant refund on cancellation', 'Ride insured up to ₹1 lakh'].map(t => (
                  <div key={t} className="flex items-center gap-2 text-xs text-green-700 font-semibold">
                    <Check size={12} className="text-green-500 flex-shrink-0" strokeWidth={3} /> {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
