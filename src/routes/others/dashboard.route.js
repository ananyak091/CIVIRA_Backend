import express from "express";
import { getDashboardData, getDashboardFilters,  getCategoryBreakdown, getUrgencyDistribution, getMonthlyComplaints, getResolutionTrend, getTopPerformingWards} from "../../controllers/others/dashboard.controller.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/stats", getDashboardData);
dashboardRouter.get("/filters", getDashboardFilters);
dashboardRouter.get("/category-breakdown", getCategoryBreakdown);
dashboardRouter.get("/urgency-distribution", getUrgencyDistribution);
dashboardRouter.get("/monthly", getMonthlyComplaints);
dashboardRouter.get("/resolution-trend", getResolutionTrend);
dashboardRouter.get("/top-wards", getTopPerformingWards);


export default dashboardRouter;