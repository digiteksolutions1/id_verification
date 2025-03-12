import { Router } from "express";
import OTPController from "../../controllers/admin/otpController.js";

const adminRouter = Router();

adminRouter.get("/generateOTP", OTPController.generateOTP);

export default adminRouter;
