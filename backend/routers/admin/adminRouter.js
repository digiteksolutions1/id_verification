import { Router } from "express";
import OTPController from "../../controllers/admin/otpController.js";
import userController from "../../controllers/admin/adminController.js";

const adminRouter = Router();

adminRouter.get("/generateOTP", OTPController.generateOTP);
adminRouter.get("/createAdmin", userController.createAdmin);
adminRouter.get("/editAdminStatus", userController.editAdminStatus);

export default adminRouter;
