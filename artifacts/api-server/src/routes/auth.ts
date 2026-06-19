import { Router, type IRouter } from "express";

const router: IRouter = Router();

// Auth is now handled by Clerk. These stubs prevent 404s on old clients.
router.post("/auth/signup",  (_req, res) => res.status(410).json({ error: "Use Clerk auth" }));
router.post("/auth/login",   (_req, res) => res.status(410).json({ error: "Use Clerk auth" }));
router.post("/auth/logout",  (_req, res) => res.json({ success: true }));
router.get("/auth/me",       (_req, res) => res.status(410).json({ error: "Use Clerk auth" }));

export default router;
