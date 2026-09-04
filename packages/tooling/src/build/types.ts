import { type ServiceEntry } from "../entry-points.ts";

export type BuildTargetAdapter = {
  // Fills `__CLIENT_ASSETS__`; empty where the target serves assets from disk.
  clientAssets: (opts: {
    assetsDir: string;
    hasClient: boolean;
  }) => Promise<Record<string, string>>;
  // Runs once, after every service is built.
  finalize: (opts: {
    rootDir: string;
    services: ServiceEntry[];
  }) => Promise<void>;
};
