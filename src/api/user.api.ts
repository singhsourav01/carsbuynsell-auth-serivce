import axios from "axios";

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:8001/user";

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

export const getByPhone = async (phone: string, token?: string) => {
    const { data } = await axios.get(
        `${USER_SERVICE_URL}/users/${phone}`,
        {
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: token }),
            },
        }
    );

    return data?.data;
};

export const getByEmail = async (email: string, token?: string) => {
    const { data } = await axios.get(
        `${USER_SERVICE_URL}/users/${email}`,
        {
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: token }),
            },
        }
    );

    return data?.data;
};