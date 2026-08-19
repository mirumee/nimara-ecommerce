/**
 * Vercel entrypoint (Hono framework preset).
 */
import { Hono } from "hono";

import { app } from "./dist/handler/entry-server.js";

const server = new Hono();

server.route("/", app);

// eslint-disable-next-line import/no-default-export
export default server;
