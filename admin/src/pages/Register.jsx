import React, { useState } from "react";
import { signup } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { Button, Input, Typography } from "@material-tailwind/react";
import { toast } from "react-toastify";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await signup(name, email, password);
      toast.success("Signup successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1000);
      toast.success("Signup successful");
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "An error occurred");
      toast.error("Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm"
      >
        <Typography variant="h4" className="font-black text-center mb-1 font-mono">
          Pixel<span className="text-gray-500">Grid</span>
        </Typography>
        <Typography
          variant="h6"
          className=" mb-6 text-center text-gray-500 font-semibold"
        >
          Admin Signup
        </Typography>

        {/* Error and Success Messages
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>} */}

        <div className="mb-6">
          <Input
            type="text"
            value={name}
            variant="standard"
            placeholder="John Doe"
            label="Name"
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <Input
            type="email"
            value={email}
            variant="standard"
            placeholder="example@pixelgrid.com"
            label="Email"
            onChange={(e) => setEmail(e.target.value)}
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
            required
          />
        </div>

        <Button type="submit" className="w-full font-mono tracking-widest" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </Button>
      </form>
    </div>
  );
};

export default Signup;
