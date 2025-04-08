import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { backendPortURL } from "../config";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllMessages, resetMessages } from "../redux/slice/messagesSlice";
import { history } from "../redux/slice/chatHistorySlice";
import { fetchUserDetails } from "../redux/slice/userSlice";

const useSocket = (setupSocket, newChatId) => {
  const user = useSelector((state) => state.currentUser.data?.details);
  const dispatch = useDispatch();
  const [typing, setTyping] = useState(false);
  const [typerName, setTyperName] = useState(null);
  const [groupID, setGroupID] = useState(null);
  const [typerMode, setTyperMode] = useState(null);
  const [fetchMsgs, setfetchMsgs] = useState(false);
  const socket = useRef(null);

  useEffect(() => {
    if (setupSocket) {
      socket.current = io(`${backendPortURL}`, { path: "/messaging" });

      socket.current.on("connect", () => {
        console.log("Connected to socket server");
      });

      socket.current.on("receive-message", (message) => {
        // console.log("Message received:", message);

        dispatch(history(message));
        dispatch(fetchUserDetails());

        // if (newChatId) {
        // dispatch(fetchAllMessages(newChatId, user));
        setfetchMsgs(true);
        // }
      });

      socket.current.on("read-message", () => {
        console.log("Messages marked as read");
        dispatch(fetchUserDetails())
        // if (newChatId) {
        //   dispatch(fetchAllMessages(newChatId, user));
        // }
      });

      socket.current.on("typing", ({ sender, name, groupID, mode }) => {
        // console.log(`${sender} is typing in chat ${groupID}`);
        setTyping(sender);
        setTyperName(name);
        setGroupID(groupID);
        setTyperMode(mode);

        // Clear typing indicator after a timeout
        const timeout = setTimeout(() => setTyping(null), 2000);
        return () => clearTimeout(timeout);
      });

      socket.current.on("disconnect", () => {
        // console.log("Disconnected from socket server");
      });

      socket.current.on("update-lastseen-and-online", () => {
        // console.log("Updating user last seen and online status");
        dispatch(fetchUserDetails());
      });

      // Cleanup event listeners on unmount
      return () => {
        socket.current.off("connect");
        socket.current.off("receive-message");
        socket.current.off("read-message");
        socket.current.off("typing");
        socket.current.off("disconnect");
        socket.current.off("update-lastseen-and-online");
        socket.current.disconnect();
      };
    }
  }, [setupSocket, newChatId, user?._id, dispatch]);

  const sendMessage = (content, image, mode) => {
    if (user && newChatId) {
      socket.current.emit("new-message", {
        mode,
        content,
        imageURL: image,
        senderId: user?._id,
        chatId: newChatId,
      });
    } else {
      console.error(
        "Unable to send message. Ensure you are logged in and in a chat room."
      );
    }
  };

  const markAsRead = (mode) => {
    if (newChatId && user?._id) {
      // console.log("Marking messages as read");
      socket.current?.emit("join-room", {
        userId: user?._id,
        roomId: newChatId,
        mode,
      });
    }
  };

  const setLastSeenAndOnlineEvent = (online) => {
    if (user?._id) {
      // console.log("Updating online status");
      socket.current.emit("set-lastseen-and-online", {
        userId: user?._id,
        online: online,
      });
    }
  };

  return {
    sendMessage,
    socket,
    markAsRead,
    setLastSeenAndOnlineEvent,
    typing,
    typerName,
    groupID,
    typerMode,
    setfetchMsgs,
    fetchMsgs,
  };
};

export default useSocket;
