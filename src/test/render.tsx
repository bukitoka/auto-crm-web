import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * Render a client component with the providers from the root layout and a
 * `user` for realistic interactions:
 *
 *   const { user } = renderWithUser(<MyButton />);
 *   await user.click(screen.getByRole("button"));
 */
export function renderWithUser(ui: ReactElement) {
  const user = userEvent.setup();
  return { user, ...render(ui, { wrapper: TooltipProvider }) };
}
