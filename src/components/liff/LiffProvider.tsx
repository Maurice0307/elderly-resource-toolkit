"use client";
import { createContext, useContext, useEffect, useState } from "react";

type LiffInstance = {
  isInClient: () => boolean;
  shareTargetPicker: (messages: object[]) => Promise<{ status: string }>;
  closeWindow: () => void;
};

type LiffState = {
  ready: boolean;
  isInClient: boolean;
  liff: LiffInstance | null;
};

const LiffContext = createContext<LiffState>({
  ready: false,
  isInClient: false,
  liff: null,
});

export function useLiff() {
  return useContext(LiffContext);
}

export function LiffProvider({
  children,
  liffId,
}: {
  children: React.ReactNode;
  liffId: string;
}) {
  const [state, setState] = useState<LiffState>({
    ready: false,
    isInClient: false,
    liff: null,
  });

  useEffect(() => {
    if (!liffId || liffId === "YOUR_LIFF_ID") {
      setState({ ready: true, isInClient: false, liff: null });
      return;
    }

    import("@line/liff")
      .then(({ default: liff }) => {
        liff
          .init({ liffId })
          .then(() => {
            setState({
              ready: true,
              isInClient: liff.isInClient(),
              liff: liff as unknown as LiffInstance,
            });
          })
          .catch(() => {
            setState({ ready: true, isInClient: false, liff: null });
          });
      })
      .catch(() => {
        setState({ ready: true, isInClient: false, liff: null });
      });
  }, [liffId]);

  return <LiffContext.Provider value={state}>{children}</LiffContext.Provider>;
}
