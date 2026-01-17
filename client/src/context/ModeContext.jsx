import React, { createContext, useContext, useEffect, useState } from "react";

const ModeContext = createContext();

export function ModeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("accountMode") || "live";
  });

  useEffect(() => {
    localStorage.setItem("accountMode", mode);
  }, [mode]);

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  return useContext(ModeContext);
}
