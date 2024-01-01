export interface Args {
  asHtml: boolean;
  gzip: boolean;
}

export interface Minifier {
  name: string;
  version: string;
  url: string;
  build: (source: string) => Promise<string>;
}

export interface Measurement {
  minifier: Omit<Minifier, "build">;
  minifiedSize: number;
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
  measurements: Measurement[];
  stats?: Stats;
}
