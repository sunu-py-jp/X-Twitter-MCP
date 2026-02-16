import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClient, getMyUserId } from "../client.js";
import { formatResponse, formatError } from "../utils/helpers.js";

const USER_FIELDS = "created_at,description,entities,location,pinned_tweet_id,profile_image_url,protected,public_metrics,url,verified";

export function registerUserPostTools(server: McpServer): void {
  server.registerTool(
    "follow_user",
    {
      description: "Follow a user",
      inputSchema: {
        target_user_id: z.string().describe("The ID of the user to follow"),
      },
    },
    async ({ target_user_id }) => {
      try {
        const client = getClient();
        const userId = await getMyUserId();
        const result = await client.v2.follow(userId, target_user_id);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );
}

export function registerUserDeleteTools(server: McpServer): void {
  server.registerTool(
    "unfollow_user",
    {
      description: "Unfollow a user",
      inputSchema: {
        target_user_id: z.string().describe("The ID of the user to unfollow"),
      },
    },
    async ({ target_user_id }) => {
      try {
        const client = getClient();
        const userId = await getMyUserId();
        const result = await client.v2.unfollow(userId, target_user_id);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );
}

export function registerUserGetTools(server: McpServer): void {
  server.registerTool(
    "get_me",
    {
      description: "Get authenticated user information",
    },
    async () => {
      try {
        const client = getClient();
        const result = await client.v2.me({ "user.fields": USER_FIELDS });
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "get_user",
    {
      description: "Get user information by user ID",
      inputSchema: {
        user_id: z.string().describe("The user ID"),
      },
    },
    async ({ user_id }) => {
      try {
        const client = getClient();
        const result = await client.v2.user(user_id, { "user.fields": USER_FIELDS });
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "get_users",
    {
      description: "Get multiple users by user IDs",
      inputSchema: {
        user_ids: z.array(z.string()).describe("Array of user IDs"),
      },
    },
    async ({ user_ids }) => {
      try {
        const client = getClient();
        const result = await client.v2.users(user_ids, { "user.fields": USER_FIELDS });
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "get_user_by_username",
    {
      description: "Get user information by username",
      inputSchema: {
        username: z.string().describe("The username (without @)"),
      },
    },
    async ({ username }) => {
      try {
        const client = getClient();
        const result = await client.v2.userByUsername(username, { "user.fields": USER_FIELDS });
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "get_users_by_usernames",
    {
      description: "Get multiple users by usernames",
      inputSchema: {
        usernames: z.array(z.string()).describe("Array of usernames (without @)"),
      },
    },
    async ({ usernames }) => {
      try {
        const client = getClient();
        const result = await client.v2.usersByUsernames(usernames, { "user.fields": USER_FIELDS });
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "get_followers",
    {
      description: "Get followers of a user",
      inputSchema: {
        user_id: z.string().describe("The user ID"),
        max_results: z.number().min(1).max(1000).optional().describe("Maximum number of results (1-1000, default 100)"),
        next_token: z.string().optional().describe("Pagination token"),
      },
    },
    async ({ user_id, max_results = 100, next_token }) => {
      try {
        const client = getClient();
        const result = await client.v2.followers(user_id, {
          max_results,
          pagination_token: next_token,
          "user.fields": USER_FIELDS,
        });
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "get_following",
    {
      description: "Get users that a user follows",
      inputSchema: {
        user_id: z.string().describe("The user ID"),
        max_results: z.number().min(1).max(1000).optional().describe("Maximum number of results (1-1000, default 100)"),
        next_token: z.string().optional().describe("Pagination token"),
      },
    },
    async ({ user_id, max_results = 100, next_token }) => {
      try {
        const client = getClient();
        const result = await client.v2.following(user_id, {
          max_results,
          pagination_token: next_token,
          "user.fields": USER_FIELDS,
        });
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
