import axios from "axios";
import { handleAxiosError } from "../utils/helper";

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://13.201.55.131:3001/user";

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

export const getUserDetailsByEmailOrPhone = async (user_details: string, token?: string) => {
  try {
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