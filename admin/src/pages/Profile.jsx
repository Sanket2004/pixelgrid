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
        const errorMsg = err.response?.data?.message;
        setError(err.message);
        setLoading(false);
        toast.error(errorMsg);
      }
    };

    fetchUD();
  }, [token]);

  if (loading)
    return (
      <div className="text-center py-12 flex justify-center items-center">
        <Spinner />
      </div>
    );
  if (error)
    return <div className="text-center text-red-500 py-12">{error}</div>;

  return (
    <div className="mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-lg shadow text-center max-w-lg mx-auto">
        <Typography
          variant="h4"
          className="font-black mb-6 text-gray-800 font-mono uppercase"
        >
          User Profile
        </Typography>

        <div className="flex items-center mb-6 flex-col sm:flex-row gap-4 justify-center text-left">
          {/* Avatar */}
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center text-white font-semibold font-mono tracking-widest">
            <span className="text-2xl">
              {user.name.split(" ")[0][0] +
                (user.name.split(" ")[1]
                  ? user.name.split(" ")[1][0]
                  : "")}{" "}
            </span>
          </div>
          {/* User Info */}
          <div className="text-center sm:text-left">
            <h3 className="text-2xl font-semibold font-mono">{user.name}</h3>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-gray-400">{user.role}</p>
          </div>
        </div>
        <hr />
        <div className="mt-4">
          <Typography
            variant="h6"
            className="font-semibold text-gray-800 font-mono"
          >
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
