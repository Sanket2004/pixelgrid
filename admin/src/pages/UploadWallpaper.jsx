import React, { useState } from "react";
import {
  Button,
  Input,
  Textarea,
  Typography,
  Select,
  Option,
  Chip,
} from "@material-tailwind/react";
import { useDropzone } from "react-dropzone";
import { FaRegTrashCan, FaXmark } from "react-icons/fa6";
import { toast } from "react-toastify";
import { uploadWallpaper } from "../api/wallpaper"; // Import the uploadWallpaper function
import { getToken } from "../utils/auth";
import { TbTrash } from "react-icons/tb";

const UploadWallpaper = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState([]);
  const [inputTag, setInputTag] = useState(""); // For the current tag input value
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setImage(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/*",
    multiple: false,
  });

  const handleTagChange = (e) => {
    setInputTag(e.target.value);
  };

  const handleAddTag = (e) => {
    const value = inputTag.trim();
    if ((e.key === " " || e.key === "Tab" || e.key === "Enter") && value) {
      e.preventDefault();
      setTags([...tags, value]);
      setInputTag("");
    }
  };

  const handleTagDelete = (index) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!image) {
      toast.error("Please select an image");
      return;
    }

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    setLoading(true);

    const token = getToken(); // Retrieve token from localStorage

    try {
      // Call the uploadWallpaper function from API
      const data = await uploadWallpaper(
        title,
        description,
        category,
        tags,
        image,
        token
      );
      toast.success("Wallpaper added successfully");

      // Clear input fields and reset image
      setTitle("");
      setDescription("");
      setCategory("");
      setTags([]);
      setInputTag("");
      setImage(null);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "An error occurred";
      console.error(error);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeselect = () => {
    setImage(null);
  };

  return (
    <section className="mx-auto grid grid-cols-1 w-full items-center gap-10 md:grid-cols-2 mt-4">
      <div className=" flex items-start h-full justify-center w-full">
        <form onSubmit={handleUpload} className="w-full">
          <Typography
            variant="h4"
            className="font-black font-mono uppercase mb-2 text-gray-400 tracking-wider"
          >
            Upload wallpaper
          </Typography>
          <Typography variant="paragraph" className="text-gray-600 mb-4">
            Share your best wallpapers with the world. Make it easy for users to
            download and set them as their backgrounds.
          </Typography>
          <div className="space-y-4">
            {/* Title Input */}
            <Input
              type="text"
              variant="standard"
              placeholder="e.g. Moving Bits"
              color="gray"
              label="Title"
              size="lg"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* Description Input */}
            <Textarea
              type="text"
              variant="standard"
              color="gray"
              label="Description"
              rows={5}
              size="lg"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            {/* Category Input */}
            <Select
              label="Category"
              value={category}
              variant="standard"
              color="gray"
              onChange={(value) => setCategory(value)}
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
                onChange={handleTagChange}
                onKeyDown={handleAddTag}
              />
              <div className="flex gap-2 flex-wrap">
                {tags.map((tag, index) => (
                  <Chip
                    key={index} // Provide a key to ensure proper rendering in lists
                    value={tag}
                    className="normal-case"
                    onClose={()=>handleTagDelete(index)}
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="md"
              className="w-full font-mono tracking-widest"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </div>

      <div className=" w-full flex items-center justify-center h-full shadow-md rounded-lg overflow-hidden">
        {image ? (
          <div className="relative w-full h-full">
            <img
              src={URL.createObjectURL(image)}
              alt="Selected Preview"
              className="w-full h-[30em] object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={handleDeselect}
              className="absolute top-2 right-2 rounded-xl w-10 h-10 flex items-center justify-center bg-[#ffffff91] hover:bg-[#ffffff61] shadow-md"
            >
              <FaRegTrashCan size={15} className="text-gray-800 text-xl" />
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed p-6 text-center min-h-80 h-full w-full flex justify-center items-center cursor-pointer rounded-lg ${
              isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-500"
            }`}
          >
            <input {...getInputProps()} accept="image/*" />
            {isDragActive ? (
              <p className="text-blue-500 font-mono">Drop the files here...</p>
            ) : (
              <p className="text-gray-500 font-mono">
                Drag & drop an image here, or click to select a file
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default UploadWallpaper;
