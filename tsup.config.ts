import { defineConfig } from "tsup";

export default defineConfig({
  target: "esnext",
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
});
