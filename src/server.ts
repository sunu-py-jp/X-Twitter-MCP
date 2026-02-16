import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTweetPostTools, registerTweetDeleteTools, registerTweetGetTools } from "./tools/tweets.js";
import { registerTimelineGetTools } from "./tools/timelines.js";
import { registerEngagementPostTools, registerEngagementDeleteTools, registerEngagementGetTools } from "./tools/engagement.js";
import { registerUserPostTools, registerUserDeleteTools, registerUserGetTools } from "./tools/users.js";
import { registerBlocksMutesPostTools, registerBlocksMutesDeleteTools } from "./tools/blocks-mutes.js";
import { registerDmPostTools, registerDmGetTools } from "./tools/dm.js";
import { registerListPostTools, registerListDeleteTools, registerListGetTools } from "./tools/lists.js";
import { registerMediaPostTools } from "./tools/media.js";
import { registerUsageGetTools } from "./tools/usage.js";

type RegisterFn = (server: McpServer) => void;

const TOOL_REGISTRY: Record<string, RegisterFn> = {
  "tweets:post":        registerTweetPostTools,
  "tweets:delete":      registerTweetDeleteTools,
  "tweets:get":         registerTweetGetTools,
  "timelines:get":      registerTimelineGetTools,
  "engagement:post":    registerEngagementPostTools,
  "engagement:delete":  registerEngagementDeleteTools,
  "engagement:get":     registerEngagementGetTools,
  "users:post":         registerUserPostTools,
  "users:delete":       registerUserDeleteTools,
  "users:get":          registerUserGetTools,
  "blocks-mutes:post":  registerBlocksMutesPostTools,
  "blocks-mutes:delete":registerBlocksMutesDeleteTools,
  "dm:post":            registerDmPostTools,
  "dm:get":             registerDmGetTools,
  "lists:post":         registerListPostTools,
  "lists:delete":       registerListDeleteTools,
  "lists:get":          registerListGetTools,
  "media:post":         registerMediaPostTools,
  "usage:get":          registerUsageGetTools,
};

function parseEnabledGroups(): Set<string> | null {
  const raw = process.env.X_ENABLED_GROUPS;
  if (!raw) return null;
  const patterns = raw.split(",").map(s => s.trim()).filter(Boolean);
  const matched = new Set<string>();
  for (const pattern of patterns) {
    for (const key of Object.keys(TOOL_REGISTRY)) {
      // "tweets" matches "tweets:post", "tweets:delete", "tweets:get"
      // "tweets:get" matches "tweets:get" exactly
      if (key === pattern || key.startsWith(pattern + ":")) {
        matched.add(key);
      }
    }
  }
  return matched;
}

function parseDisabledTools(): Set<string> {
  const raw = process.env.X_DISABLED_TOOLS;
  if (!raw) return new Set();
  return new Set(raw.split(",").map(s => s.trim()).filter(Boolean));
}

function wrapServer(server: McpServer, disabledTools: Set<string>): McpServer {
  if (disabledTools.size === 0) return server;

  const original = server.registerTool.bind(server);
  (server as any).registerTool = (name: string, ...args: any[]) => {
    if (disabledTools.has(name)) {
      return;
    }
    return (original as any)(name, ...args);
  };
  return server;
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: "x-twitter-mcp",
    version: "1.0.0",
  });

  const enabledGroups = parseEnabledGroups();
  const disabledTools = parseDisabledTools();
  const wrapped = wrapServer(server, disabledTools);

  for (const [key, register] of Object.entries(TOOL_REGISTRY)) {
    if (enabledGroups === null || enabledGroups.has(key)) {
      register(wrapped);
    }
  }

  return server;
}
