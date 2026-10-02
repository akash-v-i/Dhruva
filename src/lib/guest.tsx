import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Guest access lets the public (and demo judges) browse the portal without an account.
// Stored locally so a page refresh keeps the visitor inside the portal.
const STORAGE_KEY = "dhruva-guest";

type GuestState = { guest: boolean; ready: boolean; setGuest: (value: boolean) => void };
const GuestContext = createContext<GuestState>({ guest: false, ready: false, setGuest: () => {} });

export function GuestProvider({ children }: { children: ReactNode }) {
  const [guest, setGuestState] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      setGuestState(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* storage blocked — stay signed out */
    }
    setReady(true);
  }, []);
  const setGuest = (value: boolean) => {
    setGuestState(value);
    try {
      if (value) window.localStorage.setItem(STORAGE_KEY, "1");
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };
  return (
    <GuestContext.Provider value={{ guest, ready, setGuest }}>{children}</GuestContext.Provider>
  );
}

export function useGuest() {
  return useContext(GuestContext);
}
