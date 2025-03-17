import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema(
  {
    otp_random: { type: String, required: true }, 
    generated_at: { type: Date, default: Date.now }, 
    expires_at: { type: Date, required: true },
    generated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    step: { 
      type: [String], 
      enum: ["ID", "Address", "video"], 
      required: true,
      validate: { 
        validator: function (steps) {
          return steps.length > 0;
        },
        message: "At least one step is required for the OTP."
      } 
    }, 
    generated_for: { 
      type: String, 
      enum: ["manual", "trigger"], 
      required: true,
    }, 
    isValid: { type: Boolean, default: true }, 
    used_at: { type: Date }, 
    last_step: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("OTP", OTPSchema);
