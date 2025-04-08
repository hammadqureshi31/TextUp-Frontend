import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectChat } from "../../redux/slice/selectedChat";
import useSocket from "../../hooks/useSocket";
import { IoImageOutline } from "react-icons/io5";
import {
  fetchAllMessages,
  resetMessages,
} from "../../redux/slice/messagesSlice";

const ChatCard = ({ singleContact, loading, currentTab }) => {
  const [lastMessage, setLastMessage] = useState(null);
  const [userLastMsgs, setUserLastMsgs] = useState();
  const [unreadCount, setUnreadCount] = useState(0);
  const selectedChat = useSelector((state) => state.selectedChat);
  const allMessages = useSelector((state) => state.allMessages);
  const currentUser = useSelector((state) => state.currentUser.data);
  const [firstName, setirstName] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const setupSocket = true;
  const { socket, typing, typerMode } = useSocket(
    singleContact?._id && setupSocket,
    singleContact?._id
  );

  // console.log(currentUser);
  // console.log("currentUser.unread.length",currentUser.unread);

  useEffect(() => {
    const msgMap = new Map();
    if (currentUser) {
      Object.entries(currentUser?.lastMessages).forEach(([key, value]) => {
        msgMap.set(key, value);
      });

      setUserLastMsgs(msgMap);
    }
  }, [currentUser]);

  useEffect(() => {
    if (userLastMsgs) {
      userLastMsgs?.forEach((value, key) => {
        if (key === singleContact?._id && value?.mode === "inbox") {
          setLastMessage(value);
        }
      });
    }

     if (currentUser?.unread.length > 0) {
      const updateUnread = currentUser?.unread.filter((msg)=>msg?.sender === singleContact?._id)
      setUnreadCount(updateUnread || 0);
    }
  }, [userLastMsgs]);

  // console.log("LastMessage", lastMessage);

  // useEffect(() => {
  //   if (!currentUser?.unread) {
  //     console.log("line 34", currentUser.unread.length);
  //     currentUser.unread && setUnreadCount(currentUser.unread?.length);
  //   }

  //   if (allMessages?.length > 0) {
  //     // console.log(allMessages);
  //     const relatedMessages = allMessages.filter(
  //       (msg) =>
  //         (msg.sender?._id === singleContact?._id &&
  //           msg.receiver === currentUser.details?._id && msg.mode == "inbox") ||
  //         (msg.receiver === singleContact?._id &&
  //           msg.sender?._id === currentUser.details?._id && msg.mode == "inbox")
  //     );

  //     if (relatedMessages?.length > 0) {
  //       const latestMsg = relatedMessages[relatedMessages.length - 1];
  //       // console.log(latestMsg);
  //       setLastMessage(latestMsg);

  //       const newUnreadCount = relatedMessages.filter(
  //         (msg) => msg.receiver === currentUser?.details?._id && !msg.unread
  //       ).length;
  //       setUnreadCount(newUnreadCount);
  //     }
  //   }

  // }, [allMessages, currentUser, singleContact]);

  const handleClick = () => {
    if (singleContact?._id) {
      dispatch(selectChat(singleContact?._id));
      sessionStorage.setItem("previousTab", currentTab);
      sessionStorage.setItem("replaceChat", currentTab);
      dispatch(resetMessages());
      // dispatch(fetchAllMessages(singleContact?._id, currentUser?.details._id))
      navigate(`/textup?tab=${currentTab}&to=${singleContact?._id}`);
    }
  };

  useEffect(() => {
    if (singleContact?.firstname) {
      setirstName(singleContact?.firstname);
    }
  }, [singleContact]);

  return (
    <div
      onClick={handleClick}
      className={`flex items-center p-4 rounded-lg overflow-hidden hover:bg-gray-100 transition duration-300 cursor-pointer ${
        selectedChat === singleContact?._id ? "bg-gray-100" : "bg-white"
      }`}
    >
      <div className="flex-shrink-0">
        {loading ? (
          <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
        ) : (
          <img
            src={singleContact?.profilePicture || "./profile-placeholder.webp"}
            alt={`${singleContact?.firstname}'s profile`}
            className="w-12 h-12 rounded-full object-cover 2xl:w-20 2xl:h-20"
          />
        )}
      </div>

      <div className="ml-3 flex flex-col w-full">
        <div className="flex justify-between items-start">
          {loading ? (
            <div className="w-32 h-6 bg-gray-200 rounded-md animate-pulse"></div>
          ) : (
            <h1 className="text-base sm:text-lg 2xl:text-3xl font-semibold text-[#334E83] font-poppins tracking-tighter">
              {firstName.slice(0, 1).toUpperCase()}
              {firstName.slice(1)}
            </h1>
          )}
          {loading ? (
            <div className="w-12 h-4 bg-gray-200 rounded-md animate-pulse"></div>
          ) : (
            <span className="text-xs opacity-30 font-sans 2xl:text-lg">
              {lastMessage &&
                new Date(lastMessage.msgDate).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center mt-1 2xl:mt-2">
          {loading ? (
            <div className="w-40 h-4 bg-gray-200 rounded-md animate-pulse"></div>
          ) : (
            <p className="text-sm 2xl:text-xl truncate opacity-40 font-roboto overflow-hidden">
              {typing === singleContact?._id && typerMode == "inbox" ? (
                <div className="font-acme text-[#334E83] font-light tracking-wide">
                  typing...
                </div>
              ) : lastMessage?.sender?._id ? (
                // Check sender/receiver relationship for lastMessage
                (lastMessage?.sender?._id === currentUser.details?._id &&
                  lastMessage?.receiver === singleContact?._id) ||
                (lastMessage?.receiver === currentUser.details?._id &&
                  lastMessage?.sender?._id === singleContact?._id) ? (
                  lastMessage.imageURL ? (
                    <div className="flex gap-2">
                      <IoImageOutline className="mt-0.5" />
                      <span>image</span>
                    </div>
                  ) : lastMessage.content?.length > 35 ? (
                    `${lastMessage.content?.substring(0, 35)}...`
                  ) : (
                    lastMessage.content
                  )
                ) : (
                  "No messages yet"
                )
              ) : // Check sender/receiver relationship for lastMessage
              (lastMessage?.sender === currentUser.details?._id &&
                  lastMessage?.receiver === singleContact?._id) ||
                (lastMessage?.receiver === currentUser.details?._id &&
                  lastMessage?.sender === singleContact?._id) ? (
                lastMessage.imageURL ? (
                  <div className="flex gap-2">
                    <IoImageOutline className="mt-0.5" />
                    <span>image</span>
                  </div>
                ) : lastMessage.content?.length > 35 ? (
                  `${lastMessage.content?.substring(0, 33)}...`
                ) : (
                  lastMessage.content
                )
              ) : (
                "No messages yet"
              )}
            </p>
          )}
          {loading ? (
            <div className="w-6 h-6 bg-gray-200 rounded-full ml-1.5 animate-pulse"></div>
          ) : (
            lastMessage?.receiver === currentUser?.details?._id &&
            unreadCount?.length > 0 && (
              <div className="text-xs bg-[#F04A4C] text-white px-2 py-1 rounded-full ml-2 2xl:text-lg 2xl:px-3">
                {unreadCount?.length}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatCard;
