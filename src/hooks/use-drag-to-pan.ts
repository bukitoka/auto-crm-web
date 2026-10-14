"use client";

import { type RefObject, useEffect } from "react";

/**
 * Pan a scrollable element by dragging its empty background with the mouse,
 * like a design-tool canvas. Elements marked with `data-no-pan` (cards, lanes)
 * keep their normal behavior. Touch devices already scroll natively.
 * While panning, the element gets `data-panning="true"` for styling.
 */
export function useDragToPan(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let start: { x: number; y: number; left: number; top: number } | null = null;

    function onPointerDown(event: PointerEvent) {
      if (!element || event.pointerType !== "mouse" || event.button !== 0) return;
      if ((event.target as HTMLElement).closest("[data-no-pan]")) return;
      start = {
        x: event.clientX,
        y: event.clientY,
        left: element.scrollLeft,
        top: element.scrollTop,
      };
      element.setPointerCapture(event.pointerId);
      element.dataset.panning = "true";
    }

    function onPointerMove(event: PointerEvent) {
      if (!element || !start) return;
      element.scrollLeft = start.left - (event.clientX - start.x);
      element.scrollTop = start.top - (event.clientY - start.y);
    }

    function onPointerUp(event: PointerEvent) {
      if (!element || !start) return;
      start = null;
      delete element.dataset.panning;
      if (element.hasPointerCapture(event.pointerId)) {
        element.releasePointerCapture(event.pointerId);
      }
    }

    element.addEventListener("pointerdown", onPointerDown);
    element.addEventListener("pointermove", onPointerMove);
    element.addEventListener("pointerup", onPointerUp);
    element.addEventListener("pointercancel", onPointerUp);
    return () => {
      element.removeEventListener("pointerdown", onPointerDown);
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerup", onPointerUp);
      element.removeEventListener("pointercancel", onPointerUp);
    };
  }, [ref]);
}
