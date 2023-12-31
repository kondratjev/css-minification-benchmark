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
