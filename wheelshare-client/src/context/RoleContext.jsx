import { createContext, useContext, useState } from 'react';

const RoleContext = createContext(null);

export function RoleProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem('ws_role') || null);
  // null = not chosen, 'renter' | 'owner'

  const saveRole = (r) => {
    setRole(r);
    localStorage.setItem('ws_role', r);
  };

  const clearRole = () => {
    setRole(null);
    localStorage.removeItem('ws_role');
  };

  return (
    <RoleContext.Provider value={{ role, saveRole, clearRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext);
