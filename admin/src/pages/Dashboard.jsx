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
  Chip,
  Select,
  Option,
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
  const [tags, setTags] = useState([]); // Tags for the wallpaper
  const [inputTag, setInputTag] = useState(""); // Current input tag
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
        const errorMsg = err.response?.data?.message;
        toast.error(errorMsg);
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
    setTags(wallpaper.tags || []);
    setIsModalOpen(true);
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedWallpaper(null);
  }, []);

  // Handle updating wallpaper
  const handleUpdateWallpaper = async () => {
    if (!selectedWallpaper) return;

    try {
      const updatedData = {
        ...selectedWallpaper,
        tags,
      };

      // Replace `updateWallpaperAPI` with your actual API call function
      const response = await updateWallpaper(
        selectedWallpaper._id,
        token,
        updatedData
      );

      toast.success("Wallpaper updated successfully");
      const { wallpapers } = await fetchWallpapers(token, currentPage);
      setWallpapers(wallpapers);
      closeModal();
      // Optionally refresh the wallpapers list
    } catch (error) {
      console.error("Error updating wallpaper:", error);
      toast.error(
        error.message || "An error occurred while updating wallpaper"
      );
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
        const errorMsg = err.response?.data?.message;
        toast.error(errorMsg);
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
      const errorMsg = error.response?.data?.message;
      toast.error(errorMsg);
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

  // Handle adding a new tag
  const handleAddTag = (e) => {
    const value = inputTag.trim();
    if ((e.key === " " || e.key === "Tab" || e.key === "Enter") && value) {
      e.preventDefault();
      setTags((prevTags) => [...prevTags, value]);
      setInputTag("");
    }
  };

  // Handle removing a tag
  const handleTagDelete = (index) => {
    setTags((prevTags) => prevTags.filter((_, i) => i !== index));
  };

  return (
    <div className="mx-auto py-4">
      {/* User Details */}
      {userDetails && (
        <div className="mb-8">
          <Typography
            variant="h4"
            className="font-bold text-gray-400 font-mono uppercase tracking-widest"
          >
            Dashboard
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
            <tr className="bg-gray-900 text-white text-xs uppercase">
              <th className="border border-gray-300 px-4 py-4 text-left font-mono tracking-widest min-w-24">
                SL No.
              </th>
              <th className="border border-gray-300 px-4 py-4 text-left font-mono tracking-widest">
                Wallpaper
              </th>
              <th className="border border-gray-300 px-4 py-4 text-left font-mono tracking-widest min-w-56">
                Title
              </th>
              <th className="border border-gray-300 px-4 py-4 text-left font-mono tracking-widest min-w-96">
                Description
              </th>
              <th className="border border-gray-300 px-4 py-4 text-left font-mono tracking-widest min-w-56">
                Category
              </th>
              <th className="border border-gray-300 px-4 py-4 text-left font-mono tracking-widest min-w-56">
                Tags
              </th>
              <th className="border border-gray-300 px-4 py-4 text-left font-mono tracking-widest">
                Likes
              </th>
              <th className="border border-gray-300 px-4 py-4 text-left font-mono tracking-widest">
                Downloads
              </th>
              <th className="border border-gray-300 px-4 py-4 text-left font-mono tracking-widest min-w-56">
                Published At
              </th>
              <th className="border border-gray-300 px-4 py-4 text-left font-mono tracking-widest min-w-40">
                Last Updated
              </th>
              <th className="border border-gray-300 px-4 py-4 text-left font-mono tracking-widest">
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
                <tr
                  key={item._id}
                  className="odd:bg-white even:bg-gray-50 hover:brightness-95"
                >
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
                    {item.category}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="flex gap-2">
                      {item.tags.map((element, index) => (
                        <Chip
                          key={index}
                          value={element}
                          className="w-max normal-case font-normal"
                        />
                      ))}
                    </div>
                  </td>

                  <td className="border border-gray-300 px-4 py-2">
                    {item.likes}
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
          <Typography variant="small" className="text-gray-700 font-mono">
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
        <DialogHeader className="flex-col items-start gap-1">
          <Typography variant="h5" className="font-black font-mono uppercase">
            Edit Wallpaper Details
          </Typography>
          <Typography variant="small" color="gray">
            Update the wallpaper details below
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
            {/* Category Input */}
            <Select
              label="Category"
              value={selectedWallpaper?.category || ""}
              variant="standard"
              color="gray"
              onChange={(value) =>
                setSelectedWallpaper((prev) => ({ ...prev, category: value }))
              }
              required
            >
              <Option value="Nature">Nature</Option>
              <Option value="Technology">Technology</Option>
              <Option value="Abstract">Abstract</Option>
              <Option value="Art">Art</Option>
              <Option value="Animals">Animals</Option>
              <Option value="Space">Space</Option>
              <Option value="Cities">Cities</Option>
              <Option value="Sports">Sports</Option>
              <Option value="Cars">Cars</Option>
              <Option value="Other">Other</Option>
            </Select>

            {/* Tags Input */}
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                type="text"
                variant="standard"
                placeholder="e.g. nature forest sunset"
                color="gray"
                label="Tags"
                size="lg"
                value={inputTag}
                onChange={(e) => setInputTag(e.target.value)}
                onKeyDown={handleAddTag}
              />
              <div className="flex gap-2 flex-wrap">
                {tags.map((tag, index) => (
                  <Chip
                    key={index}
                    value={tag}
                    className="normal-case"
                    onClose={() => handleTagDelete(index)}
                  />
                ))}
              </div>
            </div>
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
