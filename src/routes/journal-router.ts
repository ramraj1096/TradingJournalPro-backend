import { Router} from "express";
import { addJournal, 
    analyticChartDataofJournals, 
    deleteJournal, 
    getAllJournals, 
    getJournal, 
    overViewOfJournal, 
    updateJournal } from "../controllers/journal-controller";
import { validateJournal } from "../utils/validation";
import { authMiddleware } from "../middlewares/middleware";

const router = Router();

router.get("/:userId/all-journals", authMiddleware,
    getAllJournals);

router.get("/:userId/overview",authMiddleware,
    overViewOfJournal);

router.get("/:userId/chartData",authMiddleware,
    analyticChartDataofJournals);

router.get("/:userId/:journalId", authMiddleware,
    getJournal);

router.post("/:userId/add-new",
    validateJournal,
    authMiddleware, addJournal);

router.put("/:userId/:journalId",
    validateJournal,authMiddleware,
     updateJournal);

router.delete("/:userId/:journalId", 
    authMiddleware,
    deleteJournal);


export default router;