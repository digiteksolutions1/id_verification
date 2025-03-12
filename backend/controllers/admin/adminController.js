import User from "../../models/user.js";

class userController{
    static async createAdmin(req, res) {
        try{
            const { name, email, type, isActive } = req.body;

            if(!name || !email){
                return res.status(400).json({message: "Name and email are required!"});
            }

            const emailFormatted = email.trim().toLowerCase();
            const existingUser = await User.findOne({ email: emailFormatted });

            if ( existingUser ){
                return res.status(400).json({message: "User with the email already exists! "});
            }

            const admin = new User({
                name,
                email,
                type: type || "admin",
                isActive: isActive != undefined ? isActive : true,
            })

            await admin.save();

            res.status(201).json({message: "Admin created successfully ", admin});

        } catch(error){
            console.log("Error creating admin");
            res.status(500).json({message: "Error creating admin", error})
        }
    }

    static async editAdminStatus(req, res){
        try {
            const { userID } = req.params;

            if (!userID){
                return res.status(400).json({ message: "user ID not found! " });
            }

            const existingUser = await User.findOne({ _id: userID });

            if (!existingUser){
                return res.status(404).json({ message: "User not found! " });
            }

            existingUser.isActive = !existingUser.isActive;
            await existingUser.save();

            res.status(200).json({message: "Admin status updated successfully"});

        } catch (error) {
            console.log("Error changing status of admin! ");
            res.status(500).json({message: "Error changing status of admin ", error});
        }
    }
}

export default userController;
