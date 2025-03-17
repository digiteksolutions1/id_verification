import otpSchema from "../../models/otpSchema.js";

class ClientOTPController {
    static async authenticateOTP(req, res) {
        try {
            const { otp } = req.body;
            if (!otp) {
                return res.status(400).json({ message: "OTP is required" });
            }

            const OTPCollection = await otpSchema.findOne({ otp_random: otp });
            if (!OTPCollection) {
                return res.status(400).json({ message: "Invalid OTP" });
            }
            
            if (OTPCollection.expires_at < Date.now()) {
                OTPCollection.isValid = false;
                await OTPCollection.save();
                return res.status(400).json({ message: "Your OTP has expired ask admin for new one" });
            }

            if (!OTPCollection.isValid) {
                return res.status(400).json({ message: "You have already used this OTP" });
            }

            res.status(200).json({ message: "OTP Verified", otp: OTPCollection });
        } catch (error) {
            console.error("Server Error! ", error);
            res.status(500).json({ message: "Server Error!", error });
        }
    }
}

export default ClientOTPController;
