import { users } from "@prisma/client";
import bcrypt from "bcrypt";
import { ApiError } from "common-microservices-utils";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import {
  API_ERRORS,
  JWT_ALGORITHM,
  OTP_DIGITS,
} from "../constants/app.constant";
import axios from "axios";
const secret = fs.readFileSync("./certs/private.pem");

export const queryHandler = async <T>(
  queryPromise: () => Promise<T>
): Promise<T> => {
  try {
    return await queryPromise();
  } catch (error) {
    console.log(error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      API_ERRORS.DATABASE_ERROR
    );
  }
};

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const isPasswordCorrect = async (newPass: string, oldPass: string) => {
  return await bcrypt.compare(newPass, oldPass);
};

export const generateOtp = () => {
  return otpGenerator.generate(OTP_DIGITS, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
};

export const generateAccessToken = (user: users) => {
  // const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY;
  // if (!accessTokenExpiry)
  //   throw new ApiError(
  //     StatusCodes.INTERNAL_SERVER_ERROR,
  //     API_ERRORS.ERROR_CREATING_ACCESS_TOKEN
  //   );
  return jwt.sign(
    {
      user_id: user.user_id,
      email: user.user_email,
      full_name: user.user_full_name,
      phone: user.user_primary_phone,
      role: user.user_role,
    },
    secret,
    {
      expiresIn: "1d",
      algorithm: JWT_ALGORITHM,
    }
  );
};

export const generateRefreshToken = (user: users) => {
  // const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY;
  // if (!refreshTokenExpiry)
  //   throw new ApiError(
  //     StatusCodes.INTERNAL_SERVER_ERROR,
  //     API_ERRORS.ERROR_CREATING_REFRESH_TOKEN
  //   );
  return jwt.sign(
    {
      user_id: user.user_id,
      email: user.user_email,
      full_name: user.user_full_name,
      phone: user.user_primary_phone,
      role: user.user_role,
    },
    secret,
    {
      expiresIn: "7d",
      algorithm: JWT_ALGORITHM,
    }
  );
};

export const getLinkData = (
  currentPage: number,
  pageSize: number,
  count: number,
  apiLink: string,
  query: { [key: string]: [value: string] } = {}
) => {
  const totalPages = Math.ceil(count / pageSize);
  let params = "";
  Object.keys(query)?.map((key) => {
    if (query[key]) params += `&${key}=${query[key]}`;
  });

  const next =
    currentPage < totalPages
      ? `${process.env.SWAGGER_URL}${apiLink}?page=${currentPage + 1
      }&page_size=${pageSize}${params}`
      : null;
  const prev =
    currentPage > 1 && currentPage - 1 < totalPages
      ? `${process.env.SWAGGER_URL}${apiLink}?page=${currentPage - 1
      }&page_size=${pageSize}${params}`
      : null;

  return {
    totalPages: totalPages,
    currentPage: currentPage,
    pageSize: pageSize,
    next: next,
    prev: prev,
  };
};

// Helper function to check if the provided string is a valid phone number
export const isValidPhoneNumber = (phone: string): boolean => {
  // Basic phone number validation pattern (10 digits)
  const phonePattern = /^[0-9]{10}$/;
  return phonePattern.test(phone);
};

// Helper function to check if the provided string is a valid email
export const isValidEmail = (email: string): boolean => {
  // Basic email validation pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

export const getEmailBodyForChangingUserStatus = (reason: string) => {
  return {
    PENDING:
      "Your account verification is pending by the admin side. please wait for the approval",
    APPROVED:
      "Congratulations your account is verified by the admin. You can login now",
    REJECTED: `Dear user you account is rejected by the admin.
    <br/>
    <br/>
     ${reason ? "Reason : " + reason : ""}`,
    BLOCKED: "Your account is blocked by the admin",
    NONE: "",
  };
};

export const handleAxiosError = (error: any) => {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status || 500;
    const message =
      error.response?.data?.message || "User service error";

    throw new ApiError(statusCode, message);
  }

  throw new ApiError(500, "Unexpected error while calling user service");
};