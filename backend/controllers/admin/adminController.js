import mongoose from "mongoose";
import User from "../../models/user.js";
import AuthSchema from "../../models/auth.js";

class userController {
    static async createAdmin(req, res) {
        const session = await mongoose.startSession(); // Start a session for transaction
        session.startTransaction(); // Begin transaction

        try {
            const { name, email, type, isActive, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ message: "Name, email or password are required!" });
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
}

export default userController;
