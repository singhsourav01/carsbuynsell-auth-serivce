import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";
// import { sendMail, sendSms } from "../api/otp.api";
import {
  API_ERRORS,
  API_RESPONSES,
  EMAIL_OTP_RESPONSE,
  MAX_OTP_ATTEMPTS,
  OTP_EXPIRY,
  PHONE_OTP_RESPONSE,
  STRINGS,
} from "../constants/app.constant";
import EmailRepository from "../repositories/email.repository";
import SmsRepository from "../repositories/sms.repository";
import { updateEmailType } from "../types/email.types";
import { updateSmsType } from "../types/sms.types";
import { generateOtp } from "../utils/helper";
import UserService from "./user.service";
import { users } from "@prisma/client";

class OtpService {
  emailRepository: EmailRepository;
  smsRepository: SmsRepository;
  userService: UserService;
  otpExpiry: number;

  constructor() {
    this.emailRepository = new EmailRepository();
    this.smsRepository = new SmsRepository();
    this.userService = new UserService();
    this.otpExpiry = OTP_EXPIRY;
  }

  sendPhoneOtp = async (
    phone: string,
    country_id?: string,
    user_id?: string,
    type?: string
  ) => {
    let smsOtp = await this.smsRepository.getByPhone(phone);

    // const country = await getCountryById(country_id || "");
    const country = {
      country_id: "1",
      country_name: "India",
      country_phone_code: "+91",
    }
    if (
      smsOtp?.so_created_at &&
      Date.now() - smsOtp?.so_created_at.getTime() < this.otpExpiry &&
      !smsOtp?.so_is_expired
    ) {
      console.log({
        mobile_number: phone,
        country_code: country?.country_phone_code,
        text: `${PHONE_OTP_RESPONSE[type || "default"] || "Your OTP is"} ${smsOtp.so_token
          }.\n${API_RESPONSES.DO_NOT_SHARE}`,
      })
      // await sendSms({
      //   mobile_number: phone,
      //   country_code: country?.country_phone_code,
      //   text: `${PHONE_OTP_RESPONSE[type || "default"] || "Your OTP is"} ${smsOtp.so_token
      //     }.\n${API_RESPONSES.DO_NOT_SHARE}`,
      // });
    } else {
      const otp = generateOtp();
      console.log(otp);
      console.log({
        mobile_number: phone,
        country_code: country?.country_phone_code,
        text: `${PHONE_OTP_RESPONSE["REGISTER"] || "Your OTP is"} ${otp}.\n${API_RESPONSES.DO_NOT_SHARE
          }`,
      })
      // await sendSms({
      //   mobile_number: phone,
      //   country_code: country?.country_phone_code,
      //   text: `${PHONE_OTP_RESPONSE["REGISTER"] || "Your OTP is"} ${otp}.\n${API_RESPONSES.DO_NOT_SHARE
      //     }`,
      // });
      smsOtp = await this.smsRepository.create({
        so_country_code: country?.country_phone_code || "",
        so_receiver: phone,
        so_user_id: user_id,
        so_token: otp,
        so_expires_at: new Date(Date.now() + this.otpExpiry),
      });
    }
    return smsOtp;
  };

  sendEmailOtp = async (
    email: string,
    user_id?: string,
    user_name?: string,
    type?: string
  ) => {
    let emailOtp = await this.emailRepository.getByEmail(email);
    if (
      emailOtp?.eo_created_at &&
      Date.now() - emailOtp?.eo_created_at.getTime() < this.otpExpiry &&
      !emailOtp.eo_is_expired
    ) {
      console.log({
        email: email,
        name: user_name || "",
        body: `${EMAIL_OTP_RESPONSE[type || "default"] || "Your OTP is"} 
        <b>${emailOtp.eo_token}</b>. 
        <br />
        ${API_RESPONSES.DO_NOT_SHARE}`,
        type: "otp",
        subject: STRINGS.ONE_TIME_PASSWORD_FOR_SIGN_UP,
      })
      // await sendMail({
      //   email: email,
      //   name: user_name || "",
      //   body: `${EMAIL_OTP_RESPONSE[type || "default"] || "Your OTP is"} 
      //   <b>${emailOtp.eo_token}</b>. 
      //   <br />
      //   ${API_RESPONSES.DO_NOT_SHARE}`,
      //   type: "otp",
      //   subject: STRINGS.ONE_TIME_PASSWORD_FOR_SIGN_UP,
      // });
    } else {
      const otp = generateOtp();
      console.log(otp);

      // const mail = await sendMail({
      //   email: email,
      //   name: user_name || "",
      //   body: `${EMAIL_OTP_RESPONSE["REGISTER"] || "Your OTP is"} 
      //   <b>${otp}</b>. 
      //   <br />
      //   ${API_RESPONSES.DO_NOT_SHARE}`,
      //   type: "otp",
      //   subject: STRINGS.ONE_TIME_PASSWORD_FOR_SIGN_UP,
      // });
      console.log({
        email: email,
        name: user_name || "",
        body: `${EMAIL_OTP_RESPONSE["REGISTER"] || "Your OTP is"} 
        <b>${otp}</b>. 
        <br />
        ${API_RESPONSES.DO_NOT_SHARE}`,
        type: "otp",
        subject: STRINGS.ONE_TIME_PASSWORD_FOR_SIGN_UP,
      })
      emailOtp = await this.emailRepository.create({
        eo_user_id: user_id,
        eo_sender: "",
        eo_receiver: email,
        eo_token: otp,
      });
    }
    return emailOtp;
  };

  sendPhoneEmailOtp = async (user: users, type?: string) => {
    const country = {
      country_id: "1",
      country_name: "India",
      country_phone_code: "+91",
    }
    const otp = generateOtp();
    console.log({
      mobile_number: user.user_primary_phone,
      country_code: country?.country_phone_code,
      text: `${PHONE_OTP_RESPONSE[type || "default"] || "Your OTP is"
        } ${otp}.\n${API_RESPONSES.DO_NOT_SHARE}`,
    })
    // await sendSms({
    //   mobile_number: user.user_primary_phone,
    //   country_code: country?.country_phone_code,
    //   text: `${PHONE_OTP_RESPONSE[type || "default"] || "Your OTP is"
    //     } ${otp}.\n${API_RESPONSES.DO_NOT_SHARE}`,
    // });
    await this.smsRepository.create({
      so_country_code: country?.country_phone_code || "",
      so_receiver: user.user_primary_phone,
      so_user_id: user.user_id,
      so_token: otp,
    });
    console.log({
      email: user.user_email || "",
      name: user.user_full_name || "",
      body: `${EMAIL_OTP_RESPONSE[type || "default"] || "Your OTP is"} 
      <b>${otp}</b>. 
      <br />
      ${API_RESPONSES.DO_NOT_SHARE}`,
      type: "otp",
      subject: STRINGS.ONE_TIME_PASSWORD_FOR_SIGN_UP,
    })
    // const mail = await sendMail({
    //   email: user.user_email || "",
    //   name: user.user_full_name || "",
    //   body: `${EMAIL_OTP_RESPONSE[type || "default"] || "Your OTP is"} 
    //   <b>${otp}</b>. 
    //   <br />
    //   ${API_RESPONSES.DO_NOT_SHARE}`,
    //   type: "otp",
    //   subject: STRINGS.ONE_TIME_PASSWORD_FOR_SIGN_UP,
    // });
    await this.emailRepository.create({
      eo_user_id: user.user_id,
      eo_sender: "",
      eo_receiver: user.user_email || "",
      eo_token: otp,
    });
    return user;
  };

  updateSms = async (so_id: string, data: updateSmsType) => {
    return await this.smsRepository.update(so_id, data);
  };

  getPhoneOtp = async (phone: string, otp: string) => {
    const phoneOtp = await this.smsRepository.getByPhone(phone);
    if (!phoneOtp) {
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.INVALID_OTP);
    }
    if (phoneOtp.so_is_used) {
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.OTP_ALREADY_USED);
    }
    if (phoneOtp.so_is_expired) {
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.OTP_EXPIRED);
    }
    if (
      phoneOtp.so_expires_at &&
      Date.now() > phoneOtp.so_expires_at.getTime()
    ) {
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.OTP_EXPIRED);
    }
    if (phoneOtp.so_attempts >= MAX_OTP_ATTEMPTS) {
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.MAX_OTP_ATTEMPTS_EXCEEDED);
    }
    // Increment attempts
    await this.smsRepository.incrementAttempts(phoneOtp.so_id);
    if (otp !== phoneOtp.so_token) {
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.INVALID_OTP);
    }
    // Mark as used on success
    await this.smsRepository.update(phoneOtp.so_id, { so_is_used: true });
    return phoneOtp;
  };

  updateEmail = async (eo_id: string, data: updateEmailType) => {
    return await this.emailRepository.update(eo_id, data);
  };

  getEmailOtp = async (email: string, otp: string) => {
    const emailOtp = await this.emailRepository.getByEmail(email);
    if (!emailOtp || otp !== emailOtp?.eo_token || emailOtp?.eo_is_expired) {
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.INVALID_OTP);
    }
    if (
      emailOtp?.eo_created_at &&
      Date.now() - emailOtp?.eo_created_at.getTime() > this.otpExpiry
    )
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.OTP_EXPIRED);
    return emailOtp;
  };
}

export default OtpService;
