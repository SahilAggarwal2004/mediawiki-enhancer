import { defineManifest } from "@crxjs/vite-plugin";
import packageJson from "./package.json";

const { version } = packageJson;

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch] = version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, "")
  // split into version parts
  .split(/[.-]/);

const icons = {
  "16": "icons/16.png",
  "24": "icons/24.png",
  "32": "icons/32.png",
  "128": "icons/128.png",
} as const;

export default defineManifest({
  manifest_version: 3,
  name: "MediaWiki Enhancer",
  version: `${major}.${minor}.${patch}`,
  // semver is OK in "version_name"
  version_name: version,
  description: "A browser extension that improves the user experience on MediaWiki powered websites with helpful enhancements",
  icons,
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*"],
      js: ["src/script.ts"],
      run_at: "document_start",
    },
  ],
});
