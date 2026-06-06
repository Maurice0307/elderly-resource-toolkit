"use client";

import { useEffect, useRef } from "react";
import { useDailySearch } from "@/contexts/DailySearchContext";

export function DwellTracker() {
  const { increment } = useDailySearch();
  const dwellDone = useRef(false);
  const interacted = useRef(false);
  const counted = useRef(false);

  function tryCount() {
    if (dwellDone.current && interacted.current && !counted.current) {
      counted.current = true;
      increment();
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      dwellDone.current = true;
      tryCount();
    }, 15000);

    const onInteract = () => {
      interacted.current = true;
      tryCount();
    };

    window.addEventListener("resource:interact", onInteract);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resource:interact", onInteract);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
