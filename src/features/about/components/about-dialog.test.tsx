import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithUser } from "@/test/render";
import type { Changelog } from "../data";
import { AboutDialog } from "./about-dialog";

const versions = {
  web: { version: "2026.10.20", commit: "a1b2c3d4e5" },
  api: { version: "2026.10.19.42", commit: "e4f5a6b7c8d9" },
};

const changelog: Changelog = {
  web: [
    {
      date: "2026-10-20",
      changes: ["UI: Restyle toast notifications with a neutral surface and state rail"],
    },
  ],
  api: [{ date: "2026-10-19", changes: ["Health: Publish the deployed version and commit"] }],
};

describe("AboutDialog", () => {
  it("describes the app, its developer and both releases", () => {
    renderWithUser(
      <AboutDialog open onOpenChange={() => {}} versions={versions} changelog={changelog} />,
    );

    expect(screen.getByRole("heading", { name: "Auto CRM" })).toBeInTheDocument();
    expect(screen.getByText("Kusuma J.")).toBeInTheDocument();
    expect(screen.getByText("v2026.10.20")).toBeInTheDocument();
    expect(screen.getByText("v2026.10.19.42")).toBeInTheDocument();
    expect(screen.getByText("a1b2c3d")).toBeInTheDocument();
  });

  it("says so when the API cannot be reached", () => {
    renderWithUser(
      <AboutDialog
        open
        onOpenChange={() => {}}
        versions={{ web: { version: "dev", commit: "" }, api: null }}
        changelog={changelog}
      />,
    );

    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(screen.getByText("Health check failed")).toBeInTheDocument();
  });

  it("switches between the web and API changelogs", async () => {
    const { user } = renderWithUser(
      <AboutDialog open onOpenChange={() => {}} versions={versions} changelog={changelog} />,
    );

    expect(
      screen.getByText("UI: Restyle toast notifications with a neutral surface and state rail"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "API" }));

    expect(screen.getByText("Health: Publish the deployed version and commit")).toBeInTheDocument();
  });
});
