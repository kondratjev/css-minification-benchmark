import process from "node:process";
import runBenchmark from "../src/index.js";

// Arguments
const asHtml = process.argv.includes("--asHtml");
const gzip = process.argv.includes("--gzip");

// Input css files
const input = [
  "@fortawesome/fontawesome-free/css/all.css",
  "bootstrap/dist/css/bootstrap-grid.css",
  "bootstrap/dist/css/bootstrap-reboot.css",
  "bootstrap/dist/css/bootstrap.css",
  "normalize.css/normalize.css",
  "animate.css/animate.css",
  "sanitize.css/sanitize.css",
  "purecss/build/pure.css",
  "@materializecss/materialize/dist/css/materialize.css",
  "magic.css/dist/magic.css",
  "bulma/css/bulma.css",
  "uikit/dist/css/uikit.css"
].sort();

await runBenchmark({ asHtml, gzip }, input);
