import React, { useState } from "react";
import { login } from "../api/auth";
import { setToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { Button, Input, Typography } from "@material-tailwind/react";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState(""); // Use email instead of username
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { token } = await login(email, password); // Pass email to login function
      setToken(token);
      navigate("/dashboard");
      toast.success("Login successful");
      setLoading(false);
    } catch (err) {
      setError("Invalid credentials. Please try again.");
      toast.error("Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm"
      >
        <Typography variant="h4" className="font-black text-center mb-1">
          Pixel<span className="text-gray-500">Grid</span>
        </Typography>
        <Typography
          variant="h6"
          className=" mb-6 text-center text-gray-500 font-semibold"
        >
          Admin Login
        </Typography>

        <div className="mb-6">
          <Input
            type="email"
            value={email}
            variant="standard"
            placeholder="example@pixelgrid.com"
            label="Email"
            onChange={(e) => setEmail(e.target.value)} // Update email state
            required
          />
        </div>
        <div className="mb-6">
          <Input
            type="password"
            value={password}
            variant="standard"
            placeholder="Password"
            label="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
            required
          />
        </div>
        <Button type="submit" className="w-full">
          {loading ? "Logging.." : "Login"}
        </Button>
      </form>
    </div>
  );
};

export default Login;
