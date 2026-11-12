import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { DealStageBadge } from "./deal-stage-badge"

describe("DealStageBadge", () => {
  it.each([
    [{ id: "1", name: "Won", is_won: true, is_lost: false }, "success"],
    [{ id: "2", name: "Lost", is_won: false, is_lost: true }, "destructive"],
    [{ id: "3", name: "Proposal", is_won: false, is_lost: false }, "secondary"],
  ] as const)("maps $0.name to $1", (stage, variant) => {
    render(<DealStageBadge stage={stage} />)
    expect(screen.getByText(stage.name)).toHaveAttribute("data-variant", variant)
  })
})
