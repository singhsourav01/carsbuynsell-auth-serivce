import axios from "axios";
import { handleAxiosError } from "../utils/helper";

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "https://admin.carsbuynsell.com/api/user";

export const createUser = async (userData: any, token?: string) => {
  const { data } = await axios.post(
    `${USER_SERVICE_URL}/create-user`,
    userData,
    {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: token }),
      },
    }
  );
  return data?.data;
};

export interface RegisterUserDevicePayload {
  uld_user_id: string;
  uld_fcm_token: string;
  uld_device_name: string;
  uld_device_type: "ANDROID" | "IOS" | "WEB";
  uld_access_token: string;
  uld_refresh_token: string;
}

// Persist a user's device + FCM token so the notification service can reach it.
// Sign-in should never fail because device registration failed.
export const registerUserDevice = async (
  device: RegisterUserDevicePayload
): Promise<void> => {
  try {
    await axios.post(`${USER_SERVICE_URL}/user-device`, device, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.log(
      "Failed to register user device:",
      error?.response?.data || error?.message || error
    );
  }
};

export const getUserDetailsByEmailOrPhone = async (user_details: string, token?: string) => {  try {
    const { data } = await axios.get(
      `${USER_SERVICE_URL}/users/details/${user_details}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: token }),
        },
      }
    );

    return data?.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getByPhone = async (phone: string, token?: string) => {
  try {
    const { data } = await axios.get(
      `${USER_SERVICE_URL}/user-phone`,
      {
        params: { phone },
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    return data?.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getByEmail = async (email: string, token?: string) => {
  try {
    const { data } = await axios.get(
      `${USER_SERVICE_URL}/user-email`,
      {
        params: { email },
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    return data?.data;
  } catch (error) {
    handleAxiosError(error);
  }
};


export const sendSms = async (phone: any) => {
  const { data } = await axios.post(
    `${USER_SERVICE_URL}/send-sms`,
    { phoneNumber: phone },
  );
  return data?.data;
};


export const sendEmail = async (email: any) => {
  const { data } = await axios.post(
    `${USER_SERVICE_URL}/send-email`,
    { email },
  );
  return data?.data;
};