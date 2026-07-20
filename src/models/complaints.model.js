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
      default: "",
    },

    additionalNotes: {
      type: String,
      default: "",
    },

    // Officer will be assigned later if not available
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Officer",
      default: null,
    },

    complaint_status: {
      type: String,
      enum: [
        "Waiting for Officer",
        "Registered",
        "Pending",
        "In Progress",
        "Resolved",
        "Rejected",
        "Success",
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
