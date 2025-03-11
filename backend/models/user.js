const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true},
    type: {
        type: String,
        enum: ["admin", "superAdmin"],
        required: true,
    }
  }
);

module.exports = mongoose.model("User", UserSchema);
