import mongoose from "mongoose";
import bcrypt from "bcrypt";

const schema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
});

//mongoose middleware => before save, if password have modified apply hash on password
schema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) {
    return next();
  }

  try {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
  } catch (error) {
    next(error);
  }
});

schema.set("toJSON", {
  transform: (doc, ret, options) => ({
    _id: ret._id,
    email: ret.email,
    name: ret.name,
    role: ret.role,
  }),
});

const User = mongoose.model("User", schema);

export default User;
