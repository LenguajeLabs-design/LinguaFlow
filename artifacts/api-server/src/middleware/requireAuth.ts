import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { createClerkClient } from "@clerk/backend";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

declare global {
  namespace Express {
    interface Request {
      userId: number;
    }
  }
}

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const auth = getAuth(req);
  if (!auth.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    let [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkId, auth.userId));

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(auth.userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? `${auth.userId}@clerk.local`;

      // Try to link an existing bcrypt account by matching email
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
    next();
  } catch (err) {
    console.error("requireAuth error:", err);
    res.status(500).json({ error: "Authentication error" });
  }
}
