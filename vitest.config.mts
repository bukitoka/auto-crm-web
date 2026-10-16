import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Two projects so each file runs in the right environment: `*.test.ts` in node
 * (lib, Server Actions, api fetchers, schemas, proxy) and `*.test.tsx` in jsdom
 * (client components and hooks).
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    // `@/…` imports, same as tsconfig.json `paths`.
    tsconfigPaths: true,
  },
  test: {
    setupFiles: ["./src/test/setup.ts"],
    // Fixed API base URL so request assertions don't depend on your .env files.
    env: { API_URL: "http://api.test/api/v1" },
    // Reset `vi.fn()` call history (and mockResolvedValue etc.) before every test.
    mockReset: true,
    unstubGlobals: true,
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: ["src/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "dom",
          environment: "jsdom",
          include: ["src/**/*.test.tsx"],
          setupFiles: ["./src/test/setup-dom.ts"],
        },
      },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/test/**",
        "src/components/ui/**", // shadcn generated
        "src/app/**", // route files (pages, layouts) are covered by E2E, not unit tests
        "src/**/types.ts", // type-only modules
        "src/hooks/use-mobile.ts", // shadcn generated
      ],
      thresholds: {
        // Whole project, UI components included (they have a lower bar).
        lines: 65,
        statements: 65,
        functions: 60,
        branches: 55,
        // Logic (lib, proxy, schemas, Server Actions, api fetchers) stays close to 100%.
        "src/lib/**": { lines: 95, statements: 95, functions: 95, branches: 90 },
        "src/proxy.ts": { lines: 95, statements: 95, functions: 95, branches: 90 },
        "src/features/**/{schemas,actions,api}.ts": {
          lines: 95,
          statements: 95,
          functions: 95,
          branches: 90,
        },
      },
    },
  },
});
