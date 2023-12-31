import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { minifiers, type Minifier } from "./minifiers";
import { benchmarkInfo, renderToHtml } from "./utils";
import { gzipSizeSync } from "gzip-size";

interface Args {
  asHtml: boolean;
  gzip: boolean;
}

interface Measurement {
  minifier: Omit<Minifier, "build">;
  minifiedSize: number;
  differential?: string;
  efficiency: string;
  elapsedTime: number;
}

interface TotalResult {
  filename: string;
  originalSize: number;
  measurements: Measurement[];
  stats: {
    bestTime?: number;
    worstTime?: number;
    bestSize?: number;
    worstSize?: number;
  };
}

const runBenchmark = async (args: Args, filenames: string[]) => {
  const results = await getResults(filenames, args.gzip);

  if (results) {
    const data = Array.from(results.values());
    if (args.asHtml) {
      await renderToHtml("templates/index.ejs", {
        data,
        info: benchmarkInfo,
      });
    } else {
      await fs.writeFile("docs/result.json", JSON.stringify(data), "utf8");
    }

    process.stderr.write("Successfully done!");
  } else {
    process.stderr.write("Something went wrong");
  }
};

const getResults = async (filenames: string[], gzip: boolean) => {
  const results = new Map<string, TotalResult>();

  for (const filename of filenames) {
    if (!filename.endsWith(".css")) {
      return;
    }

    process.stderr.write(`Reading ${filename} \n`);

    const source = await fs.readFile(
      path.join("node_modules", filename),
      "utf8"
    );

    for (const minifier of minifiers) {
      process.stderr.write(`- Processing with ${minifier.name} \n`);

      const measured = await measure(source, minifier, gzip);

      const measurement: Measurement = {
        minifiedSize: measured.size,
        elapsedTime: measured.time,
        efficiency: ((measured.size / source.length) * 100).toFixed(1),
        minifier: {
          name: minifier.name,
          version: minifier.version,
          url: minifier.url,
        },
      };

      if (results.has(filename)) {
        results.get(filename)?.measurements.push(measurement);
      } else {
        results.set(filename, {
          filename,
          originalSize: gzip ? gzipSizeSync(source) : source.length,
          measurements: [measurement],
          stats: {},
        });
      }
    }

    const tempResults = results.get(filename);
    if (!tempResults) {
      return;
    }

    tempResults.stats = calcStats(tempResults.measurements);

    tempResults.measurements.forEach((measurement) => {
      measurement.differential = (
        measurement.elapsedTime / tempResults.stats.bestTime!
      ).toFixed(1);
    });
  }

  return results;
};

const calcStats = (results: Measurement[]) => {
  const allTimes = results.map((item) => item.elapsedTime);
  const allSizes = results.map((item) => item.minifiedSize);

  return {
    bestTime: Math.min(...allTimes),
    worstTime: Math.max(...allTimes),
    bestSize: Math.min(...allSizes),
    worstSize: Math.max(...allSizes),
  };
};

const measure = async (source: string, minifier: Minifier, gzip: boolean) => {
  const start = process.hrtime();
  const minified = await minifier.build(source);
  const [seconds, nanoseconds] = process.hrtime(start);
  const time =
    Math.round((1000 * seconds + nanoseconds / 1_000_000) * 100) / 100;

  return {
    time,
    size: gzip ? gzipSizeSync(minified) : minified.length,
  };
};

export default runBenchmark;
