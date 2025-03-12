import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true},
    type: {
        type: String,
        enum: ["admin", "superAdmin"],
        required: false,
        default: "admin"
    },
    isActive: {
      type: Boolean,
      required: false,
      default: true
    }
  }
);

export default mongoose.model("User", UserSchema);
