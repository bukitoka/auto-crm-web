import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CountBarChart } from "./count-bar-chart"

describe("CountBarChart", () => {
  it.each([{ data: [] }, { data: [{ name: "Lead", count: 0 }] }])(
    "explains missing data instead of showing an empty chart",
    ({ data }) => {
      const { container } = render(
        <CountBarChart data={data} label="Contacts" emptyText="No contacts yet." />,
      )

      expect(screen.getByText("No contacts yet.")).toBeInTheDocument()
      expect(container.querySelector('[data-slot="chart"]')).toBeNull()
    },
  )

  it("shows populated data using the selected theme color", () => {
    const { container } = render(
      <CountBarChart data={[{ name: "Lead", count: 3 }]} label="Contacts" color="var(--chart-2)" />,
    )

    expect(container.querySelector('[data-slot="chart"]')).not.toBeNull()
    expect(container.querySelector("style")?.textContent).toContain("--color-count: var(--chart-2)")
    expect(screen.queryByText("No data to show yet.")).not.toBeInTheDocument()
  })
})
