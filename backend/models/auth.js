import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

const AuthSchema = new mongoose.Schema(
  {
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    password: { type: String, required: true, trim: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    isValid: { type: Boolean, default: true }
  },
  { timestamps: true } 
);

// Hash password before saving
AuthSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Skip if password isn't modified

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare password during login
AuthSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (err) {
    console.error("Error comparing passwords:", err);
    return false; // Return false on error
  }
};

// Generate a reset token
AuthSchema.methods.generatePasswordResetToken = function () {
    this.resetPasswordToken = crypto.randomBytes(32).toString("hex");
    this.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
};

export default mongoose.model("Auth", AuthSchema);
