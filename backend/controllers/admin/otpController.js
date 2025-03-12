import crypto from "crypto";

class OTPController {
  static issuedOTPs = new Set(); 

  static generateOTP(req, res) {
    let otp;
    do {
      otp = crypto.randomInt(100000, 999999).toString(); 
    } while (OTPController.issuedOTPs.has(otp)); 

    OTPController.issuedOTPs.add(otp); 
    setTimeout(() => OTPController.issuedOTPs.delete(otp), 5 * 60 * 1000); 

    res.json({ otp, expiry: Date.now() + 5 * 60 * 1000 });
  }
}

export default OTPController;
