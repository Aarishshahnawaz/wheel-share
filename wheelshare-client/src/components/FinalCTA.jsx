import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';

export default function FinalCTA() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Card */}
        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-blue-600 rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Zap size={32} className="text-white" fill="white" />
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Ready to ride or earn?
            </h2>
            <p className="text-white/80 mt-4 text-lg">
              Join 50,000+ Indians already using WheelShare
            </p>
            <p className="text-white/60 text-sm mt-1">
              Free to join. No hidden charges. Start in 2 minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center justify-center gap-2 bg-white text-orange-600 font-black px-10 py-4 rounded-2xl text-base hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Login to Continue
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center justify-center gap-2 bg-white/20 text-white font-bold px-10 py-4 rounded-2xl text-base hover:bg-white/30 transition-all border border-white/30"
              >
                Create Free Account
              </button>
            </div>

            {/* Micro trust */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-white/70 text-xs font-medium">
              <span>✅ No credit card required</span>
              <span>✅ Aadhaar verified platform</span>
              <span>✅ Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
