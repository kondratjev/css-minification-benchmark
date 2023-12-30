import process from "node:process";
import { processOutput } from "../lib/process-output.js";
import bench from "../lib/index.js";
import "purecss/build/pure.css";

// ARGUMENTS
const only = process.argv.includes("--only")
  ? new RegExp(
      `.*(${process.argv[process.argv.indexOf("--only") + 1].replace(
        /,/g,
        "|"
      )}).*`
    )
  : /.+/;
const asHTML = process.argv.includes("--html");
const gzip = process.argv.includes("--gzip");
const output = processOutput(asHTML, gzip);

// const input = await Promise.all(
//   filePaths.map((filePath) => {
//     const fullPath = path.join("node_modules", filePath);
//     return fs.readFile(fullPath, { encoding: "utf8" });
//   })
// );

const input = [
  "@fortawesome/fontawesome-free/css/all.css",
  "bootstrap/dist/css/bootstrap-grid.css",
  "bootstrap/dist/css/bootstrap-reboot.css",
  "bootstrap/dist/css/bootstrap.css",
  "normalize.css/normalize.css",
  "animate.css/animate.css",
  "sanitize.css/sanitize.css",
  "purecss/build/pure.css",
].sort();

await bench({ only, asHTML, gzip }, input, output);
