import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBarcode,
  faUserGroup,
  faList,
  faCalendarDay,
  faDashboard,
  faDatabase,
  faHamburger,
  faChartSimple,
  faPenToSquare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const SidebarLink = ({ destination, created, views, setViews, index }) => {
  const [hover, setHover] = useState(false);
  const [edit, setEdit] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const inputRef = useRef();
  const toastId = useRef(null);
  const toastStyle = {
    position: "top-left",
    progressStyle: { background: "#3b82f6" },
    theme: "dark",
    autoClose: 2500,
    className:
      "relative w-64 bottom-6 ml-3 bg-black shadow-sm shadow-slate-400/20 font-medium",
  };

  let icon = "";

  const navigate = useNavigate();
  const location = useLocation().pathname.toLowerCase();
  let selected = false;
  if (location === "/" + destination.toLowerCase()) {
    selected = true;
  }

  switch (destination) {
    case "Dashboard":
      icon = faChartSimple;
      break;
    case "Products":
      icon = faBarcode;
      break;
    case "View":
    case "":
      icon = faList;
      break;
  }

  useEffect(() => {
    if (created) {
      navigate(`/${destination}`, { replace: true });
      inputRef.current.focus();
    }
  }, []);

  const viewExists = (view) => {
    for (let i = 0; i < views.length; i++)
      if (views[i].dest.toLowerCase() === view.toLowerCase()) return true;
    return false;
  };

  const changeView = (view) => {
    if (destination !== view && viewExists(view)) {
      errorToast("View already exists!");
      inputRef.current.value = destination;
      inputRef.current.focus();
    } else {
      setViews(
        views.map((v) => {
          if (v.dest === destination) return { dest: view };
          return v;
        })
      );
      navigate(`/${view.toLowerCase()}`, { replace: true });
      if (created) {
        successToast("created");
        created = false;
      } else if (destination !== view) {
        successToast("edited");
      }
    }
  };

  const deleteView = (view) => {
    setDeleted(true);
    toast.dismiss(toastId.current);
    setTimeout(() => {
      toastId.current = toast.info("Successfully deleted!", toastStyle);
      setViews(views.filter((v) => v.dest !== view));
      navigate("/", { replace: true });
    }, 500);
  };

  const checkValue = (value) => {
    if (value !== "" && value !== undefined && value !== null) {
      changeView(value);
      setEdit(false);
    } else {
      errorToast("Set a name for the view!");
      inputRef.current.focus();
    }
  };

  const successToast = (message) => {
    toast.dismiss(toastId.current);
    toastId.current = toast.success(`Successfully ${message}!`, toastStyle);
  };

  const errorToast = (message) => {
    toast.dismiss(toastId.current);
    toastId.current = toast.error(message, toastStyle);
  };

  return (
    <Link
      to={`/${destination.toLowerCase()}`}
      className={`relative w-full h-10 py-2 px-4 flex gap-3 items-center font-medium ${
        selected ? "bg-slate-700" : "bg-inherit"
      } text-slate-200 rounded-sm hover:bg-slate-500 duration-200 ease-linear sm:px-2 ${
        deleted
          ? "animate-fadeOut"
          : created
          ? "animate-slideIn [animation-fill-mode:backwards]"
          : ""
      } transition-all`}
      style={{
        animationDelay: !created ? `${index * 0.3}s` : "0s",
        top: `${index * 10}px`,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <FontAwesomeIcon icon={icon} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          checkValue(inputRef.current.value);
        }}
      >
        <input
          type="text"
          defaultValue={destination}
          readOnly={!edit && !created}
          onBlur={(e) => {
            const value = e.target.value;
            checkValue(value);
          }}
          ref={inputRef}
          className={`bg-transparent outline-none ${!edit && "cursor-pointer"}`}
        />
      </form>
      <div
        className={`relative right-8 flex items-center gap-2 ${
          hover ? "opacity-100 z-10" : "opacity-0 -z-10"
        }`}
      >
        <FontAwesomeIcon
          icon={faPenToSquare}
          className="hover:text-blue-500 transition delay-100"
          onClick={() => {
            setEdit(true);
            inputRef.current.focus();
          }}
        />
        <FontAwesomeIcon
          icon={faTrash}
          className="hover:text-red-500 transition delay-100"
          onClick={() => deleteView(destination)}
        />
      </div>
    </Link>
  );
};

export default SidebarLink;
