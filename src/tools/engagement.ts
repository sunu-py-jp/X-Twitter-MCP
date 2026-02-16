import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClient, getMyUserId } from "../client.js";
import { formatResponse, formatError } from "../utils/helpers.js";

export function registerEngagementPostTools(server: McpServer): void {
  server.registerTool(
    "like_tweet",
    {
      description: "Like a tweet",
      inputSchema: {
        tweet_id: z.string().describe("The ID of the tweet to like"),
      },
    },
    async ({ tweet_id }) => {
      try {
        const client = getClient();
        const userId = await getMyUserId();
        const result = await client.v2.like(userId, tweet_id);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "retweet",
    {
      description: "Retweet a tweet",
      inputSchema: {
        tweet_id: z.string().describe("The ID of the tweet to retweet"),
      },
    },
    async ({ tweet_id }) => {
      try {
        const client = getClient();
        const userId = await getMyUserId();
        const result = await client.v2.retweet(userId, tweet_id);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "bookmark_tweet",
    {
      description: "Bookmark a tweet",
      inputSchema: {
        tweet_id: z.string().describe("The ID of the tweet to bookmark"),
      },
    },
    async ({ tweet_id }) => {
      try {
        const client = getClient();
        const result = await client.v2.bookmark(tweet_id);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );
}

export function registerEngagementDeleteTools(server: McpServer): void {
  server.registerTool(
    "unlike_tweet",
    {
      description: "Unlike a tweet",
      inputSchema: {
        tweet_id: z.string().describe("The ID of the tweet to unlike"),
      },
    },
    async ({ tweet_id }) => {
      try {
        const client = getClient();
        const userId = await getMyUserId();
        const result = await client.v2.unlike(userId, tweet_id);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "unretweet",
    {
      description: "Remove a retweet",
      inputSchema: {
        tweet_id: z.string().describe("The ID of the tweet to unretweet"),
      },
    },
    async ({ tweet_id }) => {
      try {
        const client = getClient();
        const userId = await getMyUserId();
        const result = await client.v2.unretweet(userId, tweet_id);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "delete_bookmark",
    {
      description: "Remove a bookmark",
      inputSchema: {
        tweet_id: z.string().describe("The ID of the tweet to unbookmark"),
      },
    },
    async ({ tweet_id }) => {
      try {
        const client = getClient();
        const result = await client.v2.deleteBookmark(tweet_id);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );
}

export function registerEngagementGetTools(server: McpServer): void {
  server.registerTool(
    "get_liked_tweets",
    {
      description: "Get tweets liked by a user",
      inputSchema: {
        user_id: z.string().describe("The ID of the user"),
        max_results: z.number().min(10).max(100).optional().describe("Maximum number of results (10-100, default: 10)"),
        next_token: z.string().optional().describe("Pagination token for next page of results"),
      },
    },
    async ({ user_id, max_results = 10, next_token }) => {
      try {
        const client = getClient();
        const options = {
          max_results,
          ...(next_token && { pagination_token: next_token }),
          "tweet.fields": "created_at,public_metrics,author_id",
          expansions: "author_id" as const,
          "user.fields": "name,username",
        };
        const result = await client.v2.userLikedTweets(user_id, options);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "get_bookmarks",
    {
      description: "Get bookmarked tweets",
      inputSchema: {
        max_results: z.number().min(1).max(100).optional().describe("Maximum number of results (1-100, default: 20)"),
        next_token: z.string().optional().describe("Pagination token for next page of results"),
      },
    },
    async ({ max_results = 20, next_token }) => {
      try {
        const client = getClient();
        const options = {
          max_results,
          ...(next_token && { pagination_token: next_token }),
          "tweet.fields": "created_at,public_metrics,author_id",
          expansions: "author_id" as const,
          "user.fields": "name,username",
        };
        const result = await client.v2.bookmarks(options);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
