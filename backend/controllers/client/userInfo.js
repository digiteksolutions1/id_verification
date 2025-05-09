import mongoose from "mongoose";
import fs from "fs";
import path from "path";
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
            if (existingUser) {
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

    static async uploadIdDoc(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { otp_Id } = req.body;

            if (!otp_Id || !req.file) {
                return res.status(400).json({ message: "Both otp_Id and an ID document are required!" });
            }

            const client = await Client.findOne({ otp_id: otp_Id }).session(session);
            if (!client) {
                await session.abortTransaction();
                return res.status(404).json({ message: "Client not found!" });
            }

            if (!client.name) {
                await session.abortTransaction();
                return res.status(400).json({ message: "Client name is missing!" });
            }

            const date = new Date();
            const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
                .toString()
                .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

            const sanitizedClientName = client.name.replace(/[^a-zA-Z0-9-_ ]/g, "");
            const clientFolder = path.join("clients", `${sanitizedClientName}`);
            await fs.promises.mkdir(clientFolder, { recursive: true });

            const uniqueFileName = `ID-${formattedDate}-${req.file.originalname}`;
            const filePath = path.join(clientFolder, uniqueFileName);
            await fs.promises.writeFile(filePath, req.file.buffer);

            const otp = await otpSchema.findById(otp_Id).session(session);
            if (otp) {
                otp.last_step = "ID Doc";
                await otp.save({ session });
            }

            client.idDocument = filePath;
            await client.save({ session });

            await session.commitTransaction();
            session.endSession();

            res.status(200).json({ message: "Client ID uploaded successfully!", client, otp });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();

            console.error("Server error!", error);
            res.status(500).json({ message: "Server error!", error: error.message });
        }
    }

    static async uploadAddressProof(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { otp_Id } = req.body;

            if (!otp_Id || !req.file) {
                return res.status(400).json({ message: "Both otp_Id and an address document are required!" });
            }

            const client = await Client.findOne({ otp_id: otp_Id }).session(session);
            if (!client) {
                await session.abortTransaction();
                return res.status(404).json({ message: "Client not found!" });
            }

            if (!client.name) {
                await session.abortTransaction();
                return res.status(400).json({ message: "Client name is missing!" });
            }

            const date = new Date();
            const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
                .toString()
                .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

            const sanitizedClientName = client.name.replace(/[^a-zA-Z0-9-_ ]/g, "");
            const clientFolder = path.join("clients", `${sanitizedClientName}`);
            await fs.promises.mkdir(clientFolder, { recursive: true });

            const uniqueFileName = `Address-${formattedDate}-${req.file.originalname}`;
            const filePath = path.join(clientFolder, uniqueFileName);
            await fs.promises.writeFile(filePath, req.file.buffer);

            const otp = await otpSchema.findById(otp_Id).session(session);
            if (otp) {
                otp.last_step = "Address Proof";
                await otp.save({ session });
            }

            client.addressDocument = filePath;
            await client.save({ session });

            // Commit transaction
            await session.commitTransaction();
            session.endSession();

            res.status(200).json({ message: "Client Address Proof uploaded successfully!", client, otp });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();

            console.error("Server error!", error);
            res.status(500).json({ message: "Server error!", error: error.message });
        }
    }

    static async livenessCheck(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { otp_Id } = req.body;

            if (!otp_Id) {
                return res.status(400).json({ message: "OTP ID is required!" });
            }

            if (!req.files || !req.files.video || !req.files.front || !req.files.left || !req.files.right) {
                return res.status(400).json({ message: "All required files (video, front, left, right) must be uploaded!" });
            }

            const client = await Client.findOne({ otp_id: otp_Id });
            if (!client) {
                await session.abortTransaction();
                return res.status(404).json({ message: "Client not found!" });
            }

            if (!client.name) {
                await session.abortTransaction();
                return res.status(400).json({ message: "Client name is missing!" });
            }

            const date = new Date();
            const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
                .toString()
                .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

            const sanitizedClientName = client.name.replace(/[^a-zA-Z0-9-_ ]/g, "");

            const clientFolder = path.join("clients", sanitizedClientName);
            await fs.promises.mkdir(clientFolder, { recursive: true });

            const videoFile = req.files.video[0];
            const videoPath = path.join(clientFolder, `Video-${formattedDate}-${videoFile.originalname}`);
            await fs.promises.writeFile(videoPath, videoFile.buffer);

            const frontFile = req.files.front[0];
            const leftFile = req.files.left[0];
            const rightFile = req.files.right[0];

            const frontPath = path.join(clientFolder, `Front-${formattedDate}-${frontFile.originalname}`);
            const leftPath = path.join(clientFolder, `Left-${formattedDate}-${leftFile.originalname}`);
            const rightPath = path.join(clientFolder, `Right-${formattedDate}-${rightFile.originalname}`);

            await fs.promises.writeFile(frontPath, frontFile.buffer);
            await fs.promises.writeFile(leftPath, leftFile.buffer);
            await fs.promises.writeFile(rightPath, rightFile.buffer);

            const otp = await otpSchema.findById(otp_Id).session(session);
            if (!otp) {
                await session.abortTransaction();
                return res.status(400).json({ message: "Invalid OTP ID!" });
            }
            otp.last_step = "liveness Proof";
            otp.isValid = false;
            await otp.save({ session });

            // Update client record
            client.videoVerification = {
                videoUrl: videoPath,
                images: {
                    front: frontPath,
                    left: leftPath,
                    right: rightPath
                }
            };

            await client.save({ session });

            await session.commitTransaction();
            session.endSession();
            res.status(200).json({ message: "Video and photos uploaded successfully", client });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();

            console.error("Server error", error);
            res.status(500).json({ message: "Server error", error });
        }
    }
}

export default ClientController;
