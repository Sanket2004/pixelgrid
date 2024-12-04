import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchUserDetails } from "../api/auth";
import { getToken } from "../utils/auth";
import { Spinner, Typography } from "@material-tailwind/react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = getToken();

  useEffect(() => {
    // Fetch user details from the API
    const fetchUD = async () => {
      try {
        const data = await fetchUserDetails(token); // Await the API response
        setUser(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        toast.error("Failed to load profile");
      }
    };

    fetchUD();
  }, [token]);

  if (loading) return <div className="text-center py-12 flex justify-center items-center"><Spinner/></div>;
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>;

  return (
    <div className="mx-auto py-12">
      <div className="bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-black mb-6 text-gray-800">User Profile</h2>

        <div className="flex items-center space-x-6 mb-6">
          <div className="w-24 h-24 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold">
            <span className="text-2xl">{user.name[0]}</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-gray-500">{user.role}</p>
          </div>
        </div>
<hr/>
        <div className="mt-4">
          <Typography variant="h6" className="font-semibold text-gray-800">
            Additional Information
          </Typography>
            <Typography variant="small" color="gray">
              Account created at: {new Date(user.createdAt).toLocaleString()}
            </Typography>
        </div>
      </div>
    </div>
  );
};

export default Profile;
