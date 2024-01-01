export interface Args {
  asHtml: boolean;
  gzip: boolean;
}

export interface CssFile {
  name: string;
  path: string;
}

export interface Minifier {
  name: string;
  version: string;
  description?: string;
  url: string;
  build: (source: string) => Promise<string>;
}

export interface Measurement {
  minifier: Omit<Minifier, "build">;
  minifiedSize: number;
  minifiedSizeLabel: string;
  differential?: string;
  efficiency: string;
  elapsedTime: number;
}

export interface Stats {
  bestTime: number;
  worstTime: number;
  bestSize: number;
  worstSize: number;
}

export interface Result {
  filename: string;
  originalSize: number;
  originalSizeLabel: string;
  measurements: Measurement[];
  stats?: Stats;
}
