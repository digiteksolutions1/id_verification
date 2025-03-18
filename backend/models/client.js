import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },
    otp_id: { type: mongoose.Schema.Types.ObjectId, ref: "OTP", required: true },

    idDocument: { type: String, required: false},
    addressDocument: { type: String, required: false},

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
