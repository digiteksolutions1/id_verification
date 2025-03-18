import { Router } from "express";
import ClientOTPController from "../../controllers/client/OTPController.js";
import ClientController from "../../controllers/client/userInfo.js";
import multer from "multer";

const upload = multer();
const clientRouter = Router();

clientRouter.put("/authenticateOTP", ClientOTPController.authenticateOTP);
clientRouter.post("/addBio", ClientController.addBio);
clientRouter.post("/uploadIdDoc", upload.single("idDoc"), ClientController.uploadIdDoc);
clientRouter.post("/uploadAddressProof", upload.single("addressDoc"), ClientController.uploadAddressProof);

export default clientRouter;
