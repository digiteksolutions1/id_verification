import mongoose from "mongoose";
import User from "../../models/user.js";
import AuthSchema from "../../models/auth.js";
import AuthController from "./authController.js";

class userController {
    static async createAdmin(req, res) {
        const session = await mongoose.startSession(); // Start a session for transaction
        session.startTransaction(); // Begin transaction

        try {
            const { name, email, type, isActive, password } = req.body;
            const userType = AuthController.authenticateToken(req.header("Authorization"));

            const isValid = userController.verifyUserType(userType, res);
            if (!isValid)
                return;

            if (!name || !email || !password) {
                return res.status(400).json({ message: "Name, email or password are required!" });
            }

            if (password.length < 8) {
                return res.status(400).json({ message: "Password length can't be less than 8" });
            }

            const emailFormatted = email.trim().toLowerCase();
            const existingUser = await User.findOne({ email: emailFormatted }).session(session);

            if (existingUser) {
                await session.abortTransaction(); // Rollback
                session.endSession();
                return res.status(400).json({ message: "User with the email already exists!" });
            }

            const admin = new User({
                name,
                email: emailFormatted,
                type: type || "admin",
                isActive: isActive !== undefined ? isActive : true,
            });

            const auth = new AuthSchema({
                userID: admin._id,
                password: password,
            });

            await admin.save({ session });
            await auth.save({ session });

            await session.commitTransaction(); // Commit transaction
            session.endSession();

            res.status(201).json({ message: "Admin created successfully", admin });
        } catch (error) {
            await session.abortTransaction(); // Rollback changes on error
            session.endSession();
            console.log("Error creating admin:", error);
            res.status(500).json({ message: "Error creating admin", error });
        }
    }

    static async editAdminStatus(req, res) {
        try {
            const { email } = req.body;
            const userType = AuthController.authenticateToken(req.header("Authorization"));

            const isValid = userController.verifyUserType(userType, res);
            if (!isValid)
                return;

            if (!email) {
                return res.status(400).json({ message: "email not found! " });
            }

            const existingUser = await User.findOne({ email });

            if (!existingUser) {
                return res.status(404).json({ message: "User not found! " });
            }

            existingUser.isActive = !existingUser.isActive;
            await existingUser.save();

            res.status(200).json({ message: "Admin status updated successfully" });

        } catch (error) {
            console.log("Error changing status of admin! ");
            res.status(500).json({ message: "Error changing status of admin ", error });
        }
    }

    static async getAdmins(req, res) {
        try {
            const userType = AuthController.authenticateToken(req.header("Authorization"));

            const isValid = userController.verifyUserType(userType, res);
            if (!isValid)
                return;

            const admins = await User.find();

            if (!admins) {
                return res.status(404).json({ message: "No data found " });
            }

            res.status(200).json({ message: "All admins got successfully!", admins });
        } catch (error) {
            console.log("Error getting admins! ");
            res.status(500).json({ message: "Error getting admins!", error });
        }
    }

    static async deleteAdmin(req, res) {
        const session = await mongoose.startSession(); // Start a session for transaction
        session.startTransaction();
        try {
            const userType = AuthController.authenticateToken(req.header("Authorization"));

            const isValid = userController.verifyUserType(userType, res);
            if (!isValid)
                return;

            const { userId } = req.params;
            const admin = await User.findOne({ _id: userId }).session(session);

            if (!admin) {
                await session.abortTransaction(); // Rollback changes
                session.endSession();
                return res.status(404).json({ message: "No admin found with the User Id!" });
            }

            await User.deleteOne({ _id: userId }).session(session);
            await AuthSchema.deleteOne({ userID: userId }).session(session);

            await session.commitTransaction(); // Commit transaction
            session.endSession();

            res.status(200).json({ message: "Admin deleted successfully!" });
        } catch (error) {
            await session.abortTransaction(); // Rollback on failure
            session.endSession();

            console.log("Failed tp delete admin!");
            res.status(500).json({ message: "Failed tp delete admin!", error });
        }
    }

    static verifyUserType(userType, res) {
        if (!userType) {
            res.status(401).json({ message: "Unauthorized: Invalid or missing token" });
            return false;
        }

        if (userType !== "superAdmin") {
            res.status(403).json({ message: "Access denied" });
            return false;
        }

        return true;
    }
}

export default userController;
