import process from "node:process";
import Bun from "bun";
import path from "node:path";
import { getMinifiers } from "./minifiers";
import { benchmarkInfo, bytesToSize, getGzipSize, renderToHtml } from "./utils";
import type {
  Args,
  CssFile,
  CssFileWithContent,
  Measurement,
  MinifierWithVersion,
  Result,
} from "../types";

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

export const getResults = async (cssFiles: CssFile[], gzip: boolean) => {
  // Get minifiers
  const minifiers = await getMinifiers();

  // Read all files and sort them
  const files = await readFiles(cssFiles, gzip);

  // Add delimiter
  process.stderr.write("--- \n");

  // Apply all minifiers to each file
  const results: Result[] = [];

  for (const cssFile of files) {
    process.stderr.write(`Opening ${cssFile.name}\n`);

    const measurements: Measurement[] = [];
    for (const minifier of minifiers) {
      process.stderr.write(`- Processing with ${minifier.name}\n`);

      const measurement = await measure(cssFile, minifier, gzip);
      measurements.push(measurement);
    }

    const stats = calcStats(measurements);

    measurements.forEach((measurement) => {
      const differential = measurement.elapsedTime / stats.bestTime;
      measurement.differential = differential.toFixed(1);
    });

    results.push({
      filename: cssFile.name,
      originalSize: cssFile.size,
      originalSizeLabel: bytesToSize(cssFile.size),
      measurements,
      stats,
    });
  }

  return results;
};

const readFiles = async (cssFiles: CssFile[], gzip: boolean) => {
  const filesPromises = cssFiles.map(async (cssFile) => {
    const payload: CssFileWithContent = {
      ...cssFile,
      content: "",
      size: 0,
    };
    process.stderr.write(`Reading ${cssFile.name}\n`);
    try {
      const sourcePath = path.join("node_modules", cssFile.path);
      payload.content = await Bun.file(sourcePath).text();
      payload.size = gzip
        ? getGzipSize(payload.content)
        : payload.content.length;
      return payload;
    } catch (error: unknown) {
      console.error(
        `- Error reading ${cssFile.name}: ${(error as Error).message}`
      );
      return payload;
    }
  });
  const files = await Promise.all(filesPromises);
  return files
    .filter((cssFile) => cssFile.content)
    .toSorted((a, b) => a.name.localeCompare(b.name));
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

const measure = async (
  cssFile: CssFileWithContent,
  minifier: MinifierWithVersion,
  gzip: boolean
) => {
  const { build, ...minifierInfo } = minifier;

  const measurement: Measurement = {
    minifiedSize: 0,
    minifiedSizeLabel: bytesToSize(0),
    elapsedTime: 0,
    efficiency: "0",
    minifier: minifierInfo,
  };

  try {
    performance.mark("minify-start");
    const minified = await build(cssFile.content);
    performance.mark("minify-end");
    const measured = performance.measure(
      "minify-duration",
      "minify-start",
      "minify-end"
    );

    const minifiedSize = gzip ? getGzipSize(minified) : minified.length;
    const elapsedTime = Math.round(measured.duration * 100) / 100;
    const efficiency = ((minifiedSize / cssFile.size) * 100).toFixed(2);
    measurement.minifiedSize = minifiedSize;
    measurement.minifiedSizeLabel = bytesToSize(minifiedSize);
    measurement.elapsedTime = elapsedTime;
    measurement.efficiency = efficiency;

    return measurement;
  } catch (err: unknown) {
    console.error(`-- ${(err as Error).name}: ${(err as Error).message}`);
    return measurement;
  }
};

export default runBenchmark;
