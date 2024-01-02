import process from "node:process";
import Bun from "bun";
import { minifiers } from "./minifiers";
import { benchmarkInfo, bytesToSize, getGzipSize, renderToHtml } from "./utils";
import type { Args, CssFile, Measurement, Minifier, Result } from "../types";

const runBenchmark = async (args: Args, cssFiles: CssFile[]) => {
  const data = await getResults(cssFiles, args.gzip);

  if (data.length) {
    if (args.asHtml) {
      await renderToHtml("./templates/index.ejs", {
        data,
        info: benchmarkInfo,
      });
    } else {
      await Bun.write("./docs/result.json", JSON.stringify(data));
    }

    process.stderr.write("Successfully done!");
  } else {
    process.stderr.write("Something went wrong");
  }
};

const getResults = async (
  cssFiles: CssFile[],
  gzip: boolean
): Promise<Result[]> => {
  const results = new Map<string, Result>();

  cssFiles.sort((a, b) => a.name.localeCompare(b.name));

  for (const cssFile of cssFiles) {
    if (!cssFile.path.endsWith(".css")) {
      console.error(`Error reading ${cssFile.name}: The file should be CSS`);
      continue;
    }

    process.stderr.write(`Reading ${cssFile.name}\n`);

    try {
      const sourcePath = await Bun.resolve(cssFile.path, "node_modules");
      const source = await Bun.file(sourcePath).text();

      const originalSize = gzip ? getGzipSize(source) : source.length;

      for (const minifier of minifiers) {
        process.stderr.write(`- Processing with ${minifier.name}\n`);

        const measured = await measure(source, minifier, gzip);

        const efficiency = ((measured.size / originalSize) * 100).toFixed(2);

        const measurement: Measurement = {
          minifiedSize: measured.size,
          minifiedSizeLabel: bytesToSize(measured.size),
          elapsedTime: measured.time,
          efficiency,
          minifier: {
            name: minifier.name,
            version: minifier.version,
            url: minifier.url,
            description: minifier.description,
          },
        };

        const root = results.get(cssFile.path) ?? {
          filename: cssFile.name,
          originalSize,
          originalSizeLabel: bytesToSize(originalSize),
          measurements: [],
        };
        root.measurements.push(measurement);
        results.set(cssFile.path, root);
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
    } catch (error) {
      console.error(
        `- Error reading ${cssFile.name}: ${(error as Error).message}`
      );
    }
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
    const start = Bun.nanoseconds();
    const minified = await minifier.build(source);
    const nanoseconds = Bun.nanoseconds() - start;
    const time = Math.round((nanoseconds / 1_000_000) * 100) / 100;

    return {
      time,
      size: gzip ? getGzipSize(minified) : minified.length,
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
