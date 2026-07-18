import express from "express";

import verifyOfficer from "#src/middlewares/officerAuthMiddelware.js";
import upload from "#src/middlewares/upload.js";

import {
  getAssignedComplaints,
  getComplaintById,
  acceptComplaint,
  rejectComplaint,
  resolveComplaint,
} from "#src/controllers/officer/officer.controller.js";

const officerRouter = express.Router();

// Get all complaints assigned to logged-in officer
officerRouter.get("/assigned-complaints", verifyOfficer, getAssignedComplaints);

// Get single complaint details
officerRouter.get("/complaint/:id", verifyOfficer, getComplaintById);

// Accept complaint
officerRouter.put("/complaint/:id/accept", verifyOfficer, acceptComplaint);

// Reject complaint
officerRouter.put("/complaint/:id/reject", verifyOfficer, rejectComplaint);

// Resolve complaint with proof images
officerRouter.put(
  "/complaint/:id/resolve",
  verifyOfficer,
  upload.array("images", 3),
  resolveComplaint,
);

export default officerRouter;
