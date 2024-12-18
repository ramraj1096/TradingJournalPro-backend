import { Router } from "express";
import { addTrade, 
    analyticChartDataofTrades, 
    getAllTrades, 
    getTrade, 
    overViewOfTrades, 
    squareOff, 
    updateTrade } from "../controllers/trade-controller";
import { validateTrades } from "../utils/validation";
import { authMiddleware } from "../middlewares/middleware";


const router = Router();

router.get("/:userId/all-trades",authMiddleware,
     getAllTrades);

router.get("/:userId/overview",authMiddleware,
   overViewOfTrades);

router.get("/:userId/chartData",authMiddleware,
   analyticChartDataofTrades);

router.get("/:userId/:id",authMiddleware,
     getTrade);

router.post("/:userId/add-trade",authMiddleware,
    validateTrades, 
    addTrade);

router.put("/:userId/:id", authMiddleware,
    updateTrade);

router.delete("/:userId/:id", authMiddleware,
    squareOff);

export default router;