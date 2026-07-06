// Minimal static HTTP server that serves the Vite build output.
// Used so the sandbox preview healthcheck works without depending on `vite preview`.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "dist");
const PORT = Number(process.env.PORT || 3000);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  let pathname = url.pathname;

  // Health endpoint expected by the sandbox preview.
  if (pathname === "/api/health") {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // SPA fallback — serve index.html for any non-file request.
  let file = join(DIST, decodeURIComponent(pathname));
  try {
    const s = await stat(file);
    if (!s.isFile()) throw new Error("not a file");
  } catch {
    // If the request isn't for a real file, serve index.html for SPA routing.
    // But only for navigation-like requests, not for API calls.
    if (!pathname.includes(".")) {
      file = join(DIST, "index.html");
    } else {
      res.statusCode = 404;
      res.end("Not Found");
      return;
    }
  }

  try {
    const data = await readFile(file);
    const ext = extname(file).toLowerCase();
    res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=60");
    res.end(data);
  } catch {
    res.statusCode = 500;
    res.end("Server Error");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  // eslint-disable-next-line no-console
  console.log(`ClientFlow → http://0.0.0.0:${PORT}`);
});
