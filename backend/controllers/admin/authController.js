import AuthSchema from "../../models/auth.js";
import User from "../../models/user.js";
import jwt, { decode } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

class authController {
    static async authenticateAdmin(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: "user email or password is missing! " });
            }

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: "Invalid email! " });
            }

            const auth = await AuthSchema.findOne({ userID: user._id });
            if (!auth) {
                return res.status(401).json({ message: "Authentication record not found!" });
            }

            const isMatch = await auth.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid Password! " });
            }

            const token = jwt.sign({ id: auth.userID, email: user.email, type: user.type }, process.env.JWT_SECRET, { expiresIn: "1h" });

            // Set token in HTTP-only cookie
            res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "Strict",
                maxAge: 3600000
            });

            res.status(200).json({ message: "Login successful" });

        } catch (error) {
            console.error("Login failed! ", error);
            res.status(500).json({ message: "Login failed! ", error })
        }
    }

    static authenticateToken(header) {
        const authHeader = header;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        const token = authHeader.split(" ")[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return decoded.type;
        } catch (error) {
            return null;
        }
    }
}

export default authController;
