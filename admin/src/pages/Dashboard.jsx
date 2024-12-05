import React, { useEffect, useState, useCallback } from "react";
import {
  Spinner,
  Typography,
  Button,
  Tooltip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Textarea,
} from "@material-tailwind/react";
import { fetchUserDetails } from "../api/auth";
import { getToken } from "../utils/auth";
import { toast } from "react-toastify";
import {
  deleteWallpaper,
  fetchWallpapers,
  updateVisibility,
  updateWallpaper,
} from "../api/wallpaper";
import { IoChevronBack, IoChevronForwardOutline } from "react-icons/io5";
import { TbEye, TbEyeOff, TbPhotoEdit, TbTrash } from "react-icons/tb";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

// Utility functions for time formatting
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const updatedAt = new Date(timestamp);
  const diffInSeconds = Math.floor((now - updatedAt) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) return "Updated just now";
  if (diffInMinutes < 60)
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
};

const Dashboard = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const token = getToken();

  // Fetch user details and wallpaper data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userData = await fetchUserDetails(token);
        setUserDetails(userData);

        const { wallpapers, totalPage } = await fetchWallpapers(
          token,
          currentPage
        );
        setWallpapers(wallpapers);
        setTotalPages(totalPage);
      } catch (err) {
        toast.error("Error fetching data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, token]);

  // Open modal to edit wallpaper details
  const openModal = useCallback((wallpaper) => {
    setSelectedWallpaper(wallpaper);
    setIsModalOpen(true);
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedWallpaper(null);
  }, []);

  // Handle wallpaper updates
  const handleUpdateWallpaper = async () => {
    if (!selectedWallpaper) return;

    try {
      await updateWallpaper(selectedWallpaper._id, token, selectedWallpaper);
      toast.success("Wallpaper updated successfully!");
      const { wallpapers } = await fetchWallpapers(token, currentPage);
      setWallpapers(wallpapers);
      closeModal();
    } catch (err) {
      toast.error("Failed to update wallpaper");
      console.error(err);
    }
  };

  // Handle wallpaper deletion
  const handleDelete = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this wallpaper?"
    );
    if (isConfirmed) {
      try {
        await deleteWallpaper(id, token);
        toast.success("Wallpaper deleted successfully!");
        const { wallpapers } = await fetchWallpapers(token, currentPage);
        setWallpapers(wallpapers);
      } catch (err) {
        toast.error("Failed to delete wallpaper");
        console.error(err);
      }
    }
  };

  const handleChangeVisibility = async (id) => {
    try {
      await updateVisibility(id, token);
      toast.success("Visibility updated!");
      const { wallpapers } = await fetchWallpapers(token, currentPage);
      setWallpapers(wallpapers);
    } catch (error) {
      toast.error("Failed to update visibility");
      console.error(error);
    }
  };

  // Pagination handling
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  // Handle input changes for editing wallpaper
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedWallpaper((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="mx-auto py-8">
      {/* User Details */}
      {userDetails && (
        <div className="mb-8">
          <Typography
            variant="h3"
            className="font-bold text-gray-900 font-mono"
          >
            Admin Dashboard
          </Typography>
          <Typography
            variant="paragraph"
            className="text-gray-500 font-semibold"
          >
            Welcome, {userDetails.name.split(" ")[0]}!
          </Typography>
        </div>
      )}

      {/* Wallpapers Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto mt-8">
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-900 text-white text-xs uppercase tracking-wide">
              <th className="border border-gray-300 px-4 py-4 text-left font-mono tracking-wide">
                SL No.
              </th>
              <th className="border border-gray-300 px-4 py-4 text-left font-mono tracking-wide">
                Wallpaper
              </th>
              <th className="border border-gray-300 px-4 py-4 text-left font-mono tracking-wide min-w-56">
                Title
              </th>
              <th className="border border-gray-300 px-4 py-4 text-left font-mono tracking-wide min-w-96">
                Description
              </th>
              <th className="border border-gray-300 px-4 py-4 text-left font-mono tracking-wide">
                Downloads
              </th>
              <th className="border border-gray-300 px-4 py-4 text-left font-mono tracking-wide">
                Published At
              </th>
              <th className="border border-gray-300 px-4 py-4 text-left font-mono tracking-wide">
                Last Updated
              </th>
              <th className="border border-gray-300 px-4 py-4 text-left font-mono tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-8">
                  <div className="w-full flex items-center justify-center">
                    <Spinner />
                  </div>
                </td>
              </tr>
            ) : wallpapers.length > 0 ? (
              wallpapers.map((item, index) => (
                <tr key={item._id} className="odd:bg-white even:bg-gray-50 hover:brightness-95">
                  <td className="border border-gray-300 px-4 py-2">
                    {index + 1 + (currentPage - 1) * 10}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <LazyLoadImage
                      effect="blur"
                      src={item.compressedUrl}
                      className="min-w-20 w-full h-20 object-cover rounded-lg"
                      alt="Wallpaper"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2 min-w-56">
                    {item.title}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 min-w-96">
                    {item.description}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.downloads}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {formatTimeAgo(item.updatedAt)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="flex gap-2">
                      <Tooltip content="Edit">
                        <button
                          onClick={() => openModal(item)}
                          className="h-8 w-8 flex border-2 rounded-xl border-gray-600 text-black items-center justify-center hover:bg-gray-200 transition-all"
                        >
                          <TbPhotoEdit size={16} color="black" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Delete">
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="h-8 w-8 flex border-2 rounded-xl border-gray-600 text-black items-center justify-center hover:bg-gray-200 transition-all"
                        >
                          <TbTrash size={16} color="black" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Visibility">
                        <button
                          onClick={() => handleChangeVisibility(item._id)}
                          className="h-8 w-8 flex border-2 rounded-xl border-gray-600 text-black items-center justify-center hover:bg-gray-200 transition-all"
                        >
                          {item.visibility === false ? (
                            <TbEyeOff size={16} color="black" />
                          ) : (
                            <TbEye />
                          )}
                        </button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  No wallpapers available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {wallpapers.length > 0 && (
        <div className="flex justify-end items-center mt-4 gap-2">
          <Typography variant="paragraph" className="text-gray-700">
            Page {currentPage} of {totalPages}
          </Typography>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`w-8 h-8 flex items-center justify-center border-2 rounded-xl ${
              currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-900"
            }`}
          >
            <IoChevronBack className="text-xl" />
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`w-8 h-8 flex items-center justify-center border-2 rounded-xl ${
              currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-900"
            }`}
          >
            <IoChevronForwardOutline className="text-xl" />
          </button>
        </div>
      )}

      {/* Edit Wallpaper Modal */}
      <Dialog
        size="sm"
        open={isModalOpen}
        handler={setIsModalOpen}
        className="rounded-lg p-4"
      >
        <DialogHeader>
          <Typography variant="h5" className="font-black font-mono">
            Edit Wallpaper Details
          </Typography>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <Input
              label="Title"
              name="title"
              variant="standard"
              size="lg"
              color="black"
              value={selectedWallpaper?.title || ""}
              onChange={handleInputChange}
              required
            />
            <Textarea
              label="Description"
              name="description"
              variant="standard"
              size="lg"
              color="black"
              value={selectedWallpaper?.description || ""}
              onChange={handleInputChange}
              rows={4}
              required
            />
          </div>
        </DialogBody>
        <DialogFooter className="flex justify-end gap-2">
          <Button
            color="red"
            onClick={closeModal}
            size="sm"
            className="font-mono tracking-widest"
          >
            Cancel
          </Button>
          <Button
            color="black"
            onClick={handleUpdateWallpaper}
            size="sm"
            className="font-mono tracking-widest"
          >
            Save
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default Dashboard;
