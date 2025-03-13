import { Router } from "express";
import OTPController from "../../controllers/admin/otpController.js";
import userController from "../../controllers/admin/adminController.js";
import authController from "../../controllers/admin/authController.js";

const adminRouter = Router();

adminRouter.post("/generateOTP", OTPController.generateOTP);
adminRouter.get("/getAllOTPs", OTPController.getAllOTPs);
adminRouter.post("/createAdmin", userController.createAdmin);
adminRouter.put("/editAdminStatus", userController.editAdminStatus);
adminRouter.get("/authenticateAdmin", authController.authenticateAdmin);
adminRouter.get("/getAdmins", userController.getAdmins);
adminRouter.delete("/deleteAdmin/:userId", userController.deleteAdmin);

export default adminRouter;
