import { defineConfig } from "tsup"

export default defineConfig({
  entry: { index: "src/bin.ts", cli: "src/cli.ts" },
  format: ["esm"],
  target: "node22",
  clean: true,
  splitting: false,
  external: ["./cli.js", "@kud/macos-media-keys", "playwright"],
  banner: { js: "#!/usr/bin/env node" },
})
