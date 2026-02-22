import { INTEGERS } from "../constants/app.constant";
// import { getAllTalents } from "../api/core.api";
import { body } from "express-validator";

export const signUpValidations = [
  body("full_name")
    .notEmpty()
    .withMessage("Full name is required field")
    .isString()
    .withMessage("Full name must be in string format"),
  body("country_id")
    .notEmpty()
    .withMessage("Country id is required field")
    .isString()
    .withMessage("Country id must be string format"),
  body("phone")
    .notEmpty()
    .withMessage("Phone is required field")
    .isString()
    .withMessage("Phone must be in string format"),
  body("email")
    .notEmpty()
    .withMessage("email is required field")
    .isEmail()
    .withMessage("Invalid email address"),
  body("password").notEmpty().withMessage("Password is required field"),
  body("referred_by")
    .optional()
    .isString()
    .withMessage("Referred by must be in string format"),
];

export const createUserByAdmin = [
  // body("talent_ids").notEmpty().withMessage("Talent is required field"),
  // .isArray({ min: 1 })
  // .withMessage("Talents field must be an array")
  // .custom(async (talents) => {
  //   const talentList = (await getAllTalents())?.map((item: any) => {
  //     return item.talent_id;
  //   });
  //   if (!talentList || talentList.length === INTEGERS.ZERO)
  //     throw new Error("Error while fetching talents, Backend error");
  //   talents.forEach((item: string) => {
  //     if (!talentList.includes(item)) throw new Error("Invalid talent id");
  //   });
  // }),
  body("full_name")
    .notEmpty()
    .withMessage("Full name is required field")
    .isString()
    .withMessage("Full name must be in string format"),
  body("phone")
    .notEmpty()
    .withMessage("Phone is required field")
    .isString()
    .withMessage("Phone must be in string format"),
  body("gender").notEmpty(),
];
