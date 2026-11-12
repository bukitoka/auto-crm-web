import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ContactStatusBadge } from "./contact-status-badge"

describe("ContactStatusBadge", () => {
  it.each([
    ["lead", "info"],
    ["prospect", "warning"],
    ["customer", "success"],
    ["churned", "secondary"],
  ] as const)("maps %s to %s", (status, variant) => {
    render(<ContactStatusBadge status={status} />)
    expect(screen.getByText(status)).toHaveAttribute("data-variant", variant)
  })
})
