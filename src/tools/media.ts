import { z } from "zod";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getClient } from "../client.js";
import { formatResponse, formatError } from "../utils/helpers.js";

function validateFilePath(filePath: string): void {
  const resolved = path.resolve(filePath);
  if (resolved !== path.normalize(filePath) && filePath !== resolved) {
    // Allow absolute paths but reject path traversal patterns
    if (filePath.includes("..")) {
      throw new Error("Path traversal is not allowed");
    }
  }
}

function validateUrl(url: string): void {
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http and https URLs are allowed");
  }
  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "[::1]" ||
    hostname.endsWith(".local") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
    hostname === "169.254.169.254" ||
    hostname === "metadata.google.internal"
  ) {
    throw new Error("Access to internal/private network addresses is not allowed");
  }
}

export function registerMediaPostTools(server: McpServer): void {
  // ── 登録 ──

  server.registerTool(
    "upload_media",
    {
      description: "Upload media (image, gif, video) from a file path",
      inputSchema: {
        file_path: z.string().describe("Absolute path to the media file"),
        media_type: z.string().describe('MIME type of the media (e.g. "image/jpeg", "image/png", "image/gif", "video/mp4")'),
        alt_text: z.string().optional().describe("Optional alt text for accessibility"),
      },
    },
    async ({ file_path, media_type, alt_text }) => {
      try {
        validateFilePath(file_path);
        const client = getClient();
        const mediaId = await client.v1.uploadMedia(file_path, { mimeType: media_type });
        if (alt_text) {
          await client.v1.createMediaMetadata(mediaId, { alt_text: { text: alt_text } });
        }
        return formatResponse({ media_id: mediaId });
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.registerTool(
    "upload_media_from_url",
    {
      description: "Upload media from a URL",
      inputSchema: {
        url: z.string().describe("URL of the media to upload"),
        media_type: z.string().describe('MIME type of the media (e.g. "image/jpeg", "image/png", "image/gif", "video/mp4")'),
        alt_text: z.string().optional().describe("Optional alt text for accessibility"),
      },
    },
    async ({ url, media_type, alt_text }) => {
      try {
        validateUrl(url);
        const client = getClient();
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch media from URL: ${response.status} ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mediaId = await client.v1.uploadMedia(buffer, { mimeType: media_type });
        if (alt_text) {
          await client.v1.createMediaMetadata(mediaId, { alt_text: { text: alt_text } });
        }
        return formatResponse({ media_id: mediaId });
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
