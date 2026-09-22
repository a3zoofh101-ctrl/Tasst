import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      // The real "server-only" package always throws outside Next's
      // webpack build (which resolves it to a no-op via the
      // "react-server" export condition). Alias it to a no-op here too.
      "server-only": new URL("./tests/helpers/server-only-stub.ts", import.meta.url).pathname
    }
  },
  test: {
    environment: "node",
    globalSetup: ["./vitest.global-setup.ts"],
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/**/*.test.ts"],
    testTimeout: 20000,
    hookTimeout: 20000,
    fileParallelism: false
  }
});
