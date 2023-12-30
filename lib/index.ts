import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { save, get, total } from "./storage";
import { getActive, measure as _measure } from "./minify";

const bench = async (args, input, output) => {
  // ARGUMENTS
  const { only, gzip: measureGzip } = args;

  // RUN BENCHMARK
  const activeMinifiers = await getActive(only);
  const processedFiles = {};

  const measure = async (filename, minifier, source) => {
    try {
      const stats = await _measure(minifier.name, source, measureGzip);
      processedFiles[filename].gzip = stats.originalgzip;
      save(filename, minifier.name, stats);
      process.stderr.write(".");
    } catch (err) {
      save(filename, minifier.name, { label: "error" });
      process.stderr.write("F");
      console.error(err);
    }
  };

  const benchmark = async (filename) => {
    if (!filename.endsWith(".css")) {
      return;
    }

    const source = await fs.readFile(path.join("node_modules", filename), "utf8");
    processedFiles[filename] = {
      size: source.length,
    };

    for (const minifier of activeMinifiers) {
      await measure(filename, minifier, source);
    }

    for (const minifier of activeMinifiers) {
      minifier.results[filename] = get(filename, minifier.name);
    }
  };

  for (const filename of input) {
    await benchmark(filename);
  }

  process.stderr.write("\n");

  for (const minifier of activeMinifiers) {
    minifier.total = total(minifier.name);
  }

  output(processedFiles, activeMinifiers);
};

export default bench;
