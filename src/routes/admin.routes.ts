import express from "express";
import { API_ENDPOINTS } from "../constants/app.constant";
import AdminController from "../controllers/admin.controller";
import { authAdmin } from "../middlewares/auth.middleware";

const AdminRoutes = express.Router();
const adminController = new AdminController();

AdminRoutes.route(API_ENDPOINTS.USERS).get(
  // authAdmin(),
  adminController.getAllUsers
);

AdminRoutes.route(API_ENDPOINTS.USERS_BY_ID)
  .get(authAdmin(),adminController.getUserById)
  .delete(authAdmin(),
  adminController.deleteById
);

AdminRoutes.route(API_ENDPOINTS.USER_STATUS).put(
  // authAdmin(),
  adminController.changeUserStatus
);

AdminRoutes.route(API_ENDPOINTS.USER_PENDING_COUNT).get(
  authAdmin(),
  adminController.getPendingUserCount
);

export default AdminRoutes;
