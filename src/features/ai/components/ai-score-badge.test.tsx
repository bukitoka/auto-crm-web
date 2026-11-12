import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AiScoreBadge } from "./ai-score-badge"

describe("AiScoreBadge", () => {
  it.each([
    [85, "success"],
    [70, "success"],
    [55, "warning"],
    [40, "warning"],
    [12, "secondary"],
  ] as const)("maps score %i to %s", (score, variant) => {
    render(<AiScoreBadge score={score} />)
    expect(screen.getByText(String(score))).toHaveAttribute("data-variant", variant)
  })

  it("shows 'Not set' when not scored", () => {
    render(<AiScoreBadge score={null} />)
    expect(screen.getByText("Not set")).toBeInTheDocument()
  })
})
