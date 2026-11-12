import express from "express";
import { fileURLToPath } from "node:url";
import { apiHandler } from "./feeds.mjs";
const app = express();
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  next();
});
app.all("/api/feeds", apiHandler);
const dir = fileURLToPath(new URL("../web/", import.meta.url));
app.use(
  express.static(dir, {
    setHeaders(res, path) {
      if (path.endsWith("sw.js") || path.endsWith("index.html"))
        res.setHeader("Cache-Control", "no-cache");
    },
  }),
);
app.get("/{*path}", (req, res) => {
  if (req.path.startsWith("/api/"))
    return res.status(404).json({ error: "Unknown endpoint" });
  res.sendFile(dir + "index.html");
});
const port = Number(process.env.PORT) || 3000;
app.listen(port, "0.0.0.0", () =>
  console.log(`PROHOR ready on 0.0.0.0:${port}`),
);
