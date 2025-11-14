import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: "0000000000" },
  department: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ["user", "admin", "superadmin"] },
  resetPasswordToken: String,
  resetPasswordExpiresAt: Date,
  verificationToken: String,
  verificationTokenExpiresAt: Date, 
});

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;
