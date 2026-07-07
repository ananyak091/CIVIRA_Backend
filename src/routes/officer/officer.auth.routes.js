import { officerLogin } from "#src/controllers/officer/officer.auth.controller.js";
import express from "express";

const authOfficerRouter = express.Router();

// Login with id & password
authOfficerRouter.post("/login", officerLogin);

export default authOfficerRouter;
