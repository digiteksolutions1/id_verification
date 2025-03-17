import Client from "../../models/client.js";
import otpSchema from "../../models/otpSchema.js";

class ClientController {
    static async addBio(req, res) {
        try {
            const { name, dob, otp_ID } = req.body;

            if (!name || !dob || !otp_ID) {
                return res.status(400).json({ message: "Name, DOB, and OTP ID are required" });
            }

            const [year, month, day] = dob.split(/[-/]/).map(Number);
            if (!year || !month || !day) {
                return res.status(400).json({ message: "Invalid DOB format. Use YYYY/MM/DD or YYYY-MM-DD" });
            }

            const formattedDob = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

            if (isNaN(formattedDob.getTime())) {
                return res.status(400).json({ message: "Invalid DOB format. Ensure it's a valid date." });
            }

            const otpExists = await otpSchema.findById(otp_ID);
            if (!otpExists) {
                return res.status(400).json({ message: "OTP not found" });
            }

            const existingUser = await Client.findOne({ otp_id: otp_ID });
            if(existingUser){
                return res.status(200).json({ message: "User already exists!", existingUser });
            }

            const user = await Client.create({
                name,
                dob: formattedDob, 
                otp_id: otp_ID
            });

            res.status(201).json({ message: "User created successfully", user });

        } catch (error) {
            console.error("Server Error", error);
            res.status(500).json({ message: "Server error", error });
        }
    }
}

export default ClientController;
