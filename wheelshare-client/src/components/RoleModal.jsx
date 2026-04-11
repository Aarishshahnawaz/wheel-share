import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, Check } from 'lucide-react';
import { useRole } from '../context/RoleContext';

const OPTIONS = [
  {
    key: 'renter',
    emoji: '🏍️',
    title: 'Rent a Vehicle',
    subtitle: 'I want to rent',
    desc: 'Browse bikes & cars near you. Book instantly, ride freely across India.',
    highlights: ['Bikes from ₹199/day', 'Cars from ₹799/day', 'GPS tracked rides'],
    gradientFrom: '#f97316',
    gradientTo: '#f59e0b',
    ringColor: 'ring-orange-400',
    badgeBg: 'bg-orange-100 text-orange-700',
    checkBg: 'bg-orange-500',
    path: '/rent',
  },
  {
    key: 'owner',
    emoji: '💰',
    title: 'List My Vehicle',
    subtitle: 'I want to earn',
    desc: 'Turn your idle bike or car into a monthly income. You set the price & hours.',
    highlights: ['Earn up to ₹25K/mo', 'Insured rides', 'Instant bank payout'],
    gradientFrom: '#3b82f6',
    gradientTo: '#6366f1',
    ringColor: 'ring-blue-400',
    badgeBg: 'bg-blue-100 text-blue-700',
    checkBg: 'bg-blue-600',
    path: '/list',
  },
];

export default function RoleModal({ onClose }) {
  const navigate = useNavigate();
  const { role: savedRole, saveRole } = useRole();
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(savedRole);
  const [confirming, setConfirming] = useState(false);

  const handleSelect = (key) => setSelected(key);

  const handleConfirm = () => {
    if (!selected) return;
    setConfirming(true);
    saveRole(selected);
    setTimeout(() => {
      onClose();
      navigate('/dashboard');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg animate-modal overflow-hidden">

        {/* Top gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-pink-500 to-blue-600" />

        <div className="p-8">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-800"
          >
            <X size={15} />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-blue-100 text-3xl mb-4 shadow-inner">
              👋
            </div>
            <h2 className="text-2xl font-black text-gray-900">What do you want to do?</h2>
            <p className="text-gray-500 text-sm mt-1.5">
              Pick your role — you can switch anytime from your dashboard
            </p>
          </div>

          {/* Option Cards */}
          <div className="space-y-4 mb-7">
            {OPTIONS.map((opt) => {
              const isSelected = selected === opt.key;
              const isHovered = hovered === opt.key;

              return (
                <button
                  key={opt.key}
                  onClick={() => handleSelect(opt.key)}
                  onMouseEnter={() => setHovered(opt.key)}
                  onMouseLeave={() => setHovered(null)}
                  className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 relative overflow-hidden
                    ${isSelected
                      ? `border-transparent ring-2 ${opt.ringColor} bg-gray-50 shadow-md`
                      : 'border-gray-100 hover:border-gray-200 hover:shadow-md bg-white'
                    }`}
                >
                  {/* Selected check */}
                  {isSelected && (
                    <div className={`absolute top-4 right-4 w-6 h-6 rounded-full ${opt.checkBg} flex items-center justify-center shadow-md`}>
                      <Check size={13} className="text-white" strokeWidth={3} />
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg transition-transform duration-200"
                      style={{
                        background: `linear-gradient(135deg, ${opt.gradientFrom}, ${opt.gradientTo})`,
                        transform: isHovered || isSelected ? 'scale(1.08)' : 'scale(1)',
                      }}
                    >
                      {opt.emoji}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-gray-900 text-base">{opt.title}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${opt.badgeBg}`}>
                          {opt.subtitle}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mt-1 leading-relaxed">{opt.desc}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {opt.highlights.map(h => (
                          <span key={h} className="text-xs bg-gray-100 text-gray-600 font-semibold px-2.5 py-1 rounded-full">
                            ✓ {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={!selected || confirming}
            className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300
              ${selected
                ? 'btn-primary text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            {confirming ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Taking you there...
              </>
            ) : (
              <>
                {selected
                  ? `Continue as ${OPTIONS.find(o => o.key === selected)?.subtitle} →`
                  : 'Select an option to continue'
                }
                {selected && <ArrowRight size={16} />}
              </>
            )}
          </button>

          {/* Switch note */}
          {savedRole && (
            <p className="text-center text-xs text-gray-400 mt-4">
              Currently set to: <span className="font-bold text-gray-600">
                {OPTIONS.find(o => o.key === savedRole)?.title}
              </span> · Selecting a new role will update your preference
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
