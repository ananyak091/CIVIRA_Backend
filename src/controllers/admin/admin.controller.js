import Officer from "#src/models/officer/officer.model.js";
import bcrypt from "bcryptjs";

/**
 * @desc Dashboard Analytics
 * @route GET /api/admin/dashboard
 */
export const getDashboard = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Dashboard Data",
      data: {},
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * @desc Create Officer
 * @route POST /api/admin/create-officer
 */

export const checkWardAvailability = async (req, res) => {
  try {
    const { state, city, wardNo } = req.query;

    const officer = await Officer.findOne({
      state,
      city,
      wardNo,
    });

    if (officer) {
      return res.json({
        success: true,
        available: false,
        message: "Officer already assigned to this ward.",
      });
    }

    return res.json({
      success: true,
      available: true,
      message: "Ward is available.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const createOfficer = async (req, res) => {
  try {
    const { wardNo, city, state } = req.body;

    // Validate
    if (!wardNo || !city || !state) {
      return res.status(400).json({
        success: false,
        message: "State, City and Ward Number are required.",
      });
    }

    // Check if an officer already exists for this ward
    const existingOfficer = await Officer.findOne({
      state,
      city,
      wardNo,
    });

    if (existingOfficer) {
      return res.status(400).json({
        success: false,
        message: "An officer is already assigned to this ward.",
      });
    }

    // Generate Officer ID
    const officerId = `OFF-${state.substring(0, 2).toUpperCase()}-${city
      .substring(0, 3)
      .toUpperCase()}-${wardNo}`;

    // Generate Temporary Password
    const tempPassword = Math.random().toString(36).slice(-8);

    // Hash Password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Save Officer
    const officer = await Officer.create({
      officerId,
      password: hashedPassword,
      intialPassword: tempPassword,
      wardNo,
      city,
      state,
    });

    return res.status(201).json({
      success: true,
      message: "Officer Created Successfully",
      officerId,
      password: tempPassword, // Send once so the admin can note it down
      officer,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * @desc Get All Officers
 * @route GET /api/admin/officers
 */

export const getAllOfficers = async (req, res) => {
  try {
    const officers = await Officer.find()
      .sort({ createdAt: -1 })
      .select("officerId intialPassword wardNo city state createdAt updatedAt");

    return res.status(200).json({
      success: true,
      officers,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * @desc Update Officer
 * @route PUT /api/admin/officers/:id
 */
export const updateOfficer = async (req, res) => {
  try {
    const { id } = req.params;

    // TODO:
    // Update Officer

    return res.status(200).json({
      success: true,
      message: "Officer Updated Successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * @desc Delete Officer
 * @route DELETE /api/admin/officers/:id
 */

export const deleteOfficer = async (req, res) => {
  try {
    const { id } = req.params;

    const officer = await Officer.findById(id);

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Officer not found",
      });
    }

    await Officer.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Officer Deleted Successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
