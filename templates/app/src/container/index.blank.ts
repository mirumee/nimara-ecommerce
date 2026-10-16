import { createContainer } from "iti";

import { getLogger } from "@nimara/infrastructure/logging/service";

export type AppConfig = { NAME: string };

export const createAppContainer = <Config extends AppConfig>(config: Config) =>
  createContainer().add({
    config: () => config,
    logger: () => getLogger({ name: config.NAME }),
  });

export type AppContainer<Config extends AppConfig = AppConfig> = ReturnType<
  typeof createAppContainer<Config>
>;
