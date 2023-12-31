import { Buffer } from "node:buffer";

import CleanCSS from "clean-css";
import cssnano from "cssnano";
import * as csso from "csso";
import esbuild from "esbuild";
import * as lightningCss from "lightningcss";
import * as sass from "sass";
import uglifycss from "uglifycss";
import type { Minifier } from "./types";

export const minifiers: Minifier[] = [
  {
    name: "lightningcss",
    version: "1.22.1",
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
    version: "0.19.11",
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
    name: "dart-sass",
    version: "1.69.6",
    url: "https://github.com/sass/dart-sass",
    build: async (source: string) => {
      return sass.compileString(source, { style: "compressed" }).css;
    },
  },
  {
    name: "csso",
    version: "5.0.5",
    url: "https://github.com/css/csso",
    build: async (source: string) => {
      return csso.minify(source).css;
    },
  },
  {
    name: "cssnano",
    version: "6.0.2",
    url: "https://github.com/cssnano/cssnano",
    build: async (source: string) => {
      const result = await cssnano().process(source, {
        from: undefined,
      });
      return result.css;
    },
  },
  {
    name: "clean-css",
    version: "5.3.3",
    url: "https://github.com/clean-css/clean-css",
    build: async (source: string) => {
      return new CleanCSS({ level: 2 }).minify(source).styles;
    },
  },
  {
    name: "uglifycss",
    version: "0.0.29",
    url: "https://github.com/fmarcia/uglifycss",
    build: async (source: string) => {
      return uglifycss.processString(source);
    },
  },
];
