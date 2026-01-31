import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    phone: {
      type: String,
      default: null,
    },

    address: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: null, // ✅ FIXED
    },

    dob: {
      type: Date,
      default: Date.now(),
    },

    image: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
