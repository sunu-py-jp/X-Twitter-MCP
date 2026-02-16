import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClient } from "../client.js";
import { formatResponse, formatError } from "../utils/helpers.js";

export function registerDmPostTools(server: McpServer): void {
  server.registerTool(
    "send_dm",
    {
      description: "Send a DM to a user (1-to-1)",
      inputSchema: {
        participant_id: z.string().describe("The target user's ID"),
        text: z.string().describe("The message text"),
        media_id: z.string().optional().describe("Optional media ID to attach"),
      },
    },
    async ({ participant_id, text, media_id }) => {
      try {
        const client = getClient();
        const message: any = { text };
        if (media_id) message.attachments = [{ media_id }];
        const result = await client.v2.sendDmToParticipant(participant_id, message);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "send_dm_in_conversation",
    {
      description: "Send a message in an existing DM conversation",
      inputSchema: {
        conversation_id: z.string().describe("The DM conversation ID"),
        text: z.string().describe("The message text"),
        media_id: z.string().optional().describe("Optional media ID to attach"),
      },
    },
    async ({ conversation_id, text, media_id }) => {
      try {
        const client = getClient();
        const message: any = { text };
        if (media_id) message.attachments = [{ media_id }];
        const result = await client.v2.sendDmInConversation(conversation_id, message);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "create_dm_conversation",
    {
      description: "Create a group DM conversation",
      inputSchema: {
        participant_ids: z.array(z.string()).describe("Array of user IDs to include in the conversation"),
        message: z.string().describe("The initial message text"),
      },
    },
    async ({ participant_ids, message }) => {
      try {
        const client = getClient();
        const result = await client.v2.createDmConversation({
          conversation_type: "Group",
          participant_ids,
          message: { text: message },
        });
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );
}

export function registerDmGetTools(server: McpServer): void {
  server.registerTool(
    "get_dm_events",
    {
      description: "Get DM events (last 30 days)",
      inputSchema: {
        max_results: z.number().min(1).max(100).optional().describe("Maximum number of results (1-100, default 20)"),
        next_token: z.string().optional().describe("Pagination token"),
      },
    },
    async ({ max_results = 20, next_token }) => {
      try {
        const client = getClient();
        const options: any = {
          max_results,
          "dm_event.fields": "created_at,dm_conversation_id,sender_id,text,attachments,referenced_tweets",
          expansions: "sender_id,referenced_tweets.id",
          "user.fields": "name,username",
        };
        if (next_token) options.pagination_token = next_token;
        const result = await client.v2.listDmEvents(options);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "get_dm_conversation",
    {
      description: "Get messages in a DM conversation",
      inputSchema: {
        conversation_id: z.string().describe("The DM conversation ID"),
        max_results: z.number().min(1).max(100).optional().describe("Maximum number of results (1-100, default 20)"),
        next_token: z.string().optional().describe("Pagination token"),
      },
    },
    async ({ conversation_id, max_results = 20, next_token }) => {
      try {
        const client = getClient();
        const options: any = {
          max_results,
          "dm_event.fields": "created_at,dm_conversation_id,sender_id,text,attachments,referenced_tweets",
          expansions: "sender_id",
          "user.fields": "name,username",
        };
        if (next_token) options.pagination_token = next_token;
        const result = await client.v2.listDmEventsOfConversation(conversation_id, options);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
