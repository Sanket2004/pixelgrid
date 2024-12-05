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
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm flex flex-col items-center justify-center"
      >
        <img
          src="/assets/logo.png"
          alt="PixelGrid Logo"
          className="h-16 w-h-16 mb-4 hover:drop-shadow-xl hover:rotate-45 transition-all cursor-pointer"
        />
        <Typography
          variant="h4"
          className="font-black text-center mb-1 font-mono uppercase"
        >
          Pixel<span className="text-gray-500">Grid</span>
        </Typography>
        <Typography
          variant="h6"
          className=" mb-6 text-center text-gray-500 font-normal font-mono"
        >
          Admin Login
        </Typography>

        <div className="mb-6 w-full">
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
        <div className="mb-6 w-full">
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
        <Button
          type="submit"
          className="w-full font-mono tracking-widest"
          disabled={loading}
        >
          {loading ? "Logging in.." : "Login"}
        </Button>
      </form>
    </div>
  );
};

export default Login;
