import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClient } from "../client.js";
import { formatResponse, formatError } from "../utils/helpers.js";

export function registerTweetPostTools(server: McpServer): void {
  server.registerTool(
    "post_tweet",
    {
      description: "Post a tweet, optionally as a reply, quote tweet, or with media",
      inputSchema: {
        text: z.string().describe("The text content of the tweet"),
        reply_to: z.string().optional().describe("Tweet ID to reply to"),
        quote_tweet_id: z.string().optional().describe("Tweet ID to quote"),
        media_ids: z.array(z.string()).optional().describe("Array of media IDs to attach"),
      },
    },
    async ({ text, reply_to, quote_tweet_id, media_ids }) => {
      try {
        const client = getClient();
        const payload: any = { text };
        if (reply_to) payload.reply = { in_reply_to_tweet_id: reply_to };
        if (quote_tweet_id) payload.quote_tweet_id = quote_tweet_id;
        if (media_ids && media_ids.length > 0) payload.media = { media_ids };
        const result = await client.v2.tweet(payload);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );
}

export function registerTweetDeleteTools(server: McpServer): void {
  server.registerTool(
    "delete_tweet",
    {
      description: "Delete a tweet by ID",
      inputSchema: {
        tweet_id: z.string().describe("The ID of the tweet to delete"),
      },
    },
    async ({ tweet_id }) => {
      try {
        const client = getClient();
        const result = await client.v2.deleteTweet(tweet_id);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );
}

export function registerTweetGetTools(server: McpServer): void {
  server.registerTool(
    "get_tweet",
    {
      description: "Get a single tweet by ID with detailed information",
      inputSchema: {
        tweet_id: z.string().describe("The ID of the tweet to retrieve"),
      },
    },
    async ({ tweet_id }) => {
      try {
        const client = getClient();
        const result = await client.v2.singleTweet(tweet_id, {
          "tweet.fields": "created_at,public_metrics,author_id,conversation_id,in_reply_to_user_id,referenced_tweets,attachments",
          "expansions": "author_id,referenced_tweets.id,attachments.media_keys",
          "user.fields": "name,username,verified",
          "media.fields": "url,preview_image_url,type",
        });
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "get_tweets",
    {
      description: "Get multiple tweets by their IDs",
      inputSchema: {
        tweet_ids: z.array(z.string()).describe("Array of tweet IDs to retrieve"),
      },
    },
    async ({ tweet_ids }) => {
      try {
        const client = getClient();
        const result = await client.v2.tweets(tweet_ids, {
          "tweet.fields": "created_at,public_metrics,author_id,conversation_id,in_reply_to_user_id,referenced_tweets,attachments",
          "expansions": "author_id,referenced_tweets.id,attachments.media_keys",
          "user.fields": "name,username,verified",
          "media.fields": "url,preview_image_url,type",
        });
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "search_tweets",
    {
      description: "Search recent tweets (last 7 days) using Twitter search query syntax",
      inputSchema: {
        query: z.string().describe("Search query using Twitter search operators"),
        max_results: z.number().min(10).max(100).optional().describe("Maximum number of results to return (10-100, default: 10)"),
        next_token: z.string().optional().describe("Pagination token for next page of results"),
      },
    },
    async ({ query, max_results, next_token }) => {
      try {
        const client = getClient();
        const options: any = {
          "tweet.fields": "created_at,public_metrics,author_id",
          "expansions": "author_id",
          "user.fields": "name,username",
        };
        if (max_results !== undefined) options.max_results = max_results;
        if (next_token) options.next_token = next_token;
        const result = await client.v2.search(query, options);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "get_quote_tweets",
    {
      description: "Get quote tweets for a specific tweet",
      inputSchema: {
        tweet_id: z.string().describe("The ID of the tweet to get quotes for"),
        max_results: z.number().min(10).max(100).optional().describe("Maximum number of results to return (10-100, default: 10)"),
        next_token: z.string().optional().describe("Pagination token for next page of results"),
      },
    },
    async ({ tweet_id, max_results, next_token }) => {
      try {
        const client = getClient();
        const options: any = {
          "tweet.fields": "created_at,public_metrics,author_id",
          "expansions": "author_id",
          "user.fields": "name,username",
        };
        if (max_results !== undefined) options.max_results = max_results;
        if (next_token) options.next_token = next_token;
        const result = await client.v2.quotes(tweet_id, options);
        return formatResponse(result);
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
