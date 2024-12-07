import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Spinner } from "@material-tailwind/react";
import { fetchWallpapers } from "../api/wallpaper";
import { getToken } from "../utils/auth";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const ViewWallpapers = () => {
  const [wallpapers, setWallpapers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const token = getToken();

  const fetchData = async (currentPage) => {
    setLoading(true);
    try {
      if (token) {
        // Ensure the token is available
        const data = await fetchWallpapers(token, currentPage); // Pass the correct page here
        setWallpapers((prev) => [
          ...prev,
          ...data.wallpapers.filter(
            (newWallpaper) =>
              !prev.some((wallpaper) => wallpaper._id === newWallpaper._id)
          ),
        ]);
        setHasMore(currentPage < data.totalPage); // Adjust pagination check
      } else {
        console.error("No valid token available");
      }
    } catch (err) {
      console.error("Error fetching wallpapers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 100
    ) {
      if (hasMore && !isLoadingMore && !loading) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setPage((prev) => prev + 1); // Increment page number for fetching more wallpapers
          setIsLoadingMore(false);
        }, 2000); // 2-second delay for smooth scrolling effect
      }
    }
  };

  useEffect(() => {
    if (page) {
      // Ensure page is defined
      fetchData(page); // Fetch wallpapers whenever the page number changes
    }
  }, [page, token]); // Added token to the dependency array

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoadingMore, loading]);

  return (
    <section className="mt-4">
      <h1 className="text-xl font-black mb-6 uppercase text-gray-400 font-mono tracking-widest">
        All Wallpapers
      </h1>
      <div className="masonry sm:masonry-sm md:masonry-md">
        {!loading && wallpapers.length <= 0 && <p>No wallpapers found.</p>}
        {wallpapers.map((wallpaper, index) => (
          <motion.div
            key={index}
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 10 }}
            transition={{ delay: index * 0.05, duration: 0.5 }}
            className="rounded-xl shadow mb-2 overflow-hidden group block bg-black relative"
          >
            <img
              effect="blur"
              src={wallpaper.compressedUrl}
              alt={wallpaper.title}
              className="h-full w-full object-cover opacity-75 transition-opacity group-hover:opacity-50"
            />

            <div className="p-4 sm:p-6 lg:p-8 absolute inset-0">
              <p className="text-sm font-medium uppercase text-gray-300 tracking-wider">
                {new Date(wallpaper.createdAt).toLocaleString()}
              </p>

              <p className="text-xl font-black text-white sm:text-2xl break-words line-clamp-2">
                {wallpaper.title}
              </p>

              <div className="mt-2">
                <div className="translate-y-8 transform opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="text-sm text-white break-words line-clamp-3">
                    {wallpaper.description}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Show spinner while loading more */}
      {isLoadingMore && (
        <div className="flex justify-center mt-8">
          <Spinner />
        </div>
      )}

      {/* Show spinner while initial loading */}
      {loading && !isLoadingMore && (
        <div className="flex justify-center mt-8">
          <Spinner />
        </div>
      )}
    </section>
  );
};

export default ViewWallpapers;
