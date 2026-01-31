import mongoose from "mongoose";

const evidenceSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
    },

    image_url: {
      type: String,
      required: true,
    },

    uploaded_at: {
      type: Date,
      default: Date.now,
    },

    type: {
      type: String,
      enum: ["citizen", "officer"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Evidence", evidenceSchema);