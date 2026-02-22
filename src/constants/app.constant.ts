import { ApprovalStatus } from "@prisma/client";

export const PORT = 8000;

export const JWT_ALGORITHM = "RS256";

export const API_ENDPOINTS = {
  STAR: "*",
  BASE: "/auth",
  SIGNUP: "/signup",
  USER_DETAILS: "/user-detail/:user_id",
  SIGN_IN: "/signin",
  SING_IN_OTP: "/signin/otp",
  SEND_PHONE_OTP: "/send-phone-otp",
  SEND_EMAIL_OTP: "/send-email-otp",
  SEND_PHONE_EMAIL_OTP: "/send-phone-email-otp",
  UPDATE_PHONE: "/update-phone",
  UPDATE_EMAIL: "/update-email",
  VERIFY_PHONE: "/verify-phone",
  VERIFY_EMAIL: "/verify-email",
  VERIFY_USER: "/verify-user",
  FORGET_PASSWORD: "/forget-password",
  RESET_PASSWORD: "/reset-password",
  LOGOUT: "/logout/:uld_id",
  USERS: "/admin/users",
  USERS_BY_ID: "/admin/users/:user_id",
  USER_STATUS: "/admin/users/status/:user_id",
  USER_PENDING_COUNT: "/admin/count/pending-users",

  REFRESH_TOKEN: "/refresh-token",
  PHONE_USERS: "/phone-users",
};

export const API_RESPONSES = {
  SIGN_UP: "Sign up successful. Please verify your phone and email address",
  EMAIL_VERIFIED: "Email verified successfully",
  PHONE_VERIFIED: "Phone verified successfully",
  OTP_SEND: "Otp has been successfully sent",
  PASSWORD_UPDATED: "Password updated successfully",
  USER_FETCHED: "User data fetched successfully.",
  USER_STATUS_UPDATED: "User status updated successfully",
  USER_VERIFICATION_REQUESTED:
    "Your profile verification request has been sent, please wait for admin action",
  LOGIN_SUCCESSFUL: "Login successful!",
  USER_DELETED: "User deleted successfully",
  LOG_OUT_SUCCESSFULLY: "Log out successfully",
  TOKEN_UPDATED_SUCCESSFULLY: "Token updated successfully",
  DO_NOT_SHARE: "Please do not share this with anyone.",
};

export const SIGN_IN_RESPONSE = {
  [ApprovalStatus.APPROVED]: "Sign in successful!",
  [ApprovalStatus.PENDING]:
    "Your profile is under review, please wait for approval.",
  [ApprovalStatus.REJECTED]:
    "Your account is rejected by the admin. please fill verification form again with valid details",
  [ApprovalStatus.BLOCKED]:
    "Your account is blocked by the admin. you can appeal for to unblock your account",
};

export const API_ERRORS = {
  ROUTE_NOT_FOUND: "Route not found",
  ADMIN_APPROVAL_PENDING: "Your profile is under review, please wait for approval.",
  USER_REJECTED: "Your account is rejected by the admin. please fill verification form again with valid details",
  USER_BLOCKED: "Your account is blocked by the admin. you can appeal for to unblock your account",
  UNAUTHORIZED: "Unauthorized. please provide valid token",
  ALL_FIELDS_REQUIRED: "All field are required",
  DATABASE_ERROR: "Database error",
  USER_ALREADY_EXIST: "User already exist with same phone and email",
  USER_ALREADY_EXIST_SAME_PHONE: "User already exist with same phone",
  USER_ALREADY_EXIST_SAME_EMAIL: "User already exist with same email",
  USER_DOES_NOT_EXIST: "User does not exist",
  INVALID_OTP: "Invalid otp",
  OTP_EXPIRED: "Otp has been expired",
  ERROR_CREATING_ACCESS_TOKEN: "Error while creating access token",
  ERROR_CREATING_REFRESH_TOKEN: "Error while creating refresh token",
  USERS_NOT_FOUND: "Users not found",
  INVALID_CREDENTIALS: "Invalid credentials",
  ERROR_WHILE_AUTHORIZING: "Error while authorizing user",
  YOU_DO_NOT_HAVE_PERMISSION: "You don't have permissions for this action",
  INVALID_TOKEN: "Invalid token or token is expired.",
  LOGIN_WITH_PASSWORD_OPTION_NOT_AVAILABLE:
    "Login with password option is unavailable for this account. please login with OTP",
  SEND_PROPER_JSON: "Please send proper JSON data",
  INVALID_ULD_ID: "Invalid uld_id",
  ERROR_CHANGING_STATUS: "Error while changing user status",
  USER_DELETED: "User has been deleted.",
  PHONE_EMAIL_VERIFIED:
    "Phone number and email have been verified. Please log in",
};

export const INTEGERS = {
  ZERO: 0,
  ONE: 1,
};

export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
};

export const OTP_EXPIRY = 5 * 60 * 1000;

export const OTP_DIGITS = 6;

export const STRINGS = {
  ALL: "all",
  ONE_TIME_PASSWORD_FOR_SIGN_UP: "One Time Password for Sign Up",
  SERVER_LISTENING_ON_PORT: "Server is listening on port",
  RS256: "RS256",
  USER: "user",
  EXIT: "exit",
  SIGINT: "SIGINT",
  SIGUSR1: "SIGUSR1",
  SIGUSR2: "SIGUSR2",
  SIGTERM: "SIGTERM",
  UNCAUGHT_EXCEPTION: "uncaughtException",
};

export const PHONE_OTP_RESPONSE: { [key: string]: string } = {
  REGISTER:
    "Thank you for registering Abc.The OTP for verifying your mobile number is",
  SIGNIN: "The OTP for logging into the Abc app is",
  default: "Your OTP is",
};

export const EMAIL_OTP_RESPONSE: { [key: string]: string } = {
  REGISTER:
    "Thank you for registering Abc.The OTP for verifying your email is",
  SIGNIN: "The OTP for logging into the Abc app is",
  default: "Your OTP is",
};

export const AUTH_SERVICE = `${process.env.API_URL}/auth`;

export const JWKS_FOLDER = "/.well-known/jwks.json";
