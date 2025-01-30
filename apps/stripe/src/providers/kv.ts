import { createClient } from "@vercel/kv";

export const getKVClient = () =>
  createClient({
    url: CONFIG.LUNA_KV_REST_API_URL,
    token: CONFIG.LUNA_KV_REST_API_TOKEN,
  });
