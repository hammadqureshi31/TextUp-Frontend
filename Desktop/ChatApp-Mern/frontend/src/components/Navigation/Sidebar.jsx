import React, { useEffect, useState } from "react";
import { AiOutlineMessage } from "react-icons/ai";
import { MdGroups } from "react-icons/md";
import { IoIosContact } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { HiOutlineBars3 } from "react-icons/hi2";
import { useLocation, useNavigate } from "react-router";
import { useSelector } from "react-redux";

const Sidebar = ({showChatRoom, setShowChatRoom}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState("messages");
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [groupUnReads, setGroupUnReads] = useState(0);

  const currentUser = useSelector((state) => state.currentUser?.data);


  
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get("tab");
    if (tab) setCurrentTab(tab);
  }, [location.search, currentUser.lastMessages]);

  useEffect(() => {
    // if (unReadMsgs.length && currentUser) {
    //   setUnreadMessages(unReadMsgs.filter(msg => msg.receiver === currentUser._id || msg.sender !== currentUser._id).length);
    // }

    // if (groupUnreadMsgs.length && currentUser) {
    //   setGroupUnReads(groupUnreadMsgs.filter(msg => msg.sender !== currentUser._id).length);
    // }

    if(currentUser?.unread){
      setUnreadMessages(currentUser?.unread);
    }

    if(currentUser?.groupUnreads){
      setGroupUnReads(currentUser?.groupUnreads);
    }
  }, [currentUser.unread, currentUser.groupUnreads, currentUser.lastMessages, currentTab, currentUser]);



  const handleNavigate = (tab) => {
    sessionStorage.setItem("previousTab", tab);
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("tab", tab);
    urlParams.delete("userId"); // Ensure userId is removed
    urlParams.delete("to");
    urlParams.delete("groupId")
    urlParams.delete("create");
    setShowChatRoom(null);
    navigate(`/textup?${urlParams.toString()}`);
  };

  return (
    <div className="bg-pink-50 ring-2 ring-gray-200 px-2 w-full flex flex-col justify-between text-center pt-6 pb-5 2xl:px-4">
      <div className="flex flex-col gap-6">
        <HiOutlineBars3 className="mx-auto text-3xl 2xl:text-4xl 2xl:mt-5" />

        {/* Messages Tab */}
        <SidebarTab
          icon={AiOutlineMessage}
          tab="messages"
          currentTab={currentTab}
          onClick={handleNavigate}
          unreadCount={unreadMessages?.length}
        />

        {/* Groups Tab */}
        <SidebarTab
          icon={MdGroups}
          tab="groups"
          currentTab={currentTab}
          onClick={handleNavigate}
          unreadCount={groupUnReads?.length}
        />

        {/* Contacts Tab */}
        <SidebarTab icon={IoIosContact} tab="contacts" currentTab={currentTab} onClick={handleNavigate} />
      </div>

      {/* Settings Tab */}
      <SidebarTab icon={IoSettingsOutline} tab="setting" currentTab={currentTab} onClick={handleNavigate} />
    </div>
  );
};

const SidebarTab = ({ icon: Icon, tab, currentTab, onClick, unreadCount }) => (
  <div onClick={() => onClick(tab)} className="flex cursor-pointer relative items-center justify-center 2xl:mt-3">
    {currentTab === tab && <div className="w-1 mt-0.5 h-3/4 rounded-t-full rounded-b-full bg-[#334E83]"></div>}
    <Icon className={`mx-auto text-3xl 2xl:text-4xl ${currentTab === tab ? "text-[#334E83]" : "opacity-20"}`} />
    {unreadCount > 0 && (
      <div className="absolute -top-1 -right-2 bg-[#F04A4C] text-xs text-white font-poppins px-1.5 py-0.5 rounded-full flex items-center justify-center 2xl:text-lg 2xl:px-2 2xl:-right-3 2xl:-top-2">
        {unreadCount}
      </div>
    )}
  </div>
);

export default Sidebar;
