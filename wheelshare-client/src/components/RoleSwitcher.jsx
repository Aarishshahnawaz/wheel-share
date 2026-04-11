import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { useAuth } from '../context/AuthContext';
import RoleModal from './RoleModal';

export default function RoleSwitcher() {
  const { role }      = useRole();
  const { isLoggedIn } = useAuth();
  const [showModal, setShowModal] = useState(false);

  // Never show if not logged in or no role selected
  if (!isLoggedIn || !role) return null;

  const label = role === 'renter' ? '🏍️ Renter' : '💰 Owner';
  const color = role === 'renter'
    ? 'bg-orange-100 text-orange-700 border-orange-200'
    : 'bg-blue-100 text-blue-700 border-blue-200';

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all hover:shadow-sm ${color}`}
        title="Switch role"
      >
        {label}
        <RefreshCw size={11} />
      </button>
      {showModal && <RoleModal onClose={() => setShowModal(false)} />}
    </>
  );
}
