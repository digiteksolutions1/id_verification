import AuthSchema from "../../models/auth.js";
import User from "../../models/user.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

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

    static async forgetPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: "Email required!" });
            }

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: "User not found for the given email!" });
            }

            let userAuth = await AuthSchema.findOne({ userID: user._id });
            if (!userAuth) {
                return res.status(404).json({ message: "User authentication record not found!" });
            }

            userAuth.generatePasswordResetToken();
            await userAuth.save();

            // Create reset link
            const resetLink = `${process.env.FRONTEND_URL}/reset-password/${userAuth.resetPasswordToken}`;

            // Correct Gmail SMTP settings
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER, // Your Google-hosted email
                    pass: process.env.USER_PASS, // Use App Password
                },
                tls: {
                    rejectUnauthorized: false, // Avoids certificate errors
                },
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: "Password Reset Request",
                text: `Click the following link to reset your password: ${resetLink}`,
            };

            await transporter.sendMail(mailOptions);

            res.status(200).json({ message: "Password reset link sent successfully!" });

        } catch (error) {
            console.error("Failed to send the reset password token!", error);
            res.status(500).json({ message: "Failed to send the reset password token!", error });
        }
    }

    static async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;

            if (!token || !newPassword) {
                return res.status(400).json({ message: "Token and new password are required!" });
            }

            const userAuth = await AuthSchema.findOne({ resetPasswordToken: token });

            if (!userAuth) {
                return res.status(400).json({ message: "Invalid token!" });
            }

            if (userAuth.resetPasswordExpires < Date.now()) {
                return res.status(400).json({ message: "Token has expired. Request a new one!" });
            }

            if (!userAuth.isValid) {
                return res.status(400).json({ message: "Token has already been used!" });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Update the user's password & invalidate token
            await AuthSchema.updateOne(
                { _id: userAuth._id },
                {
                    $set: { password: hashedPassword, isValid: false },
                    $unset: { resetPasswordToken: "", resetPasswordExpires: "" } 
                }
            );

            res.status(200).json({ message: "Password reset successfully!" });

        } catch (error) {
            console.error("Failed to reset password!", error);
            res.status(500).json({ message: "Failed to reset password!", error });
        }
    }
}

export default authController;
