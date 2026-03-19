import { Router, type IRouter } from "express";
import healthRouter from "./health";
import passagesRouter from "./passages";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(authRouter);
router.use(healthRouter);
router.use(passagesRouter);

export default router;
