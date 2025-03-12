import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },

    idDocument: {
      type: {
        type: String,
        enum: ["NIC", "Passport", "Driver's License"],
        required: false,
      },
      documentUrl: { type: String, required: false },
    },

    addressDocument: {
      type: {
        type: String,
        enum: ["Utility Bill", "Phone Bill", "Bank Statement"],
        required: false,
      },
      documentUrl: { type: String, required: false },
    },

    videoVerification: {
      videoUrl: { type: String, required: false },
      images: {
        front: { type: String, required: false }, 
        left: { type: String, required: false }, 
        right: { type: String, required: false }, 
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Client", ClientSchema);
