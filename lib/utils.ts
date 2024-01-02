import os from "node:os";
import { Buffer } from "node:buffer";
import Bun from "bun";
import ejs from "ejs";

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
  const templatePath = await Bun.resolve(template, import.meta.dir);
  const layout = await ejs.renderFile(templatePath, data);
  await Bun.write("./docs/index.html", layout);
};

export const bytesToSize = (bytes: number) => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "N/A";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
  if (i === 0) return `${bytes} ${sizes[i]}`;
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

export const getGzipSize = (source: string) => {
  return Bun.gzipSync(Buffer.from(source), { level: 9 }).length;
};
