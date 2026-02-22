import express from "express";
import { API_ENDPOINTS } from "../constants/app.constant";
import UserController from "../controllers/user.controller";
import { auth, authUser } from "../middlewares/auth.middleware";
import {
  signUpValidations,
} from "../validations/user.validations";
import { validate } from "../validations/validate";

const UserRoutes = express.Router();
const userController = new UserController();

UserRoutes.route(API_ENDPOINTS.SIGNUP).post(
  userController.signup
);

UserRoutes.route(API_ENDPOINTS.USER_DETAILS).get(userController.getById);

UserRoutes.route(API_ENDPOINTS.SIGNUP).post(userController.verifyPhone);

UserRoutes.route(API_ENDPOINTS.VERIFY_PHONE).post(userController.verifyPhone);

UserRoutes.route(API_ENDPOINTS.VERIFY_EMAIL).post(userController.verifyEmail);

// UserRoutes.route(API_ENDPOINTS.UPDATE_PHONE).post(
//   authUser(),
//   userController.updatePhone
// );

UserRoutes.route(API_ENDPOINTS.UPDATE_PHONE).put(
  // auth(),
  userController.changePhone
);

UserRoutes.route(API_ENDPOINTS.UPDATE_EMAIL).put(
  // auth(),
  userController.changeEmail
);

// UserRoutes.route(API_ENDPOINTS.VERIFY_USER).get(
//   auth(),
//   userController.getVerifyUser
// );

// UserRoutes.route(API_ENDPOINTS.PHONE_USERS).get(userController.getUserByPhone);

export default UserRoutes;
