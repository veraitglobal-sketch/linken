"use client";

import { createContext, useContext, type ReactNode } from "react";

const MapChromeSlotContext = createContext<ReactNode>(null);

/** Shell extras (Getting started, mobile menu) render inside the map toolbar. */
export function MapChromeSlotProvider({
  extras,
  children,
}: {
  extras: ReactNode;
  children: ReactNode;
}) {
  return (
    <MapChromeSlotContext.Provider value={extras}>
      {children}
    </MapChromeSlotContext.Provider>
  );
}

export function MapChromeSlot() {
  return useContext(MapChromeSlotContext);
}
