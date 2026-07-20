import { Complaint } from "../../models/complaints.model.js";

export const getDashboardData = async (req, res) => {
  try {
    const { state, city, ward, time } = req.query;

    console.log("Query:", req.query);

    const filter = {};

    // State Filter
    if (state && state !== "All") {
      filter.state = state;
    }

    // City Filter
    if (city && city !== "All") {
      filter.city = city;
    }

    // Ward Filter
    if (ward && ward !== "All") {
      filter.ward = ward;
    }

    // Time Filter
    if (time && time !== "All") {
      const currentDate = new Date();
      const startDate = new Date();

      if (time === "7") {
        startDate.setDate(currentDate.getDate() - 7);
      }

      if (time === "30") {
        startDate.setDate(currentDate.getDate() - 30);
      }

      if (time === "90") {
        startDate.setDate(currentDate.getDate() - 90);
      }

      if (time === "365") {
        startDate.setDate(currentDate.getDate() - 365);
      }

      filter.createdAt = {
        $gte: startDate,
      };
    }

    console.log("Filter:", filter);
    const complaints = await Complaint.find().select("complaint_status");

complaints.forEach((c, i) => {
  console.log(i + 1, c.complaint_status);
});

    const totalComplaints = await Complaint.countDocuments(filter);
console.log("Total =", totalComplaints);

const pending = await Complaint.countDocuments({
  ...filter,
  complaint_status: "Pending",
});
console.log("Pending =", pending);

const resolved = await Complaint.countDocuments({
  ...filter,
  complaint_status: "Resolved",
});
console.log("Resolved =", resolved);

const inProgress = await Complaint.countDocuments({
  ...filter,
  complaint_status: "In Progress",
});
console.log("In Progress =", inProgress);

console.log(await Complaint.find().limit(5));

    const resolutionRate =
      totalComplaints === 0
        ? 0
        : Number(((resolved / totalComplaints) * 100).toFixed(1));

    res.status(200).json({
      success: true,
      summary: {
        totalComplaints,
        pending,
        resolved,
        inProgress,
        resolutionRate,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// Dashboard Filters
export const getDashboardFilters = async (req, res) => {
  try {
    const { state, city } = req.query;

    // States
    const states = await Complaint.distinct("state");

    // Cities (filter by state if selected)
    const cities = await Complaint.distinct(
      "city",
      state && state !== "All" ? { state } : {}
    );

    // Wards (filter by state & city if selected)
    const wardFilter = {};

    if (state && state !== "All") {
      wardFilter.state = state;
    }

    if (city && city !== "All") {
      wardFilter.city = city;
    }

    const wards = await Complaint.distinct("ward", wardFilter);

    res.status(200).json({
      success: true,
      filters: {
        states,
        cities,
        wards,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


// Category Breakdown (Pie Chart)
export const getCategoryBreakdown = async (req, res) => {
  try {
    const { state, city, ward, time } = req.query;

    const filter = {};

    // State Filter
    if (state && state !== "All") {
      filter.state = state;
    }

    // City Filter
    if (city && city !== "All") {
      filter.city = city;
    }

    // Ward Filter
    if (ward && ward !== "All") {
      filter.ward = ward;
    }

    // Time Filter
    if (time && time !== "All") {
      const currentDate = new Date();
      const startDate = new Date();

      if (time === "7") {
        startDate.setDate(currentDate.getDate() - 7);
      } else if (time === "30") {
        startDate.setDate(currentDate.getDate() - 30);
      } else if (time === "90") {
        startDate.setDate(currentDate.getDate() - 90);
      } else if (time === "365") {
        startDate.setDate(currentDate.getDate() - 365);
      }

      filter.createdAt = {
        $gte: startDate,
      };
    }

    const categoryData = await Complaint.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      categoryData,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getUrgencyDistribution = async (req, res) => {
  try {
    const { state, city, ward, time } = req.query;

    const filter = {};

    if (state && state !== "All") filter.state = state;
    if (city && city !== "All") filter.city = city;
    if (ward && ward !== "All") filter.ward = ward;

    if (time && time !== "All") {
      const startDate = new Date();

      if (time === "7") startDate.setDate(startDate.getDate() - 7);
      if (time === "30") startDate.setDate(startDate.getDate() - 30);
      if (time === "90") startDate.setDate(startDate.getDate() - 90);
      if (time === "365") startDate.setDate(startDate.getDate() - 365);

      filter.createdAt = {
        $gte: startDate,
      };
    }

    const urgencyData = await Complaint.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: "$urgency",   // <-- your field name
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    res.json({
      success: true,
      urgencyData,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getMonthlyComplaints = async (req, res) => {
  try {
    const { state, city, ward } = req.query;

    const filter = {};

    if (state && state !== "All") {
      filter.state = state;
    }

    if (city && city !== "All") {
      filter.city = city;
    }

    if (ward && ward !== "All") {
      filter.ward = ward;
    }

    const monthlyData = await Complaint.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          complaints: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    const months = [
      "",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const result = monthlyData.map((item) => ({
      month: `${months[item._id.month]} ${item._id.year}`,
      complaints: item.complaints,
    }));

    res.status(200).json({
      success: true,
      monthlyData: result,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getResolutionTrend = async (req, res) => {
  try {
    const data = await Complaint.aggregate([
      {
        $match: {
          complaint_status: "Resolved"
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$updatedAt" },
          },
          resolved: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.month": 1,
        },
      },
    ]);

    const months = [
      "",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const result = data.map((item) => ({
      month: months[item._id.month],
      resolved: item.resolved,
    }));

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTopPerformingWards = async (req, res) => {
  try {
    const { state, city, time } = req.query;

    const filter = {};

    if (state && state !== "All") filter.state = state;
    if (city && city !== "All") filter.city = city;

    if (time && time !== "All") {
      const startDate = new Date();

      if (time === "7") startDate.setDate(startDate.getDate() - 7);
      else if (time === "30") startDate.setDate(startDate.getDate() - 30);
      else if (time === "90") startDate.setDate(startDate.getDate() - 90);
      else if (time === "365") startDate.setDate(startDate.getDate() - 365);

      filter.createdAt = {
        $gte: startDate,
      };
    }

    const topWards = await Complaint.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: {
            state: "$state",
            city: "$city",
            ward: "$ward",
          },
          total: {
            $sum: 1,
          },
          resolved: {
            $sum: {
              $cond: [
                {
                  $eq: ["$complaint_status", "Resolved"],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          state: "$_id.state",
          city: "$_id.city",
          ward: "$_id.ward",
          total: 1,
          resolved: 1,
          rate: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: ["$resolved", "$total"],
                  },
                  100,
                ],
              },
              1,
            ],
          },
        },
      },
      {
        $sort: {
          rate: -1,
          resolved: -1,
          total: -1,
        },
      },
      {
        $limit: 5,
      },
    ]);

    const result = topWards.map((ward, index) => ({
      rank: index + 1,
      ...ward,
    }));

    res.status(200).json({
      success: true,
      topWards: result,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};