import {jwtDecode} from "jwt-decode";

export const setToken = (token) => {
  localStorage.setItem("token", token);
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const removeToken = () => {
  localStorage.removeItem("token");
};

export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Current time in seconds
    if (decodedToken.exp < currentTime) {
      // Token has expired
      localStorage.removeItem("token"); // Optionally clear the token
      return false;
    }
    return true;
  } catch (err) {
    console.error("Invalid token", err);
    localStorage.removeItem("token"); // Clear invalid token
    return false;
  }
};
