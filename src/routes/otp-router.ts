import { Router } from "express";
import { sendOtp, verifyOTP } from "../controllers/otp-controller";

const router = Router();

router.post("/sendOTP",
    sendOtp
);

router.post("/verifyOTP", 
    verifyOTP
);

export default router;