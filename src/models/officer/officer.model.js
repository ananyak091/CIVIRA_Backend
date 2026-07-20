import mongoose from "mongoose";

const officerSchema = new mongoose.Schema(
  {
    officerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    intialPassword: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    wardNo: {
      type: Number,
      required: true,
    },

    role: {
      type: String,
      default: "officer",
    },

    // Officer Status
    status: {
      type: String,
      enum: ["Active", "Suspended"],
      default: "Active",
    },

    isFirstLogin: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Only ONE ACTIVE officer per ward
officerSchema.index(
  {
    state: 1,
    city: 1,
    wardNo: 1,
    status: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: "Active",
    },
  },
);

const Officer = mongoose.model("Officer", officerSchema);

export default Officer;
