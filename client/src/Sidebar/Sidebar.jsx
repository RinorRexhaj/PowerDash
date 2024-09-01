import SidebarLink from "./SidebarLink";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeftLong, faUtensils } from "@fortawesome/free-solid-svg-icons";

const Sidebar = ({ open, toggleSidebar }) => {
  return (
    <div
      className={`w-80 h-full left-0 top-0 flex flex-col z-99 align-middle px-4 py-8 bg-black duration-300 ease-linear gap-20 tb:w-60 ${
        open ? "tb:left-0" : "tb:-left-60"
      } tb:fixed  md:w-50 sm:fixed sm:w-50 sm:gap-10`}
    >
      <div className="flex gap-2 items-center justify-between text-slate-200">
        <h1 className="text-3xl font-semibold">PowerDash</h1>
        <div className="relative">
          <img
            src="src/assets/img/lightning.png"
            alt=""
            className="w-9 h-9 md:hidden"
          />
          <div className="absolute bg-black z-10 w-9 h-9 animate-lightning"></div>
        </div>
        <FontAwesomeIcon
          icon={faLeftLong}
          className="cursor-pointer z-99 hidden tb:flex text-2xl"
          onClick={toggleSidebar}
        />
      </div>
      <div className="flex flex-col py-2 px-4 gap-2">
        <p className="text-slate-400    font-medium">MENU</p>
        <SidebarLink destination={"Dashboard"} />
        <SidebarLink destination={"Products"} />
      </div>
    </div>
  );
};

export default Sidebar;
