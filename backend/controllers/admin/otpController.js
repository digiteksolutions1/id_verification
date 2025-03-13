import crypto from "crypto";
import OTP from "../../models/otpSchema.js";
import AuthController from "./authController.js";
import UserController from "./adminController.js";

class OTPController {
  static async generateOTP(req, res) {
    try {
      const { step, generated_by } = req.body;

      const userType = AuthController.authenticateToken(req.header("Authorization"));

      const isValid = UserController.verifyUserType(userType, res);
      if (!isValid)
        return;

      if (!step || !generated_by) {
        return res.status(400).json({ message: "step or user id is missing!" });
      }

      let otp;
      do {
        otp = crypto.randomInt(100000, 999999).toString();
      } while (await OTP.exists({ otp_random: otp }));

      const expiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // OTP expires in 48 hours

      const otpRecord = await OTP.create({
        otp_random: otp,
        expires_at: expiry,
        generated_by,
        step,
        generated_for: "manual"
      });

      res.status(201).json({ otpRecord });
    } catch (error) {
      console.error("Error generating OTP:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }

  static async getAllOTPs(req, res) {
    try {
      const userType = AuthController.authenticateToken(req.header("Authorization"));

      const isValid = UserController.verifyUserType(userType, res);
      if (!isValid)
        return;

      const otpRecords = await OTP.find();

      if (!otpRecords) {
        res.status(404).json({ message: "No otps found " });
      }

      res.status(200).json({ message: "OTPs found ", data: otpRecords });

    } catch (error) {
      console.error("Error getting otps ", error);
      res.status(500).json({ message: "Error getting otps ", error });
    }
  }
}

export default OTPController;
