import SidebarLink from "./SidebarLink";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLeftLong,
  faPlus,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import ImportExcel from "../components/ImportExcel";

const Sidebar = ({ open, toggleSidebar, views, setViews }) => {
  const addView = () => {
    setViews([...views, { dest: "", created: true }]);
  };

  // const handleFileChange = (e) => {
  //   console.log(e.target.files[0]); // Logs selected file
  // };

  return (
    <div
      className={`w-80 h-full left-0 top-0 flex flex-col z-99 align-middle px-4 py-8 bg-black duration-300 ease-linear gap-20 tb:w-60 ${
        open ? "tb:left-0" : "tb:-left-60"
      } tb:fixed  md:w-50 sm:fixed sm:w-50 sm:gap-10`}
    >
      <div className="flex px-2 gap-2 items-center justify-between text-slate-200">
        <Link to="/" className="text-3xl font-semibold">
          PowerDash
        </Link>
        <div className="relative">
          <img
            src="src/assets/img/lightning.png"
            alt=""
            className="w-9 h-9 md:hidden transition-height animate-lightningStrike"
          />
          <span className="absolute w-9 h-9 md:hidden z-10 bg-black animate-lightning"></span>
        </div>
        <FontAwesomeIcon
          icon={faLeftLong}
          className="cursor-pointer z-99 hidden tb:flex text-2xl"
          onClick={toggleSidebar}
        />
      </div>
      <div className="flex flex-col py-2 px-4 gap-2">
        <div className="flex justify-between items-center">
          <p className="text-slate-400    font-medium">MENU</p>
          <button className="text-white z-100" onClick={() => addView()}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>{" "}
        <div className="relative flex flex-col top-3">
          {views.map((view, index) => {
            return (
              <SidebarLink
                destination={view.dest}
                created={view.created}
                views={views}
                setViews={setViews}
                key={view.dest}
                index={index}
              />
            );
          })}
        </div>
        {/* <ImportExcel /> */}
      </div>
    </div>
  );
};

export default Sidebar;
