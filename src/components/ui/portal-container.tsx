"use client";

import { createContext, useContext } from "react";

/**
 * Where floating UI (e.g. the Combobox popup) should be portaled.
 * Modal dialogs provide their own content element here: a popup portaled to
 * <body> would sit outside the dialog, where the dialog blocks clicks and
 * treats them as "click outside" (closing itself).
 */
const PortalContainerContext = createContext<HTMLElement | null>(null);

export const PortalContainerProvider = PortalContainerContext.Provider;

export function usePortalContainer() {
  return useContext(PortalContainerContext);
}
