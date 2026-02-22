import { GetVerificationKey, expressjwt } from "express-jwt";
import { expressJwtSecret } from "jwks-rsa";
import {
  API_ERRORS,
  AUTH_SERVICE,
  JWKS_FOLDER,
  ROLES,
  STRINGS,
} from "../constants/app.constant";
import { NextFunction } from "express";
import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";
import { Role } from "@prisma/client";

export const authUser = () => {
  return (req: any, res: any, next: NextFunction) => {
    return expressjwt({
      secret: expressJwtSecret({
        jwksUri: AUTH_SERVICE + JWKS_FOLDER,
        cache: true,
        rateLimit: true,
      }) as GetVerificationKey,
      algorithms: ["RS256"],
      requestProperty: STRINGS.USER,
    })(req, res, (err: any) => {
      console.log(err);
      if (err)
        next(new ApiError(StatusCodes.UNAUTHORIZED, API_ERRORS.INVALID_TOKEN));
      if (req.user?.role !== Role.USER) {
        return next(
          new ApiError(
            StatusCodes.UNAUTHORIZED,
            API_ERRORS.YOU_DO_NOT_HAVE_PERMISSION
          )
        );
      }
      next();
    });
  };
};

export const authAdmin = () => {
  return (req: any, res: any, next: NextFunction) => {
    return expressjwt({
      secret: expressJwtSecret({
        jwksUri: AUTH_SERVICE + JWKS_FOLDER,
        cache: true,
        rateLimit: true,
      }) as GetVerificationKey,
      algorithms: ["RS256"],
      requestProperty: STRINGS.USER,
    })(req, res, (err) => {
      console.log(err);
      if (err)
        next(new ApiError(StatusCodes.UNAUTHORIZED, API_ERRORS.INVALID_TOKEN));
      if (
        req.user?.role !== ROLES.ADMIN 
      ) {
        return next(
          new ApiError(
            StatusCodes.UNAUTHORIZED,
            API_ERRORS.YOU_DO_NOT_HAVE_PERMISSION
          )
        );
      }
      next();
    });
  };
};


export const auth = () => {
  return (req: any, res: any, next: NextFunction) => {
    return expressjwt({
      secret: expressJwtSecret({
        jwksUri: AUTH_SERVICE + JWKS_FOLDER,
        cache: true,
        rateLimit: true,
      }) as GetVerificationKey,
      algorithms: ["RS256"],
      requestProperty: STRINGS.USER,
    })(req, res, (err: any) => {
      if (err) {
        next(new ApiError(StatusCodes.UNAUTHORIZED, API_ERRORS.INVALID_TOKEN));
      }
      next();
    });
  };
};
