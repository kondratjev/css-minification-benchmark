import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import buffer from "node:buffer";

import CleanCSS from "clean-css";
import cssnano from "cssnano";
import { minify as csso } from "csso";
import gzipSize from "gzip-size";
import esbuild from "esbuild";
import { transform as lightningCss } from "lightningcss";
import * as sass from "sass";

// MINIFIERS
const minifiers = {
  lightningcss: (source: string) => {
    return lightningCss({
      filename: "",
      code: buffer.Buffer.from(source),
      minify: true,
    }).code;
  },
  esbuild: async (source: string) => {
    const result = await esbuild.transform(source, {
      loader: "css",
      minify: true,
    });
    return result.code;
  },
  sass: async (source: string) => {
    return sass.compileString(source, { style: "compressed" }).css;
  },
  csso: (source: string) => {
    return csso(source).css;
  },
  "csso (restructure off)": (source: string) => {
    return csso(source, { restructure: false }).css;
  },
  cssnano: async (source: string) => {
    const result = await cssnano({ preset: "default" }).process(source, {
      from: undefined,
    });
    return result.css;
  },
  "cssnano (advanced)": async (source: string) => {
    const result = await cssnano({ preset: "advanced" }).process(source, {
      from: undefined,
    });
    return result.css;
  },
  "clean-css": (source: string) => {
    return new CleanCSS().minify(source).styles;
  },
  "clean-css (level 2)": async (source: string) => {
    return new CleanCSS({ level: 2 }).minify(source).styles;
  },
};

const gzippedSize = {};

const getMinifierInfo = async (name: string) => {
  const packageName = name.split(" ")[0];
  const packageContent = await fs.readFile(
    path.join("node_modules", packageName, "package.json"),
    "utf8"
  );
  const packageDefinition = JSON.parse(packageContent);
  let url;

  if (packageDefinition.repository && packageDefinition.repository.url) {
    url = packageDefinition.repository.url
      .replace(/^git:\/\/|^git\+https:\/\/|^git\+ssh:\/\/git@/, "https://")
      .replace(/\.git$/, "");
  }

  if (!url) {
    url = packageDefinition.homepage;
  }

  const { version } = packageDefinition;

  return {
    name,
    version,
    url,
    results: {},
  };
};

const getActive = async (only: RegExp) => {
  const activeMinifiers = [];

  for (const name in minifiers) {
    if (only.test(name)) {
      const info = await getMinifierInfo(name);
      activeMinifiers.push(info);
    }
  }

  return activeMinifiers;
};

const measure = async (minifierName: string, source: string, gzip: boolean) => {
  const start = process.hrtime();
  const minified = await minifiers[minifierName](source);
  const [seconds, nanoseconds] = process.hrtime(start);
  const time =
    Math.round((1000 * seconds + nanoseconds / 1_000_000) * 100) / 100;

  if (gzip && !gzippedSize[source]) {
    gzippedSize[source] = gzipSize.sync(source);
  }

  return {
    time,
    size: minified.length,
    gzip: gzip ? gzipSize.sync(minified) : Number.NaN,
    originalsize: source.length,
    originalgzip: gzippedSize[source],
  };
};

export { getActive, measure };
