import { Check } from 'lucide-react';

const STEPS = [
  { label: 'Schedule', desc: 'Pick dates & time' },
  { label: 'Add-ons', desc: 'Extras & insurance' },
  { label: 'Review', desc: 'Confirm & pay' },
];

export default function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-300
                ${done ? 'bg-green-500 text-white shadow-md shadow-green-200'
                  : active ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md shadow-orange-200'
                  : 'bg-gray-100 text-gray-400'}`}
              >
                {done ? <Check size={16} strokeWidth={3} /> : i + 1}
              </div>
              <div className="text-center hidden sm:block">
                <div className={`text-xs font-bold ${active ? 'text-orange-600' : done ? 'text-green-600' : 'text-gray-400'}`}>
                  {step.label}
                </div>
                <div className="text-xs text-gray-400">{step.desc}</div>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 sm:mb-0 rounded-full transition-all duration-500 ${i < current ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
