import axios from "axios";

const API = import.meta.env.VITE_BACKEND_URL;

// Fetch wallpapers with pagination
export const fetchWallpapers = async (token, page = 1) => {
  if (token) {
    try {
      const response = await axios.get(
        `${API}/wallpapers?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error("Error fetching wallpapers:", err);
      throw err;
    }
  } else {
    console.error("No token provided");
    return null;
  }
};

// Upload wallpaper API call
export const uploadWallpaper = async (title, description, image, token) => {
  try {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("image", image);

    const response = await axios.post(`${API}/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data; // Return the uploaded wallpaper data
  } catch (error) {
    console.error("Error uploading wallpaper:", error);
    throw error; // Rethrow the error to be handled in the calling component
  }
};

//update the wallpaper
export const updateWallpaper = async (id, token, updateData) => {
  try {
    const response = await axios.put(`${API}/wallpaper/${id}`, updateData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading wallpaper:", error);
    throw error;
  }
};

export const deleteWallpaper = async (id, token) => {
  try {
    const response = await axios.delete(`${API}/wallpaper/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading wallpaper:", error);
    throw error;
  }
};

export const updateVisibility = async (id, token) => {
  try {
    const response = await axios.put(
      `${API}/wallpaper/${id}/visibility`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error uploading wallpaper:", error);
    throw error;
  }
};
