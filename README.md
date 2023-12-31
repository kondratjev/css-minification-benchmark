[![Build Status](https://github.com/kondratjev/css-minification-benchmark/workflows/CI/badge.svg)](https://github.com/kondratjev/css-minification-benchmark/actions?workflow=CI)

## What is css-minification-benchmark?

A comparison of modern CSS minification engines.

## FAQ

### Which engines are covered?

* [lightningcss](https://github.com/parcel-bundler/lightningcss)
* [esbuild](https://github.com/evanw/esbuild)
* [dart-sass](https://github.com/sass/dart-sass)
* [csso](https://github.com/css/csso)
* [cssnano](https://github.com/cssnano/cssnano)
* [clean-css](https://github.com/clean-css/clean-css)
* [uglifycss](https://github.com/fmarcia/uglifycss)

### How can I see the results?

Clone the repository, install the dependencies with `bun install` and then run `bun run bench`. That's it!

If you prefer to see results without cloning the repo here are [the most recent ones](https://kondratjev.github.io/css-minification-benchmark/).

### How can I generate the html report?

Just run `bun run bench-html`

### How can I test my CSS file?

Just install them using the package manager, then add the path to them in `bin/bench.ts` to the `input` array and re-run the benchmark.

### How can I add a new minifier to the list?

* add it to `package.json` as a `dependency`
* run `bun install`
* require it in `src/minifiers.ts` and add it to `minifiers` array
* run `bun run bench`
* add it to this file in "Which engines are covered?" section above
* send a PR (if you wish to have it included)

### Can I get the compressed gzip size as well?

Run `bun run bench-gzip` or `bun run bench-html-gzip` to measure the gzip size instead of the regular file size.

## License

css-minification-benchmark is released under the [MIT License](https://github.com/kondratjev/css-minification-benchmark/blob/master/LICENSE).
