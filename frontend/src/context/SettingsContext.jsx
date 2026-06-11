import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [includeDuesInBalance, setIncludeDuesInBalance] = useState(() => {
    const saved = localStorage.getItem('includeDuesInBalance');
    return saved !== null ? JSON.parse(saved) : true; // Default to true or false? Let's say false by default to keep it strict.
  });

  useEffect(() => {
    localStorage.setItem('includeDuesInBalance', JSON.stringify(includeDuesInBalance));
  }, [includeDuesInBalance]);

  return (
    <SettingsContext.Provider value={{ includeDuesInBalance, setIncludeDuesInBalance }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
