import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeader, faUser } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const User = ({
  token,
  user,
  userId,
  active,
  searching,
  setOpenChat,
  message,
  setMessage,
  filterMessages,
  setFilteredMessages,
  unSeenMessages,
  setUnSeenMessages,
  typing,
  timeAgo,
  connection,
  group,
  setGroup,
}) => {
  const [profile, setProfile] = useState(false);
  useEffect(() => {
    axios
      .get(`https://localhost:7262/Clients/image/${user.id}`)
      .then((resp) => {
        if (resp.status === 200) setProfile(true);
      })
      .catch((err) => err);
  }, []);

  return (
    <div
      className="relative w-full min-h-15 flex py-2 mt-1 hover:bg-slate-100 duration-150 ease-linear cursor-pointer"
      onClick={() => {
        setOpenChat({ ...user, profile: profile });
        // setGroup(undefined);
        connection.invoke("SendSeen", userId, user.id);
        setMessage({ ...message, receiverId: user.id });
        setFilteredMessages(filterMessages(user));
        const unSeen = filterMessages(user)
          .filter(
            (m) => m.seen === "0001-01-01T00:00:00" && m.senderId !== userId
          )
          .map((m) => {
            return {
              ...m,
              seen: new Date(Date.now() + 120 * 60 * 1000).toISOString(),
            };
          });
        setUnSeenMessages(unSeen);
        axios
          .patch("https://localhost:7262/Messages/seen", unSeen, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .catch((err) => {
            console.log(err);
          });
        setUnSeenMessages([]);
      }}
      key={user.id}
    >
      {profile ? (
        <img
          className="w-10 h-10 rounded-full object-cover"
          src={`https://localhost:7262/Clients/image/${user.id}`}
        />
      ) : (
        <FontAwesomeIcon
          icon={faUser}
          className="w-4 h-4 text-slate-600 bg-slate-300 hover:bg-slate-400 ease-in duration-150 p-3 rounded-full cursor-pointer"
        />
      )}
      {active && (
        <div className="absolute bottom-3 left-7 h-3.5 w-3.5 rounded-full bg-green-400"></div>
      )}
      <div className="w-full relative flex flex-col items-start left-3">
        <p
          className={`${
            user.lastMessage !== undefined &&
            user.lastMessage.receiverId !== undefined &&
            userId === user.lastMessage.receiverId &&
            user.lastMessage.seen === "0001-01-01T00:00:00" &&
            "font-bold"
          }`}
        >
          {user.fullName}
        </p>
        <div className="w-full flex items-center justify-between">
          <p
            className={`relative flex text-sm ${
              (user.lastMessage !== undefined &&
                user.lastMessage.receiverId !== undefined &&
                (user.lastMessage.seen === "0001-01-01T00:00:00" ||
                  user.lastMessage.seen === undefined) &&
                user.lastMessage.receiverId === userId) ||
              typing.includes(user.id)
                ? "font-bold"
                : "text-slate-500"
            }`}
          >
            {typing.length === 0 || !typing.includes(user.id)
              ? user.lastMessage !== undefined &&
                user.lastMessage.senderId === userId
                ? "You: "
                : ""
              : "Typing ..."}
            {user.unSeenMessages <= 1
              ? !typing.includes(user.id) && user.lastMessage !== undefined
                ? user.lastMessage.messageText.length <= 20
                  ? user.lastMessage.messageText
                  : user.lastMessage.messageText.substring(0, 20) + "..."
                : ""
              : !typing.includes(user.id) &&
                user.unSeenMessages !== undefined &&
                user.unSeenMessages + " new messages"}
          </p>
          <p className="relative text-sm text-slate-500 right-10">
            {user.lastMessage !== undefined &&
            user.lastMessage.senderId === userId
              ? user.lastMessage.seen === "0001-01-01T00:00:00"
                ? "Sent "
                : "Seen "
              : ""}
            {user.lastMessage !== undefined
              ? user.lastMessage.senderId === userId
                ? user.lastMessage.seen === "0001-01-01T00:00:00"
                  ? timeAgo.format(new Date(user.lastMessage.sent), "mini-now")
                  : timeAgo.format(new Date(user.lastMessage.seen), "mini-now")
                : user.lastMessage.receiverId === userId &&
                  timeAgo.format(new Date(user.lastMessage.sent), "mini-now")
              : ""}
          </p>
        </div>
      </div>
      <span className="w-full absolute bottom-0 z-10 h-[1px] bg-gray"></span>
    </div>
  );
};

export default User;
