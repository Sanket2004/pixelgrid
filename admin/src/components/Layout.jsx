import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = ({ wallpapers }) => {
  return (
    <div>
      <Sidebar wallpapers={wallpapers} />{" "}
      {/* Pass wallpapers as a prop to Sidebar */}
      <div className=" mt-14 p-4 md:p-4 lg:p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
