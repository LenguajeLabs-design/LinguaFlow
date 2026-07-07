import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { createClerkClient } from "@clerk/backend";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

declare global {
  namespace Express {
    interface Request {
      userId: number;
      isAdmin: boolean;
    }
  }
}

const ADMIN_EMAILS: Set<string> = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const auth = getAuth(req);

  if (!auth.userId) {
    const rawCookie = req.headers.cookie ?? "";
    const hasSessionCookie = rawCookie.includes("__session=");
    const hasAuthHeader = !!req.headers.authorization;

    if (hasSessionCookie || hasAuthHeader) {
      console.warn(
        "[auth] 401: token present but Clerk validation failed — " +
        "possible key mismatch (test vs live) or expired/malformed token. " +
        `source=${hasAuthHeader ? "Authorization header" : "__session cookie"}`,
      );
    }

    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    let [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkId, auth.userId));

    if (!user) {
      let email: string;
      try {
        const clerkUser = await clerkClient.users.getUser(auth.userId);
        email = clerkUser.emailAddresses[0]?.emailAddress ?? `${auth.userId}@clerk.local`;
      } catch (clerkErr) {
        console.error(
          "[auth] 500: Clerk user lookup failed after token validated — " +
          "possible CLERK_SECRET_KEY mismatch or Clerk API unavailable. " +
          `clerkId=${auth.userId}`,
        );
        res.status(500).json({ error: "Authentication error" });
        return;
      }

      [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email));

      if (user) {
        [user] = await db
          .update(usersTable)
          .set({ clerkId: auth.userId })
          .where(eq(usersTable.id, user.id))
          .returning();
      } else {
        [user] = await db
          .insert(usersTable)
          .values({ email, clerkId: auth.userId })
          .returning();
      }
    }

    req.userId = user.id;
    req.isAdmin = ADMIN_EMAILS.size > 0 && ADMIN_EMAILS.has(user.email.toLowerCase());
    next();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[auth] 500: DB user lookup/provision failed after Clerk auth succeeded:", message);
    res.status(500).json({ error: "Authentication error" });
  }
}
