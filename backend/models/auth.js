const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    password: { type: String, required: true, trim: true}
  }
);

module.exports = mongoose.model("Auth", UserSchema);
