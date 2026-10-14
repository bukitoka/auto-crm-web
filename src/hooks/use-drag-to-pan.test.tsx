import { fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { beforeAll, describe, expect, it } from "vitest";
import { useDragToPan } from "./use-drag-to-pan";

function Canvas() {
  const ref = useRef<HTMLDivElement>(null);
  useDragToPan(ref);
  return (
    <div ref={ref} data-testid="canvas">
      <div data-no-pan data-testid="card" />
    </div>
  );
}

const mouse = { pointerType: "mouse", button: 0, pointerId: 1 };

describe("useDragToPan", () => {
  beforeAll(() => {
    // jsdom doesn't implement pointer capture.
    HTMLElement.prototype.setPointerCapture ??= () => {};
    HTMLElement.prototype.releasePointerCapture ??= () => {};
    HTMLElement.prototype.hasPointerCapture ??= () => false;
  });

  it("scrolls the canvas opposite to the mouse drag", () => {
    render(<Canvas />);
    const canvas = screen.getByTestId("canvas");
    canvas.scrollLeft = 100;
    canvas.scrollTop = 50;

    fireEvent.pointerDown(canvas, { ...mouse, clientX: 200, clientY: 200 });
    expect(canvas).toHaveAttribute("data-panning", "true");

    fireEvent.pointerMove(canvas, { ...mouse, clientX: 150, clientY: 180 });
    expect(canvas.scrollLeft).toBe(150);
    expect(canvas.scrollTop).toBe(70);

    fireEvent.pointerUp(canvas, mouse);
    expect(canvas).not.toHaveAttribute("data-panning");
  });

  it("does not pan when the drag starts on a data-no-pan element", () => {
    render(<Canvas />);
    const canvas = screen.getByTestId("canvas");

    fireEvent.pointerDown(screen.getByTestId("card"), { ...mouse, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(canvas, { ...mouse, clientX: -100, clientY: 0 });

    expect(canvas.scrollLeft).toBe(0);
    expect(canvas).not.toHaveAttribute("data-panning");
  });
});
