import { ApiError } from "common-microservices-utils";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import { API_ERRORS } from "../constants/app.constant";

export const catchErrors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  return next(
    new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.ALL_FIELDS_REQUIRED)
  );
};
