import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  List,
  ListItem,
  ListItemPrefix,
  ListItemSuffix,
  Chip,
  IconButton,
  Drawer,
  Navbar,
  Typography,
} from "@material-tailwind/react";
import { FaBarsStaggered, FaXmark } from "react-icons/fa6";
import { useState } from "react";
import {
  IoCloudUploadOutline,
  IoImagesOutline,
  IoLogOutOutline,
  IoPauseCircleOutline,
  IoPersonCircleOutline,
  IoPieChartOutline,
} from "react-icons/io5";
import { removeToken } from "../utils/auth";
import { toast } from "react-toastify";

const Sidebar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation(); // Get current route
  const navigate = useNavigate();

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  // Helper function to check if the link is active
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    removeToken();
    toast.success("Logout successful");
    navigate("/login");
  };

  return (
    <>
      <Navbar className="fixed mx-auto max-w-full px-4 py-2 lg:px-8 lg:py-4 flex justify-between shadow-sm rounded-none z-50 top-0 items-center">
        <Link to={"/dashboard"}>
          <div className="flex gap-1 items-center justify-center group">
            <img
              src="/assets/logo.png"
              alt="PixelGrid Logo"
              className="w-8 h-8 group-hover:rotate-45 transition-all"
            />
            <Typography
              variant="h4"
              className="font-black text-black cursor-pointer font-mono group-hover:brightness-75 transition-all uppercase"
            >
              <span className="text-gray-600">Pixel</span>Grid
            </Typography>
          </div>
        </Link>
        <IconButton variant="text" size="md" onClick={openDrawer}>
          {isDrawerOpen ? (
            <FaXmark className="h-4 w-4 stroke-2" />
          ) : (
            <FaBarsStaggered className="h-4 w-4 stroke-2" />
          )}
        </IconButton>
      </Navbar>

      <Drawer open={isDrawerOpen} onClose={closeDrawer}>
        <Card className="h-screen">
          <div className="p-4 flex justify-between items-center">
            <Link to={"/dashboard"} onClick={closeDrawer}>
              <Typography variant="h4" className="font-black text-black font-mono uppercase">
                Admin Panel
              </Typography>
            </Link>
          </div>
          <hr className="w-[90%] mx-auto" />
          <List>
            <Link to={"/dashboard"} onClick={closeDrawer}>
              <ListItem
                className={
                  isActive("/dashboard")
                    ? "bg-gray-200 text-gray-800 hover:bg-gray-200/75"
                    : ""
                }
              >
                <ListItemPrefix>
                  <IoPieChartOutline className="h-5 w-5" />
                </ListItemPrefix>
                Dashboard
              </ListItem>
            </Link>
            <Link to={"/upload"} onClick={closeDrawer}>
              <ListItem
                className={
                  isActive("/upload")
                    ? "bg-gray-200 text-gray-800 hover:bg-gray-200/75"
                    : ""
                }
              >
                <ListItemPrefix>
                  <IoCloudUploadOutline className="h-5 w-5" />
                </ListItemPrefix>
                Add Wallpaper
              </ListItem>
            </Link>
            <Link to={"/wallpapers"} onClick={closeDrawer}>
              <ListItem
                className={
                  isActive("/wallpapers")
                    ? "bg-gray-200 text-gray-800 hover:bg-gray-200/75"
                    : ""
                }
              >
                <ListItemPrefix>
                  <IoImagesOutline className="h-5 w-5" />
                </ListItemPrefix>
                All Wallpapers
              </ListItem>
            </Link>
            <Link to={"/profile"} onClick={closeDrawer}>
              <ListItem
                className={
                  isActive("/profile")
                    ? "bg-gray-200 text-gray-800 hover:bg-gray-200/75"
                    : ""
                }
              >
                <ListItemPrefix>
                  <IoPersonCircleOutline className="h-5 w-5" />
                </ListItemPrefix>
                Profile
              </ListItem>
            </Link>
            <ListItem
              className={
                isActive("/")
                  ? "bg-gray-200 text-gray-800 hover:bg-gray-200/75"
                  : ""
              }
              onClick={handleLogout}
            >
              <ListItemPrefix>
                <IoLogOutOutline className="h-5 w-5" />
              </ListItemPrefix>
              Logout
            </ListItem>
          </List>
        </Card>
      </Drawer>
    </>
  );
};

export default Sidebar;
