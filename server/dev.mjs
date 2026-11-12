import express from "express";
import { createServer as createHttpServer } from "node:http";
import { createServer as createViteServer } from "vite";
import { apiHandler } from "./feeds.mjs";
const app = express();
app.disable("x-powered-by");
app.all("/api/feeds", apiHandler);
const server = createHttpServer(app);
const vite = await createViteServer({
  server: {
    middlewareMode: true,
    host: "0.0.0.0",
    allowedHosts: true,
    hmr: { server },
  },
  appType: "spa",
});
app.use(vite.middlewares);
const port = Number(process.env.PORT) || 5173;
server.listen(port, "0.0.0.0", () =>
  console.log(`PROHOR development server listening on 0.0.0.0:${port}`),
);
