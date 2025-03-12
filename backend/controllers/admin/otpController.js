import crypto from "crypto";
import OTP from "../../models/otpSchema.js";

class OTPController {
  static async generateOTP(req, res) {
    try {
      const step = req.body.step && req.body.step.length > 0 ? req.body.step : ["ID"]; // Default: ["ID"]

      let otp;
      do {
        otp = crypto.randomInt(100000, 999999).toString();
      } while (await OTP.exists({ otp_random: otp }));

      const expiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // OTP expires in 48 hours

      const otpRecord = await OTP.create({
        otp_random: otp,
        expires_at: expiry,
        step,
      });

      res.status(201).json({ otpRecord });
    } catch (error) {
      console.error("Error generating OTP:", error);
      res.status(500).json({ message: "Server error", error });
    }
  }
}

export default OTPController;
