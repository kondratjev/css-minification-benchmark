import process from "node:process";
import runBenchmark from "../src/index.ts";
import type { CssFile } from "../types";

// Arguments
const asHtml = process.argv.includes("--asHtml");
const gzip = process.argv.includes("--gzip");

// Input css files
const input: CssFile[] = [
  {
    name: "Font Awesome All",
    path: "@fortawesome/fontawesome-free/css/all.css",
  },
  {
    name: "Bootstrap",
    path: "bootstrap/dist/css/bootstrap.css",
  },
  {
    name: "Normalize",
    path: "normalize.css/normalize.css",
  },
  {
    name: "Animate",
    path: "animate.css/animate.css",
  },
  {
    name: "Sanitize",
    path: "sanitize.css/sanitize.css",
  },
  {
    name: "Pure",
    path: "purecss/build/pure.css",
  },
  {
    name: "Materialize",
    path: "@materializecss/materialize/dist/css/materialize.css",
  },
  {
    name: "Magic",
    path: "magic.css/dist/magic.css",
  },
  {
    name: "Bulma",
    path: "bulma/css/bulma.css",
  },
  {
    name: "UIKit",
    path: "uikit/dist/css/uikit.css",
  },
  {
    name: "Foundation",
    path: "foundation-sites/dist/css/foundation.css",
  },
  {
    name: "Semantic UI",
    path: "semantic-ui/dist/semantic.css",
  },
  {
    name: "Tachyons",
    path: "tachyons/css/tachyons.css",
  },
  {
    name: "Milligram",
    path: "milligram/dist/milligram.css",
  },
  {
    name: "Spectre",
    path: "spectre.css/dist/spectre.css",
  },
].sort();

await runBenchmark({ asHtml, gzip }, input);
