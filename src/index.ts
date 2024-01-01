import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { minifiers } from "./minifiers";
import { benchmarkInfo, renderToHtml } from "./utils";
import { gzipSizeSync } from "gzip-size";
import type { Args, Measurement, Minifier, Result } from "./types";

const runBenchmark = async (args: Args, filenames: string[]) => {
  const data = await getResults(filenames, args.gzip);

  if (data) {
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
  const results = new Map<string, Result>();

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

      const originalSize = gzip ? gzipSizeSync(source) : source.length;
      const efficiency = (measured.size / originalSize) * 100;

      const measurement: Measurement = {
        minifiedSize: measured.size,
        elapsedTime: measured.time,
        efficiency: efficiency.toFixed(1),
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
          originalSize,
          measurements: [measurement],
        });
      }
    }

    const tempResults = results.get(filename)!;

    tempResults.stats = calcStats(tempResults.measurements);

    tempResults.measurements = tempResults.measurements.map((measurement) => {
      const differential =
        measurement.elapsedTime / tempResults.stats!.bestTime;
      return {
        ...measurement,
        differential: differential.toFixed(1),
      };
    });
  }

  return Array.from(results.values());
};

const calcStats = (measurements: Measurement[]) => {
  const allTimes = measurements
    .map((measurement) => measurement.elapsedTime)
    .filter(Boolean);
  const allSizes = measurements
    .map((measurement) => measurement.minifiedSize)
    .filter(Boolean);

  return {
    bestTime: Math.min(...allTimes),
    worstTime: Math.max(...allTimes),
    bestSize: Math.min(...allSizes),
    worstSize: Math.max(...allSizes),
  };
};

const measure = async (source: string, minifier: Minifier, gzip: boolean) => {
  try {
    const start = process.hrtime();
    const minified = await minifier.build(source);
    const [seconds, nanoseconds] = process.hrtime(start);
    const time =
      Math.round((1000 * seconds + nanoseconds / 1_000_000) * 100) / 100;

    return {
      time,
      size: gzip ? gzipSizeSync(minified) : minified.length,
    };
  } catch {
    process.stderr.write(`-- Error while processing with ${minifier.name} \n`);
    return {
      time: 0,
      size: 0,
    };
  }
};

export default runBenchmark;
