import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node20",
  clean: true,
  splitting: false,
  external: ["@kud/macos-media-keys", "playwright"],
  banner: { js: "#!/usr/bin/env node" },
})
