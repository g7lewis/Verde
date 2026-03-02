import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { injectOgTags } from "./ogTags";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Cache index.html in memory after first read
  let cachedIndexHtml: string | null = null;

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("/{*path}", (_req, res) => {
    if (!cachedIndexHtml) {
      cachedIndexHtml = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");
    }

    const lat = parseFloat(_req.query.lat as string);
    const lng = parseFloat(_req.query.lng as string);

    if (!isNaN(lat) && !isNaN(lng)) {
      const html = injectOgTags(cachedIndexHtml, lat, lng);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } else {
      res.status(200).set({ "Content-Type": "text/html" }).end(cachedIndexHtml);
    }
  });
}
