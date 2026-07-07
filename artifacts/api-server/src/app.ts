import express, { type Express } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { globalLimiter } from "./middleware/rateLimiter";

const app: Express = express();

app.set("trust proxy", 1);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;
const REPLIT_PATTERN = /^https:\/\/[a-z0-9-]+\.(replit\.dev|repl\.co|replit\.app)(\/.*)?$/i;

app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGIN && origin === ALLOWED_ORIGIN) return callback(null, true);
    if (REPLIT_PATTERN.test(origin)) return callback(null, true);
    if (process.env.NODE_ENV !== "production") return callback(null, true);
    callback(new Error("CORS: origin not allowed"));
  },
}));

app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ extended: true, limit: "64kb" }));

app.use(globalLimiter);

app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

app.use("/api", router);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err?.status ?? err?.statusCode ?? 500;
  if (status >= 500) {
    console.error("Unhandled error:", err?.message ?? err);
    res.status(status).json({ error: "Internal server error" });
  } else {
    res.status(status).json({ error: err?.message ?? "Request error" });
  }
});

export default app;
