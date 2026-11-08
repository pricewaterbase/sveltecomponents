import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(fileURLToPath(import.meta.url));
const sourcePath = resolve(
  packageRoot,
  "../../supersvelte/server/data/icons.json",
);
const outputPath = resolve(packageRoot, "dist");
const icons = JSON.parse(await readFile(sourcePath, "utf8"));

if (!Array.isArray(icons) || icons.length === 0) {
  throw new Error(`Icon catalog is missing or empty: ${sourcePath}`);
}

const names = new Set();
for (const icon of icons) {
  if (
    typeof icon.name !== "string" ||
    typeof icon.svg !== "string" ||
    names.has(icon.name)
  ) {
    throw new Error(
      `Invalid or duplicate icon in catalog: ${icon.name ?? "<unnamed>"}`,
    );
  }
  names.add(icon.name);
}

await rm(outputPath, { recursive: true, force: true });
await mkdir(outputPath, { recursive: true });
await writeFile(
  resolve(outputPath, "icons.json"),
  `${JSON.stringify(icons)}\n`,
);
await writeFile(
  resolve(outputPath, "index.js"),
  `const icons = Object.freeze(${JSON.stringify(icons)});\n` +
    `const iconsByName = new Map(icons.map((icon) => [icon.name, icon]));\n` +
    `const iconNames = Object.freeze(icons.map((icon) => icon.name));\n` +
    `function getIcon(name) { return iconsByName.get(name); }\n` +
    `export { icons, iconNames, getIcon };\n`,
);
await writeFile(
  resolve(outputPath, "index.d.ts"),
  `export interface Icon { readonly name: string; readonly svg: string; }\n` +
    `export declare const icons: readonly Icon[];\n` +
    `export declare const iconNames: readonly string[];\n` +
    `export declare function getIcon(name: string): Icon | undefined;\n`,
);

console.info(`Built @pricewaterbase/icons with ${icons.length} icons.`);
