import process from "node:process";
import runBenchmark from "../lib";
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
    name: "Bootstrap 5",
    path: "bootstrap/dist/css/bootstrap.css",
  },
  {
    name: "Normalize.css",
    path: "normalize.css/normalize.css",
  },
  {
    name: "Animate.css",
    path: "animate.css/animate.css",
  },
  {
    name: "Sanitize.css",
    path: "sanitize.css/sanitize.css",
  },
  {
    name: "Pure.css",
    path: "purecss/build/pure.css",
  },
  {
    name: "Materialize.css",
    path: "@materializecss/materialize/dist/css/materialize.css",
  },
  {
    name: "Magic.css",
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
  { name: "Fomantic UI", path: "fomantic-ui/dist/semantic.css" },
  {
    name: "Tachyons",
    path: "tachyons/css/tachyons.css",
  },
  {
    name: "Milligram",
    path: "milligram/dist/milligram.css",
  },
  {
    name: "Spectre.css",
    path: "spectre.css/dist/spectre.css",
  },
];

await runBenchmark({ asHtml, gzip }, input);
