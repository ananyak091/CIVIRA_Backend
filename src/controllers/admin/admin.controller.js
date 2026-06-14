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
export const createOfficer = async (req, res) => {
  try {
    const { officerId, password, wardNo, city, state } = req.body;

    // TODO:
    // Save Officer

    return res.status(201).json({
      success: true,
      message: "Officer Created Successfully",
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
    // TODO:
    // Fetch Officers

    return res.status(200).json({
      success: true,
      officers: [],
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

    // TODO:
    // Delete Officer

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
