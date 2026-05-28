import * as esbuild from "esbuild";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const rootDir = path.resolve(import.meta.dirname, "..");
const distDir = path.join(rootDir, "dist");

// Clean previous build
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}

// 1. Build the React client with Vite
console.log("Building client...");
execSync("npx vite build", {
  cwd: rootDir,
  stdio: "inherit",
  env: { ...process.env, NODE_ENV: "production" },
});

// 2. Bundle the server with esbuild
console.log("Building server...");

// Read package.json to get all dependency names for externalizing
const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf-8"));
const allDeps = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
  ...Object.keys(pkg.optionalDependencies || {}),
];

await esbuild.build({
  entryPoints: [path.join(rootDir, "server", "index.ts")],
  outfile: path.join(distDir, "index.cjs"),
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  sourcemap: true,
  // Externalize all node_modules — they'll be available at runtime via node_modules/
  // Also exclude the dev-only vite integration (only used when NODE_ENV !== production)
  external: [...allDeps, "../vite.config"],
  define: {
    "import.meta.dirname": "__dirname",
    "import.meta.filename": "__filename",
  },
});

console.log("Build complete.");
console.log(`  Client: ${distDir}/public/`);
console.log(`  Server: ${distDir}/index.cjs`);
