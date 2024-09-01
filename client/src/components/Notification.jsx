import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const Notification = ({ senderId, userName, msg, profile }) => {
  return (
    <div className="flex gap-2 items-center">
      {profile ? (
        <img
          className={`w-8 h-8 rounded-full  bg-slate-200 flex items-center justify-center`}
          src={`https://localhost:7262/Clients/image/${senderId}`}
          alt={`${userName}`}
        />
      ) : (
        <FontAwesomeIcon
          icon={faUser}
          className="w-3 h-3 text-slate-600 bg-slate-300 hover:bg-slate-400 ease-in duration-150 p-2.5 rounded-full cursor-pointer"
        />
      )}
      <p className="cursor-pointer text-black">
        <b>{userName}:</b> {msg}
      </p>
    </div>
  );
};

export default Notification;
