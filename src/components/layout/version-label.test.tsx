import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VersionLabel } from "./version-label";

describe("VersionLabel", () => {
  it("shows the web and API releases with their commits", () => {
    render(
      <VersionLabel
        web={{ version: "2026.10.19", commit: "a1b2c3d" }}
        api={{ version: "2026.10.19.42", commit: "e4f5a6b7c8d9" }}
      />,
    );

    expect(screen.getByText("Web v2026.10.19 (a1b2c3d)")).toBeInTheDocument();
    expect(screen.getByText("API v2026.10.19.42 (e4f5a6b)")).toBeInTheDocument();
  });

  it("says so when the API cannot be reached, and omits a missing commit", () => {
    render(<VersionLabel web={{ version: "dev", commit: "" }} api={null} />);

    expect(screen.getByText("Web dev")).toBeInTheDocument();
    expect(screen.getByText("API unavailable")).toBeInTheDocument();
  });
});
