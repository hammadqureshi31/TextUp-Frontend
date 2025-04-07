import React, { useEffect } from "react";
import { useLocation } from "react-router";
import ChatRoom from "../../pages/Chats/ChatRoom";
import CreateGroup from "../../pages/Groups/CreateGroup";
import GroupRoom from "../../pages/Groups/GroupRoom";

const ReplaceChatScreen = ({ showChatRoom }) => {
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const currentTab = urlParams.get("tab");
    sessionStorage.setItem("replaceChat", currentTab);
  }, [location.search, showChatRoom]);

  return <> 
  {showChatRoom === "chatroom" && <ChatRoom />}
  {showChatRoom === "creategroup" && <CreateGroup />}
  {showChatRoom === "grouproom" && <GroupRoom />}

  </>;
};

export default ReplaceChatScreen;
