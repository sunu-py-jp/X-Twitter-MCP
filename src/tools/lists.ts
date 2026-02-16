import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClient, getMyUserId } from "../client.js";
import { formatResponse, formatError } from "../utils/helpers.js";

export function registerListPostTools(server: McpServer): void {
  server.registerTool(
    "create_list",
    {
      description: "Create a new list",
      inputSchema: {
        name: z.string().describe("The name of the list"),
        description: z.string().optional().describe("The description of the list"),
        private: z.boolean().optional().describe("Whether the list is private (default: false)"),
      },
    },
    async ({ name, description, private: isPrivate }) => {
      try {
        const client = getClient();
        const params: any = { name };
        if (description !== undefined) params.description = description;
        if (isPrivate !== undefined) params.private = isPrivate;
        const result = await client.v2.createList(params);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "update_list",
    {
      description: "Update a list",
      inputSchema: {
        list_id: z.string().describe("The ID of the list"),
        name: z.string().optional().describe("The new name of the list"),
        description: z.string().optional().describe("The new description of the list"),
        private: z.boolean().optional().describe("Whether the list should be private"),
      },
    },
    async ({ list_id, name, description, private: isPrivate }) => {
      try {
        const client = getClient();
        const params: any = {};
        if (name !== undefined) params.name = name;
        if (description !== undefined) params.description = description;
        if (isPrivate !== undefined) params.private = isPrivate;
        const result = await client.v2.updateList(list_id, params);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "add_list_member",
    {
      description: "Add a member to a list",
      inputSchema: {
        list_id: z.string().describe("The ID of the list"),
        user_id: z.string().describe("The ID of the user to add"),
      },
    },
    async ({ list_id, user_id }) => {
      try {
        const client = getClient();
        const result = await client.v2.addListMember(list_id, user_id);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "follow_list",
    {
      description: "Follow a list",
      inputSchema: {
        list_id: z.string().describe("The ID of the list to follow"),
      },
    },
    async ({ list_id }) => {
      try {
        const client = getClient();
        const userId = await getMyUserId();
        const result = await client.v2.subscribeToList(userId, list_id);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "pin_list",
    {
      description: "Pin a list",
      inputSchema: {
        list_id: z.string().describe("The ID of the list to pin"),
      },
    },
    async ({ list_id }) => {
      try {
        const client = getClient();
        const userId = await getMyUserId();
        const result = await client.v2.pinList(userId, list_id);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );
}

export function registerListDeleteTools(server: McpServer): void {
  server.registerTool(
    "delete_list",
    {
      description: "Delete a list",
      inputSchema: {
        list_id: z.string().describe("The ID of the list to delete"),
      },
    },
    async ({ list_id }) => {
      try {
        const client = getClient();
        const result = await client.v2.removeList(list_id);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "remove_list_member",
    {
      description: "Remove a member from a list",
      inputSchema: {
        list_id: z.string().describe("The ID of the list"),
        user_id: z.string().describe("The ID of the user to remove"),
      },
    },
    async ({ list_id, user_id }) => {
      try {
        const client = getClient();
        const result = await client.v2.removeListMember(list_id, user_id);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "unfollow_list",
    {
      description: "Unfollow a list",
      inputSchema: {
        list_id: z.string().describe("The ID of the list to unfollow"),
      },
    },
    async ({ list_id }) => {
      try {
        const client = getClient();
        const userId = await getMyUserId();
        const result = await client.v2.unsubscribeOfList(userId, list_id);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "unpin_list",
    {
      description: "Unpin a list",
      inputSchema: {
        list_id: z.string().describe("The ID of the list to unpin"),
      },
    },
    async ({ list_id }) => {
      try {
        const client = getClient();
        const userId = await getMyUserId();
        const result = await client.v2.unpinList(userId, list_id);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );
}

export function registerListGetTools(server: McpServer): void {
  server.registerTool(
    "get_list",
    {
      description: "Get information about a list",
      inputSchema: {
        list_id: z.string().describe("The ID of the list"),
      },
    },
    async ({ list_id }) => {
      try {
        const client = getClient();
        const result = await client.v2.list(list_id, {
          "list.fields": "created_at,follower_count,member_count,owner_id,description,private",
        });
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "get_list_tweets",
    {
      description: "Get tweets from a list",
      inputSchema: {
        list_id: z.string().describe("The ID of the list"),
        max_results: z.number().min(1).max(100).optional().describe("Maximum number of results (1-100, default: 20)"),
        next_token: z.string().optional().describe("Pagination token for next page of results"),
      },
    },
    async ({ list_id, max_results = 20, next_token }) => {
      try {
        const client = getClient();
        const options = {
          max_results,
          ...(next_token && { pagination_token: next_token }),
          "tweet.fields": "created_at,public_metrics,author_id",
          expansions: "author_id" as const,
          "user.fields": "name,username",
        };
        const result = await client.v2.listTweets(list_id, options);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "get_owned_lists",
    {
      description: "Get lists owned by a user",
      inputSchema: {
        user_id: z.string().describe("The ID of the user"),
        max_results: z.number().min(1).max(100).optional().describe("Maximum number of results (1-100, default: 20)"),
        next_token: z.string().optional().describe("Pagination token for next page of results"),
      },
    },
    async ({ user_id, max_results = 20, next_token }) => {
      try {
        const client = getClient();
        const options = {
          max_results,
          ...(next_token && { pagination_token: next_token }),
          "list.fields": "created_at,follower_count,member_count,owner_id,description,private",
        };
        const result = await client.v2.listsOwned(user_id, options);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "get_list_members",
    {
      description: "Get members of a list",
      inputSchema: {
        list_id: z.string().describe("The ID of the list"),
        max_results: z.number().min(1).max(100).optional().describe("Maximum number of results (1-100, default: 20)"),
        next_token: z.string().optional().describe("Pagination token for next page of results"),
      },
    },
    async ({ list_id, max_results = 20, next_token }) => {
      try {
        const client = getClient();
        const options = {
          max_results,
          ...(next_token && { pagination_token: next_token }),
          "user.fields": "created_at,description,profile_image_url,public_metrics,verified",
        };
        const result = await client.v2.listMembers(list_id, options);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "get_followed_lists",
    {
      description: "Get lists the user follows",
      inputSchema: {
        user_id: z.string().describe("The ID of the user"),
        max_results: z.number().min(1).max(100).optional().describe("Maximum number of results (1-100, default: 20)"),
        next_token: z.string().optional().describe("Pagination token for next page of results"),
      },
    },
    async ({ user_id, max_results = 20, next_token }) => {
      try {
        const client = getClient();
        const options = {
          max_results,
          ...(next_token && { pagination_token: next_token }),
          "list.fields": "created_at,follower_count,member_count,owner_id,description,private",
        };
        const result = await client.v2.listFollowed(user_id, options);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "get_pinned_lists",
    {
      description: "Get pinned lists of the authenticated user",
    },
    async () => {
      try {
        const client = getClient();
        const userId = await getMyUserId();
        const result = await client.v2.get(`users/${userId}/pinned_lists`, {
          "list.fields": "created_at,follower_count,member_count,owner_id,description,private",
        });
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
