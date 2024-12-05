import React, { useState } from "react";
import { Button, Input, Textarea, Typography } from "@material-tailwind/react";
import { useDropzone } from "react-dropzone";
import { FaRegTrashCan } from "react-icons/fa6";
import { toast } from "react-toastify";
import { uploadWallpaper } from "../api/wallpaper"; // Import the uploadWallpaper function
import { getToken } from "../utils/auth";

const UploadWallpaper = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!image) {
      toast.error("Please select an image");
      return;
    }

    setLoading(true);

    const token = getToken(); // Retrieve token from localStorage

    try {
      // Call the uploadWallpaper function from API
      const data = await uploadWallpaper(title, description, image, token);
      toast.success("Wallpaper added successfully");

      // Clear input fields and reset image
      setTitle("");
      setDescription("");
      setImage(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add wallpaper");
    } finally {
      setLoading(false);
    }
  };

  const handleDeselect = () => {
    setImage(null);
  };

  return (
    <div className="mx-auto flex flex-col-reverse justify-center items-center min-h-[80vh] lg:flex-row gap-14">
      <div className="lg:w-1/2 flex items-start h-full justify-center">
        <form onSubmit={handleUpload} className="space-y-6 w-full">
          <Typography variant="h3" className="font-black font-mono">
            Upload your wallpaper
          </Typography>
          <Typography variant="paragraph" className="text-gray-600">
            Share your best wallpapers with the world. Make it easy for users to
            download and set them as their backgrounds.
          </Typography>

          {/* Title Input */}
          <Input
            type="text"
            variant="standard"
            placeholder="e.g. Moving Bits"
            color="black"
            label="Title"
            size="lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* Image Description */}
          <Textarea
            type="text"
            variant="standard"
            color="black"
            label="Description"
            rows={5}
            size="lg"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          {/* Submit Button */}
          <Button type="submit" size="md" className="w-full font-mono tracking-widest" disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </form>
      </div>

      <div className="lg:w-1/2 w-full flex items-center justify-center h-full">
        {image ? (
          <div className="relative w-full h-full">
            <img
              src={URL.createObjectURL(image)}
              alt="Selected Preview"
              className="w-full h-[25em] object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={handleDeselect}
              className="absolute top-2 right-2 rounded-xl w-10 h-10 flex items-center justify-center bg-[#ffffff91] hover:bg-[#ffffff61]"
            >
              <FaRegTrashCan size={15} className="text-gray-800 text-xl" />
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded p-6 text-center h-[25em] w-full flex justify-center items-center cursor-pointer ${
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
    </div>
  );
};

export default UploadWallpaper;
