import process from "node:process";
import { table } from "table";
import htmlTable from "./html/html-table";
import formatRow from "./html/format-row";
import benchmarkInfo from "./html/benchmark-info";

const write = (
  processedFiles,
  activeMinifiers,
  asHTML,
  measureGzip,
  filter
) => {
  if (!asHTML) {
    process.stdout.write("\n");
  }

  const data = [...activeMinifiers].map((minifier) => {
    if (asHTML && minifier.url) {
      return `<a href="${minifier.url}" target="_blank">${minifier.name} - ${minifier.version}</a>`;
    }

    return `${minifier.name} - ${minifier.version}`;
  });

  // this is needed for the table's first `th`
  data.unshift("File");

  const results = asHTML ? htmlTable({ data }) : [data];
  let totalLength = 0;

  for (const filename of Object.keys(processedFiles)) {
    const fileSizeKey = filter === "gzip" ? "gzip" : "size";
    const fileSize = processedFiles[filename][fileSizeKey];
    const size = asHTML
      ? `<br /><span class="badge bg-secondary">${fileSize} bytes (100%)</span>`
      : ` - ${fileSize} bytes`;

    totalLength += fileSize;

    const row = [filename + size];

    for (const minifier of activeMinifiers) {
      row.push(
        formatRow(asHTML, minifier.results[filename], measureGzip, filter)
      );
    }

    results.push(row);
  }

  const totalRow = [
    `${
      asHTML
        ? `<span class="text-uppercase fw-bold">Total</span><br /><span class="badge bg-secondary">${totalLength} bytes (100%)</span>`
        : `TOTAL - ${totalLength} bytes`
    }`,
  ];

  for (const minifier of activeMinifiers) {
    totalRow.push(formatRow(asHTML, minifier.total, measureGzip, filter));
  }

  results.push(totalRow);

  if (asHTML) {
    process.stdout.write(results.toString());
  } else {
    process.stdout.write(table(results));
    process.stdout.write(`\n${benchmarkInfo}`);
  }

  process.stdout.write("\n");
};

const processOutput = (asHTML, measureGzip) => {
  return (files, results) => {
    write(files, results, asHTML, measureGzip, measureGzip ? "gzip" : "size");
  };
};

export { processOutput };
