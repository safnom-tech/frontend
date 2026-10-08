"use client";

import { createContext, useContext, type ReactNode } from "react";

export type InlineFieldChromeContextValue = {
  contains: (node: Node | null) => boolean;
  isColorPanelOpen: () => boolean;
};

const InlineFieldChromeContext =
  createContext<InlineFieldChromeContextValue | null>(null);

export function InlineFieldChromeProvider({
  value,
  children,
}: {
  value: InlineFieldChromeContextValue;
  children: ReactNode;
}) {
  return (
    <InlineFieldChromeContext.Provider value={value}>
      {children}
    </InlineFieldChromeContext.Provider>
  );
}

export function useInlineFieldChromeBlurGuard(): InlineFieldChromeContextValue | null {
  return useContext(InlineFieldChromeContext);
}
