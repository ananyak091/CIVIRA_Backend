import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  userId : {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required : true,
  },
  ward : {
    type: String,
    required : true,
  },
  landmark : {
    type: String,
    required : true,
  },
  street : {
    type: String,
    required : true,
  },
  category : {
    type: String,
    required : true,
  },
  description : {
    type: String,
    required : true,
  },
  additionalNotes : {
    type: String,
  },
  complaint_status: {
      type: String,
      enum: ["Registered", "Pending", "Resolved", "Rejected", "Success"],
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
}, {
  timestamps: true,
})

export const Complaint = mongoose.model("Complaint", complaintSchema);
