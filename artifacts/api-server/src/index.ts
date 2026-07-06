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

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

ensureDatabaseReady().catch((err) => {
  console.error("Startup database check failed");
  console.error(err instanceof Error ? err.message : err);
});
