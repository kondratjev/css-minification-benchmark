import os from "node:os";
import Bun from "bun";

const benchmarkInfo = `
Date: ${new Date().toUTCString()}
CPU: ${os.cpus()[0].model}
OS: ${os.type()} ${os.arch()} ${os.release()}
Bun: ${Bun.version}
`;

export default benchmarkInfo;
