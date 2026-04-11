import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Bell, CreditCard, HelpCircle, ChevronRight, LogOut, Moon, Globe, Sun } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';

function SettingRow({ icon, label, desc, onClick, right, danger }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-colors text-left group ${danger ? 'hover:bg-red-50' : 'hover:bg-gray-50'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${danger ? 'bg-red-100' : 'bg-gray-100 group-hover:bg-orange-100'}`}>
        <span className={danger ? 'text-red-500' : 'text-gray-600 group-hover:text-orange-500'}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-bold ${danger ? 'text-red-600' : 'text-gray-900'}`}>{label}</div>
        {desc && <div className="text-xs text-gray-500 mt-0.5">{desc}</div>}
      </div>
      {right !== undefined ? right : <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0" />}
    </button>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-1 ${value ? 'bg-orange-500 focus:ring-orange-400' : 'bg-gray-200 focus:ring-gray-400'}`}>
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${value ? 'left-6' : 'left-1'}`} />
    </button>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const { clearRole } = useRole();

  const [notifs, setNotifs] = useState({
    bookings: true, payments: true, promos: false, sms: true,
  });

  const handleLogout = () => { clearRole(); logout(); navigate('/'); };

  const kycColor = user?.kycStatus === 'verified' ? 'text-green-600' : user?.kycStatus === 'rejected' ? 'text-red-500' : 'text-yellow-600';
  const kycLabel = user?.kycStatus === 'verified' ? 'Verified ✅' : user?.kycStatus === 'rejected' ? 'Rejected ❌' : 'Pending ⏳';

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-100 px-6 py-5 sticky top-0 z-30">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-xl font-black text-gray-900">Settings</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">

          {/* Account */}
          <Section title="Account">
            <SettingRow icon={<User size={18} />} label="Edit Profile"
              desc={user?.name || 'Update your name, photo & contact'}
              onClick={() => navigate('/profile')} />
            <SettingRow icon={<Shield size={18} />} label="KYC Verification"
              desc={<span className={`font-bold ${kycColor}`}>{kycLabel}</span>}
              onClick={() => navigate('/profile')} />
            <SettingRow icon={<CreditCard size={18} />} label="Payment Methods"
              desc="Manage UPI, cards & bank accounts" onClick={() => {}} />
          </Section>

          {/* Notifications */}
          <Section title="Notifications">
            <div className="px-5 pb-4 space-y-4">
              {[
                { key: 'bookings', label: 'Booking updates',   desc: 'Confirmations, cancellations, reminders' },
                { key: 'payments', label: 'Payment alerts',    desc: 'Payouts, refunds, transactions' },
                { key: 'promos',   label: 'Offers & promos',   desc: 'Discounts, seasonal deals' },
                { key: 'sms',      label: 'SMS notifications', desc: 'Critical alerts via SMS' },
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-gray-900">{n.label}</div>
                    <div className="text-xs text-gray-500">{n.desc}</div>
                  </div>
                  <Toggle value={notifs[n.key]} onChange={v => setNotifs(p => ({ ...p, [n.key]: v }))} />
                </div>
              ))}
            </div>
          </Section>

          {/* Preferences */}
          <Section title="Preferences">
            <SettingRow icon={<Globe size={18} />} label="Language" desc="English" onClick={() => {}} />

            {/* Dark mode — real toggle with localStorage */}
            <div className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                {darkMode ? <Moon size={18} className="text-indigo-500" /> : <Sun size={18} className="text-yellow-500" />}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-gray-900">Dark Mode</div>
                <div className="text-xs text-gray-500">{darkMode ? 'Currently on' : 'Currently off'} · saved automatically</div>
              </div>
              <Toggle value={darkMode} onChange={toggleDarkMode} />
            </div>
          </Section>

          {/* Support */}
          <Section title="Support">
            <SettingRow icon={<HelpCircle size={18} />} label="Help Center" desc="FAQs, guides & contact support" onClick={() => {}} />
            <SettingRow icon={<Shield size={18} />} label="Privacy Policy" onClick={() => {}} />
            <SettingRow icon={<Shield size={18} />} label="Terms of Service" onClick={() => {}} />
          </Section>

          {/* App info */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 text-center space-y-1">
            <div className="text-sm font-black text-gray-900">WheelShare v1.0.0</div>
            <div className="text-xs text-gray-400">Made with ❤️ in India 🇮🇳</div>
          </div>

          {/* Logout */}
          <div className="bg-white rounded-3xl border border-red-100 shadow-sm overflow-hidden">
            <div className="px-3 py-2">
              <SettingRow icon={<LogOut size={18} />} label="Logout"
                desc="Sign out of your account" onClick={handleLogout} danger />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-2">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="px-3 pb-3 space-y-0.5">{children}</div>
    </div>
  );
}
