import { Router } from "express";
import { addHolding, 
    analyticChartData, 
    getAllHoldingsofUser, 
    getHolding, 
    overViewOfHoldings, 
    squareOff, 
    updateHolding } from "../controllers/holding-controller";
import { validateHolding } from "../utils/validation";
import { authMiddleware } from "../middlewares/middleware";

const router = Router();

router.get("/:userId/all-holdings", authMiddleware,
    getAllHoldingsofUser);

router.post("/:userId/new-holding", validateHolding, authMiddleware,
     addHolding);

router.get("/:userId/overview", authMiddleware, 
   overViewOfHoldings);

router.get("/:userId/chartdata", authMiddleware, 
    analyticChartData);

router.get("/:userId/:id", authMiddleware,
    getHolding);

router.put("/:userId/:id", authMiddleware,
    updateHolding);

router.delete("/:userId/:id", authMiddleware,
    squareOff);



export default router;