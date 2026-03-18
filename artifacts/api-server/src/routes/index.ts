import { Router, type IRouter } from "express";
import healthRouter from "./health";
import passagesRouter from "./passages";

const router: IRouter = Router();

router.use(healthRouter);
router.use(passagesRouter);

export default router;
