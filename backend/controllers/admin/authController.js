import AuthSchema from "../../models/auth.js";
import User from "../../models/user.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

class authController{
    static async authenticateAdmin(req, res){
        try {
            const { email, password } = req.body;

            if ( !email || !password ){
                return res.status(400).json({ message: "user email or password is missing! "});
            }
            
            const user = await User.findOne({ email });
            if ( !user ){
                return res.status(401).json({ message: "Invalid email! "});
            }

            const auth = await AuthSchema.findOne({ userID: user._id });
            if (!auth) {
                return res.status(401).json({ message: "Authentication record not found!" });
            }
            
            const isMatch = await auth.comparePassword(password);
            if ( !isMatch ){
                return res.status(401).json({ message: "Invalid Password! "});
            }

            const token = jwt.sign({ id: auth.userID, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
            res.status(200).json({message: "Login successful", token});

        } catch (error) {
            console.error("Login failed! ", error);
            res.status(500).json({ message: "Login failed! ", error})
        }
    }
}

export default authController;
