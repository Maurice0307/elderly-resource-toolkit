"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const DAILY_CAP = 3;

function todayKey() {
  return `ds_${new Date().toISOString().slice(0, 10)}`;
}

type Ctx = {
  count: number;
  canSearch: boolean;
  increment: () => void;
};

const DailySearchContext = createContext<Ctx>({ count: 0, canSearch: true, increment: () => {} });

export function DailySearchProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const stored = Number(localStorage.getItem(todayKey()) ?? 0);
    setCount(stored);
  }, []);

  const increment = useCallback(() => {
    setCount((prev) => {
      if (prev >= DAILY_CAP) return prev;
      const next = prev + 1;
      localStorage.setItem(todayKey(), String(next));
      return next;
    });
  }, []);

  return (
    <DailySearchContext.Provider value={{ count, canSearch: count < DAILY_CAP, increment }}>
      {children}
    </DailySearchContext.Provider>
  );
}

export function useDailySearch() {
  return useContext(DailySearchContext);
}
