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
clientRouter.post("/livenessCheck", upload.fields([
        { name: "video", maxCount: 1 },
        { name: "front", maxCount: 1 },
        { name: "left", maxCount: 1 },
        { name: "right", maxCount: 1 }
    ]),
    ClientController.livenessCheck
);

export default clientRouter;
