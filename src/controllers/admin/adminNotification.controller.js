import AdminNotification from "#src/models/admin/adminNotification.model.js";

export const createAdminNotification = async ({
  complaintId = null,
  title,
  message,
}) => {
  try {
    await AdminNotification.create({
      complaintId,
      title,
      message,
    });
  } catch (error) {
    console.error("Create Admin Notification Error:", error);
  }
};

export const getAdminNotifications = async (req, res) => {
  try {
    console.log("inside Admin notifications................................");
    const notifications = await AdminNotification.find()
      .populate("complaintId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const markAdminNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await AdminNotification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    notification.isRead = true;

    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getUnreadAdminNotificationCount = async (req, res) => {
  try {
    const count = await AdminNotification.countDocuments({
      isRead: false,
    });

    console.log("cnttttttttttttttt", count);
    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteAdminNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await AdminNotification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    await AdminNotification.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
