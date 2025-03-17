import { Router } from "express";
const clientRouter = Router();
import ClientOTPController from "../../controllers/client/OTPController.js";
import ClientController from "../../controllers/client/userInfo.js";

clientRouter.put("/authenticateOTP", ClientOTPController.authenticateOTP);
clientRouter.post("/addBio", ClientController.addBio);

export default clientRouter;
