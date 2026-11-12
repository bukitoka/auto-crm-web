import { render, screen } from "@testing-library/react"
import { fr } from "react-day-picker/locale"
import { describe, expect, it } from "vitest"
import { renderWithUser } from "@/test/render"
import { Calendar } from "./calendar"

describe("Calendar", () => {
  it("preserves the focused day across parent renders and updates its locale", () => {
    const month = new Date(2026, 10, 1)
    const { container, rerender } = render(<Calendar mode="single" defaultMonth={month} />)
    const day = container.querySelector<HTMLButtonElement>('button[data-day="11/12/2026"]')
    expect(day).not.toBeNull()
    day?.focus()

    rerender(<Calendar mode="single" defaultMonth={month} className="updated" />)

    expect(container.querySelector('button[data-day="11/12/2026"]')).toBe(day)
    expect(day).toHaveFocus()

    rerender(<Calendar mode="single" defaultMonth={month} locale={fr} />)

    expect(container.querySelector('button[data-day="12/11/2026"]')).toBe(day)
    expect(day).toHaveFocus()
  })

  it("supports month navigation and keyboard focus", async () => {
    const { user } = renderWithUser(<Calendar mode="single" defaultMonth={new Date(2026, 10, 1)} />)

    await user.click(screen.getByRole("button", { name: "Go to the Next Month" }))
    expect(screen.getByText("December 2026")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Go to the Previous Month" }))
    expect(screen.getByText("November 2026")).toBeInTheDocument()

    const day = screen.getByRole("button", { name: /Thursday, November 12th, 2026/ })
    await user.click(day)
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("button", { name: /Friday, November 13th, 2026/ })).toHaveFocus()
  })
})
