import { Router, type IRouter } from "express";
import healthRouter from "./health";
import passagesRouter from "./passages";
import authRouter from "./auth";
import vocabularyRouter from "./vocabulary";

const router: IRouter = Router();

router.use(authRouter);
router.use(healthRouter);
router.use(passagesRouter);
router.use(vocabularyRouter);

export default router;
