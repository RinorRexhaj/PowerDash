import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faBarcode,
  faCartShopping,
  faUserGroup,
  faList,
  faCar,
  faAngleDown,
  faAngleUp,
  faCarSide,
  faCalendarDay,
  faCarAlt,
  faDashboard,
  faDatabase,
  faTruckFast,
  faUtensils,
  faHamburger,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const SidebarLink = ({ destination }) => {
  let icon = "";

  return (
    <Link
      to={`/${destination}`}
      className={`relative w-full h-10 py-2 px-4 flex gap-3 items-center font-medium text-slate-200 text-l rounded-sm hover:bg-slate-500 duration-150 ease-linear sm:px-2`}
    >
      <FontAwesomeIcon icon={faDatabase} />
      {destination}
    </Link>
  );
};

export default SidebarLink;
