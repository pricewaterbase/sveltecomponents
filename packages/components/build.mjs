import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(fileURLToPath(import.meta.url));
const sourceRoot = resolve(
  packageRoot,
  "../../supersvelte/src/components",
);
const outputRoot = resolve(packageRoot, "dist");
const componentDirectories = [
  "button",
  "date-picker",
  "empty-message",
  "markdown",
  "menu",
  "popover",
  "segmented-control",
];
const exports = [
  ["Button", "./components/button/Button.svelte"],
  ["ButtonLink", "./components/button/ButtonLink.svelte"],
  ["CopyButton", "./components/button/CopyButton.svelte"],
  ["DatePicker", "./components/date-picker/DatePicker.svelte"],
  ["EmptyMessage", "./components/empty-message/EmptyMessage.svelte"],
  ["Markdown", "./components/markdown/Markdown.svelte"],
  ["MathMarkdown", "./components/markdown/MathMarkdown.svelte"],
  ["Menu", "./components/menu/Menu.svelte"],
  ["Popover", "./components/popover/Popover.svelte"],
  [
    "SegmentedControl",
    "./components/segmented-control/SegmentedControl.svelte",
  ],
  [
    "ThemeSegmentedControl",
    "./components/segmented-control/ThemeSegmentedControl.svelte",
  ],
];

for (const [, componentPath] of exports) {
  const sourcePath = componentPath.replace(/^\.\/components\//, "");
  await readFile(resolve(sourceRoot, sourcePath), "utf8");
}
await rm(outputRoot, { recursive: true, force: true });
await mkdir(resolve(outputRoot, "components"), { recursive: true });

for (const directory of componentDirectories) {
  await cp(
    resolve(sourceRoot, directory),
    resolve(outputRoot, "components", directory),
    {
      recursive: true,
    },
  );
}

const entrypoint = exports
  .map(([name, path]) => `export { default as ${name} } from '${path}';`)
  .join("\n");
const declarations = [
  `import type { Component } from 'svelte';`,
  ...exports.map(([name]) => `export declare const ${name}: Component<any>;`),
  "",
].join("\n");

await writeFile(resolve(outputRoot, "index.js"), `${entrypoint}\n`);
await writeFile(resolve(outputRoot, "index.d.ts"), declarations);
console.info(
  `Built @pricewaterbase/components with ${exports.length} exports.`,
);
