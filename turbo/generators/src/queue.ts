import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { TEMPLATE_NAME, TEMPLATE_SERVICES } from "./names.ts";

const TEMPLATE_SERVICE = TEMPLATE_SERVICES.queue;

// The name follows the service: two of them must not read one variable.
const TEMPLATE_VARIABLE = `${TEMPLATE_SERVICE.toUpperCase()}_QUEUE_URL`;

const queueVariable = (service: string) =>
  `${service.toUpperCase().replaceAll("-", "_")}_QUEUE_URL`;

/**
 * In the service's own `.env.example` the template's names mean "this service"
 * and "this app" wherever they appear, the queue the URL points at included.
 */
const rewriteFragment = ({
  app,
  contents,
  service,
}: {
  app: string;
  contents: string;
  service: string;
}) =>
  contents.replaceAll(TEMPLATE_SERVICE, service).replaceAll(TEMPLATE_NAME, app);

/**
 * Throws rather than skipping: a service left naming the template's variable
 * would poll another service's queue.
 */
export const renameQueue = async ({
  app,
  service,
  serviceDir,
}: {
  app: string;
  service: string;
  serviceDir: string;
}) => {
  const entries = await readdir(serviceDir, {
    recursive: true,
    withFileTypes: true,
  });

  let renamed = 0;

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }

    const path = join(entry.parentPath, entry.name);
    const contents = await readFile(path, "utf8");

    if (!contents.includes(TEMPLATE_VARIABLE)) {
      continue;
    }

    const renamedContents = contents.replaceAll(
      TEMPLATE_VARIABLE,
      queueVariable(service),
    );

    await writeFile(
      path,
      entry.name === ".env.example"
        ? rewriteFragment({ app, contents: renamedContents, service })
        : renamedContents,
    );

    renamed += 1;
  }

  if (renamed === 0) {
    throw new Error(
      `Expected ${TEMPLATE_VARIABLE} somewhere in ${serviceDir}.`,
    );
  }
};
