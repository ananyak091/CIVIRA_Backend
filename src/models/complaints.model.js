import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ward: {
      type: String,
      required: true,
    },

    wardNo: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    landmark: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    additionalNotes: {
      type: String,
    },

    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Officer",
      required: true,
    },

    complaint_status: {
      type: String,
      enum: [
        "Registered",
        "Pending",
        "Resolved",
        "Rejected",
        "Success",
        "In Progress",
      ],
      default: "Registered",
    },

    assigned_department: {
      type: String,
      default: null,
    },

    evidenceIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Evidence",
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Complaint = mongoose.model("Complaint", complaintSchema);
