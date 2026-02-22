import { ApiResponse } from "common-microservices-utils";
import express from "express";
import { ContextRunner, body } from "express-validator";
import { StatusCodes } from "http-status-codes";
import { INTEGERS } from "../constants/app.constant";

export const validate = (validations: ContextRunner[]) => {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(
            new ApiResponse(
              StatusCodes.BAD_REQUEST,
              {},
              result.array()?.[INTEGERS?.ZERO]?.msg
            )
          );
      }
    }
    next();
  };
};
