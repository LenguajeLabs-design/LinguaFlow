import app from "./app";
import { ensureDatabaseReady } from "@workspace/db";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

function checkAuthConfig(): void {
  const pubKey = process.env.CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;
  const env = process.env.NODE_ENV ?? "development";

  const missing: string[] = [];
  if (!pubKey) missing.push("CLERK_PUBLISHABLE_KEY");
  if (!secretKey) missing.push("CLERK_SECRET_KEY");

  if (missing.length > 0) {
    const msg = `[auth] FATAL: Missing required Clerk env vars: ${missing.join(", ")}`;
    if (env === "production") throw new Error(msg);
    console.warn(msg);
    return;
  }

  const keyType = pubKey!.startsWith("pk_live_")
    ? "live"
    : pubKey!.startsWith("pk_test_")
      ? "test"
      : "unknown";

  if (env === "production" && keyType !== "live") {
    console.error(
      "[auth] FATAL: CLERK_PUBLISHABLE_KEY is not a live key in production. " +
      "Replit should inject a pk_live_* key at deploy time. " +
      "Backend token validation will fail for all authenticated users.",
    );
    throw new Error("[auth] Non-live Clerk key detected in production — aborting.");
  }

  console.log(
    `[auth] Clerk config OK — env=${env} key-type=${keyType} key-resolution=host-based`,
  );
}

checkAuthConfig();

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

ensureDatabaseReady().catch((err) => {
  console.error("Startup database check failed");
  console.error(err instanceof Error ? err.message : err);
});
