import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClient, getMyUserId } from "../client.js";
import { formatResponse, formatError } from "../utils/helpers.js";

export function registerBlocksMutesPostTools(server: McpServer): void {
  server.registerTool(
    "block_user",
    {
      description: "Block a user",
      inputSchema: {
        target_user_id: z.string().describe("The ID of the user to block"),
      },
    },
    async ({ target_user_id }) => {
      try {
        const client = getClient();
        const userId = await getMyUserId();
        const result = await client.v2.block(userId, target_user_id);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "mute_user",
    {
      description: "Mute a user",
      inputSchema: {
        target_user_id: z.string().describe("The ID of the user to mute"),
      },
    },
    async ({ target_user_id }) => {
      try {
        const client = getClient();
        const userId = await getMyUserId();
        const result = await client.v2.mute(userId, target_user_id);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );
}

export function registerBlocksMutesDeleteTools(server: McpServer): void {
  server.registerTool(
    "unblock_user",
    {
      description: "Unblock a user",
      inputSchema: {
        target_user_id: z.string().describe("The ID of the user to unblock"),
      },
    },
    async ({ target_user_id }) => {
      try {
        const client = getClient();
        const userId = await getMyUserId();
        const result = await client.v2.unblock(userId, target_user_id);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "unmute_user",
    {
      description: "Unmute a user",
      inputSchema: {
        target_user_id: z.string().describe("The ID of the user to unmute"),
      },
    },
    async ({ target_user_id }) => {
      try {
        const client = getClient();
        const userId = await getMyUserId();
        const result = await client.v2.unmute(userId, target_user_id);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
