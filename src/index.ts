import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { minifiers } from "./minifiers";
import { benchmarkInfo, bytesToSize, renderToHtml } from "./utils";
import { gzipSizeSync } from "gzip-size";
import type { Args, CssFile, Measurement, Minifier, Result } from "../types";

const runBenchmark = async (args: Args, cssFiles: CssFile[]) => {
  cssFiles.sort((a, b) => a.name.localeCompare(b.name));

  const data = await getResults(cssFiles, args.gzip);

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

const getResults = async (cssFiles: CssFile[], gzip: boolean) => {
  const results = new Map<string, Result>();

  for (const cssFile of cssFiles) {
    if (!cssFile.path.endsWith(".css")) {
      return;
    }

    process.stderr.write(`Reading ${cssFile.name} \n`);

    const source = await fs.readFile(
      path.join("node_modules", cssFile.path),
      "utf8"
    );

    for (const minifier of minifiers) {
      process.stderr.write(`- Processing with ${minifier.name} \n`);

      const measured = await measure(source, minifier, gzip);

      const originalSize = gzip ? gzipSizeSync(source) : source.length;
      const efficiency = (measured.size / originalSize) * 100;

      const measurement: Measurement = {
        minifiedSize: measured.size,
        minifiedSizeLabel: bytesToSize(measured.size),
        elapsedTime: measured.time,
        efficiency: efficiency.toFixed(2),
        minifier: {
          name: minifier.name,
          version: minifier.version,
          url: minifier.url,
          description: minifier.description,
        },
      };

      if (results.has(cssFile.path)) {
        results.get(cssFile.path)?.measurements.push(measurement);
      } else {
        results.set(cssFile.path, {
          filename: cssFile.name,
          originalSize,
          originalSizeLabel: bytesToSize(originalSize),
          measurements: [measurement],
        });
      }
    }

    const tempResults = results.get(cssFile.path)!;

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
  } catch (err: unknown) {
    console.error(`-- ${(err as Error).name}: ${(err as Error).message}`);
    return {
      time: 0,
      size: 0,
    };
  }
};

export default runBenchmark;
