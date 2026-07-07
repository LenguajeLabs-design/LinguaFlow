import { Router, type IRouter } from "express";
import { requireAuth } from "../middleware/requireAuth";

const router: IRouter = Router();

router.post("/auth/signup",  (_req, res) => res.status(410).json({ error: "Use Clerk auth" }));
router.post("/auth/login",   (_req, res) => res.status(410).json({ error: "Use Clerk auth" }));
router.post("/auth/logout",  (_req, res) => res.json({ success: true }));
router.get("/auth/me",       (_req, res) => res.status(410).json({ error: "Use Clerk auth" }));

/**
 * POST-PUBLISH SMOKE TEST — GET /api/auth/verify
 *
 * Requires a valid Clerk session. Returns ok:true and the resolved internal
 * userId. Use this after every publish to confirm end-to-end auth is working:
 *   curl -b "__session=<token>" https://<your-app>.replit.app/api/auth/verify
 * Or just open Library and check that passages load (they call requireAuth too).
 */
router.get("/auth/verify", requireAuth, (req, res) => {
  res.json({ ok: true, userId: req.userId });
});

export default router;
