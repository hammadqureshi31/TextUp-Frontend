import React, { useEffect, useState } from "react";
import { AiOutlineMessage } from "react-icons/ai";
import { MdGroups } from "react-icons/md";
import { IoIosContact } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const FooterMenu = () => {
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState("messages");

  const currentUser = useSelector((state) => state.currentUser.data);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [groupUnReads, setGroupUnReads] = useState(0);


  
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const param = urlParams.get("tab");
    if (param) {
      setCurrentTab(param);
    }
  }, [location.search]);

  useEffect(() => {
    // if (unReadMsgs.length > 0 && currentUser) {
    //   const msgs = unReadMsgs.filter(
    //     (msg) => msg.receiver.toString() === currentUser._id.toString()
    //   );
    //   setUnreadMessages(msgs.length);
    // }
    // if (groupUnreadMsgs.length > 0 && currentUser) {
    //   const groupMsgs = groupUnreadMsgs.filter(
    //     (msg) => msg.sender.toString() !== currentUser._id.toString()
    //   );
    //   console.log("groupMsgs",groupUnreadMsgs)
    //   setGroupUnReads(groupMsgs.length);
    // }

    if (currentUser?.unread) {
      setUnreadMessages(currentUser?.unread);
    }

    if (currentUser?.groupUnreads) {
      setGroupUnReads(currentUser?.groupUnreads);
    }
  }, [
    currentUser.unread,
    currentUser.groupUnreads,
    currentUser.lastMessages,
    currentTab,
  ]);

  // console.log("unreadMessages", unreadMessages, "groupUnReads")

  return (
    <div className="flex justify-between text-center items-center h-full px-3">
      <Link
        to="/textup?tab=messages"
        className={`${
          currentTab === "messages"
            ? "flex flex-col justify-around text-center text-[#334E83] font-semibold"
            : "flex flex-col justify-around text-center opacity-35"
        } relative`}
      >
        <AiOutlineMessage className="mx-auto text-2xl cursor-pointer" />
        <h1 className="font-poppins text-sm">Messages</h1>
        {/* Unread Badge */}
        {unreadMessages.length > 0 && (
          <div className="absolute -top-1 right-3 bg-[#F04A4C] text-xs text-white font-poppins px-1.5 py-0.5 rounded-full flex items-center justify-center">
            {unreadMessages?.length}
          </div>
        )}
      </Link>

      <Link
        to="/textup?tab=groups"
        className={`${
          currentTab === "groups"
            ? "flex flex-col justify-around text-center text-[#334E83] font-semibold"
            : "flex flex-col justify-around text-center opacity-35"
        } relative`}
      >
        <MdGroups className="mx-auto text-2xl cursor-pointer" />
        <h1 className="font-poppins text-sm">Groups</h1>
        {/* Unread Badge */}
        {groupUnReads.length > 0 && (
          <div className="absolute -top-1 right-0 bg-[#F04A4C] text-xs text-white font-poppins px-1.5 py-0.5 rounded-full flex items-center justify-center">
            {groupUnReads?.length}
          </div>
        )}
      </Link>

      <Link
        to="/textup?tab=contacts"
        className={`${
          currentTab === "contacts"
            ? "flex flex-col justify-around text-center text-[#334E83] font-semibold"
            : "flex flex-col justify-around text-center opacity-35"
        }`}
      >
        <IoIosContact className="mx-auto text-2xl cursor-pointer" />
        <h1 className="font-poppins text-sm">Contacts</h1>
      </Link>

      <Link
        to="/textup?tab=setting"
        className={`${
          currentTab === "setting"
            ? "flex flex-col justify-around text-center text-[#334E83] font-semibold"
            : "flex flex-col justify-around text-center opacity-35"
        }`}
      >
        <IoSettingsOutline className="mx-auto text-2xl cursor-pointer" />
        <h1 className="font-poppins text-sm">Settings</h1>
      </Link>
    </div>
  );
};

export default FooterMenu;
