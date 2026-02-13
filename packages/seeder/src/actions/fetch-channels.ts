import { gql } from "graphql-request";
import { ChannelNode, ChannelsQueryResponse } from "../types";
import { client } from "../client";

/**
 * Fetches all channels.
 * @returns Array of channel nodes.
 */
export async function fetchChannels(): Promise<ChannelNode[]> {
  const query = gql`
    query {
      channels {
        id
        slug
      }
    }
  `;
  const res = await client.request<ChannelsQueryResponse>(query);
  return res.channels;
}
