import { crx } from "@crxjs/vite-plugin";
import { defineConfig } from "vite";
import zip from "vite-plugin-zip-pack";

import manifest from "./manifest.config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [crx({ manifest }), zip({ outDir: "release", outFileName: "release.zip" })],
  server: { port: 3000, cors: { origin: [/chrome-extension:\/\//] } },
});
