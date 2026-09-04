import { z } from "zod";

import { type Logger } from "@nimara/infrastructure/logging/types";

// Define your message schema here
const messageSchema = z.looseObject({});

export const processMessage = async ({
  body,
  logger,
}: {
  body: string;
  logger: Logger;
}) => {
  const payload = messageSchema.parse(JSON.parse(body));

  logger.info("Message received.", { payload });
};
