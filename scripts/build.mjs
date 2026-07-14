import { build, context } from "esbuild";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const options = {
  entryPoints: [resolve(root, "src/main.js")],
  bundle: true,
  minify: true,
  format: "cjs",
  platform: "node",
  target: "es2018",
  external: ["obsidian"],
  outfile: resolve(root, "main.js"),
  legalComments: "none"
};

if (process.argv.includes("--watch")) {
  const buildContext = await context(options);
  await buildContext.watch();
  console.log("Watching graph-node-preview sources…");
} else {
  await build(options);
}
