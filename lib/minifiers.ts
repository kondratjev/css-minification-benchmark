import { Buffer } from "node:buffer";

import CleanCSS from "clean-css";
import cssnano from "cssnano";
import * as csso from "csso";
import esbuild from "esbuild";
import * as lightningCss from "lightningcss";
import * as sass from "sass";
import type { Minifier, MinifierWithVersion } from "../types";
import { getMinifierVersion } from "./utils";

const minifiers: Minifier[] = [
  {
    name: "lightningcss",
    url: "https://github.com/parcel-bundler/lightningcss",
    build: async (source: string) => {
      return lightningCss
        .transform({
          filename: "",
          code: Buffer.from(source),
          minify: true,
        })
        .code.toString();
    },
  },
  {
    name: "esbuild",
    url: "https://github.com/evanw/esbuild",
    build: async (source: string) => {
      const result = await esbuild.transform(source, {
        loader: "css",
        minify: true,
      });
      return result.code;
    },
  },
  {
    name: "sass",
    url: "https://github.com/sass/dart-sass",
    build: async (source: string) => {
      return sass.compileString(source, { style: "compressed" }).css;
    },
  },
  {
    name: "csso",
    url: "https://github.com/css/csso",
    build: async (source: string) => {
      return csso.minify(source).css;
    },
  },
  {
    name: "csso",
    description: "restructure off",
    url: "https://github.com/css/csso",
    build: async (source: string) => {
      return csso.minify(source, { restructure: false }).css;
    },
  },
  {
    name: "cssnano",
    url: "https://github.com/cssnano/cssnano",
    build: async (source: string) => {
      const result = await cssnano().process(source, {
        from: undefined,
      });
      return result.css;
    },
  },
  {
    name: "cssnano",
    description: "advanced, unsafe",
    url: "https://github.com/cssnano/cssnano",
    build: async (source: string) => {
      const result = await cssnano({ preset: "advanced" }).process(source, {
        from: undefined,
      });
      return result.css;
    },
  },
  {
    name: "clean-css",
    description: "level 2",
    url: "https://github.com/clean-css/clean-css",
    build: async (source: string) => {
      return new CleanCSS({ level: 2 }).minify(source).styles;
    },
  },
  {
    name: "clean-css",
    description: "level 2, all rules",
    url: "https://github.com/clean-css/clean-css",
    build: async (source: string) => {
      return new CleanCSS({ level: { 2: { all: true } } }).minify(source)
        .styles;
    },
  },
];

export const getMinifiers = (): Promise<MinifierWithVersion[]> => {
  const minifiersPromises = minifiers.map(async (minifier) => ({
    ...minifier,
    version: await getMinifierVersion(minifier.name),
  }));
  return Promise.all(minifiersPromises);
};
