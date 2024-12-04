import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data; // Contains token
};

export const signup = async (name, email, password) => {
  const response = await axios.post(`${API_URL}/signup`, {
    name,
    email,
    password,
  });
  return response.data;
};

export const fetchUserDetails = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/details`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (err) {
    console.error("Error fetching user details:", err);
    throw err;
  }
};