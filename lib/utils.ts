import os from "node:os";
import Bun from "bun";
import ejs from "ejs";
import fs from "node:fs/promises";
import path from "node:path";

export const benchmarkInfo = {
  date: new Date().toUTCString(),
  cpu: os.cpus()[0].model,
  os: `${os.type()} ${os.arch()} ${os.release()}`,
  bun: Bun.version,
};

export const renderToHtml = async (
  template: string,
  data: Record<string, any>
) => {
  const templatePath = path.resolve(import.meta.dir, template);
  const layout = await ejs.renderFile(templatePath, data);
  await fs.writeFile("docs/index.html", layout, "utf8");
};

export const bytesToSize = (bytes: number) => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "N/A";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
  if (i === 0) return `${bytes} ${sizes[i]}`;
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};
