// build.ts
// to use: bun run build.ts
import { SveltePlugin } from "bun-plugin-svelte";

Bun.build({
  entrypoints: ["src/index.ts"],
  outdir: "dist",
  target: "browser",
  sourcemap: true, // sourcemaps not yet supported
  plugins: [
    SveltePlugin({
      development: true, // turn off for prod builds. Defaults to false
    }),
  ],
});