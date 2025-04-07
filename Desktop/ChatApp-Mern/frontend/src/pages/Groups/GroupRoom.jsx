import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { BiSend } from "react-icons/bi";
import { GrAttachment, GrEmoji } from "react-icons/gr";
import { MdArrowBackIos, MdGroups } from "react-icons/md";
import {
  fetchAllMessages,
  resetMessages,
} from "../../redux/slice/messagesSlice";
import useSocket from "../../hooks/useSocket";
import { history } from "../../redux/slice/chatHistorySlice";
import { IoDocumentOutline, IoImageOutline } from "react-icons/io5";
import { CgPoll } from "react-icons/cg";
import { BsCamera } from "react-icons/bs";
import { uploadImage } from "../../firebase/firebase";
import toast, { Toaster } from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";
import { getAllUsers } from "../../redux/slice/allUsersSlice";
import { Spinner } from "flowbite-react";
import { PiChecksBold } from "react-icons/pi";

const GroupRoom = () => {
  const { groupId: pathGroupId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.currentUser.data);
  const allMessages = useSelector((state) => state.allMessages.data);
  const msgLoading = useSelector((state) => state.allMessages.isloading);
  const msgError = useSelector((state) => state.allMessages.isError);
  const [offset, setOffset] = useState(0);

  const allUser = useSelector((state) => state.allUsers.data);
  const [newGroupId, setNewGroupId] = useState(pathGroupId || "");
  const [user, setUser] = useState();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  let reverseMsgs = null;

  const messagesEndRef = useRef(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  const inputRef = useRef();
  const [loadImage, setLoadImage] = useState(null);
  const [setupSocket, setSetupSocket] = useState(false);
  const [downloadedImage, setDownloadedImage] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [group, setGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState(null);
  const [imagePlaceholder, setImagePlaceholder] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const mode = "group";
  const offsetRef = useRef();
  let allMsgs = 0;

  const msgDetails = {
    newChatId: newGroupId,
    userId: currentUser?.details._id,
    mode,
    offset,
  };

  const newMsgDetails = {
    newChatId: newGroupId,
    userId: currentUser?.details._id,
    mode,
    offset: 0,
  };

  const {
    sendMessage,
    socket,
    markAsRead,
    typing,
    typerName,
    groupID,
    fetchMsgs,
    setfetchMsgs,
  } = useSocket(setupSocket, newGroupId);

  useEffect(() => {
    if (newGroupId && socket.current !== undefined) markAsRead(mode);
  }, [newGroupId, socket.current]);

  useEffect(() => {
    if (allUser) {
      const member = allUser?.filter((usr) =>
        group?.members?.includes(usr?._id)
      );
      //   console.log("group members", member);
      setGroupMembers(member);
      console.log("groupMembers", groupMembers);
    }
  }, [allUser, group]);

  useEffect(() => {
    dispatch(getAllUsers());
    const urlParams = new URLSearchParams(location.search);
    const queryGroupId = urlParams.get("groupId");
    const activeGroupId = pathGroupId || queryGroupId;
    // if (activeGroupId !== newGroupId) {
    setNewGroupId(activeGroupId);
    setSetupSocket(true);
    // }
  }, [location.search, pathGroupId, newGroupId]);

  //   Fetch chat history
  useEffect(() => {
    console.log(newGroupId);
    if (newGroupId) {
      setMessages([]);
      dispatch(resetMessages());
      dispatch(fetchAllMessages(msgDetails));
    }
  }, [newGroupId]);

  useEffect(() => {
    if (!allMessages) return;

    allMsgs = parseInt(localStorage.getItem("allGroupMsgs")) || 0;

    if (allMessages.length !== allMsgs) {
      // console.log("messages state updated", allMessages)
      reverseMsgs = [...allMessages].reverse();
      // console.log("messages state updated reverseMsgs", reverseMsgs)
      setMessages(reverseMsgs);
      localStorage.setItem("allGroupMsgs", allMessages.length);
      dispatch(history(allMessages));
    }
  }, [allMessages]);

  //   Update messages state with chat history
  useEffect(() => {
    if (newGroupId && user && offset > 0 && fetchMsgs === false && !msgError) {
      dispatch(fetchAllMessages(msgDetails));
    }
  }, [offset]);

  useEffect(() => {
    if (fetchMsgs === true) {
      dispatch(resetMessages());
      setMessages([]);
      setOffset(0);
      dispatch(fetchAllMessages(newMsgDetails));
      setfetchMsgs(false);
    }
  }, [fetchMsgs]);

  useEffect(() => {
    const handleScroll = () => {
      if (offsetRef.current) {
        const scrollTop = offsetRef.current.scrollTop;
        // console.log("ScrollTop:", scrollTop, "offset", offset);

        if (scrollTop == 0 && !msgError) {
          setOffset((prev) => prev + 1);
        }
      }
    };

    if (offsetRef.current) {
      setTimeout(() => {
        offsetRef.current.addEventListener("scroll", handleScroll);
      }, 1000);
      // console.log("offset",offset)
    }

    return () => {
      if (offsetRef.current) {
        offsetRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    // console.log(newGroupId);
    if (currentUser?.details) {
      setUser(currentUser.details);
    }
    if (currentUser?.myGroups) {
      const filterGroup = currentUser?.myGroups?.filter(
        (grp) => grp?._id == newGroupId
      );
      setGroup(filterGroup[0]);
    }
  }, [currentUser, newGroupId]);

  // Auto-scroll to the bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typing]);

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!newMessage.trim() && !downloadedImage) {
      toast.error("Message or image is required.");
      return;
    }
    // Determine message content and image
    const content = newMessage.trim() || "";
    const image = downloadedImage || null;
    dispatch(resetMessages());
    sendMessage(content, image, mode);

    setDownloadedImage(null);
    setNewMessage("");
    setShowEmoji(false);
  };

  const handleSelectFile = () => {
    setOpenDropdown(false);
    inputRef.current.click();
  };

  const handleSendImage = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const postPicture = e.target.files;
    if (!postPicture || postPicture.length === 0) {
      toast.error("No file selected. Please choose an image.");
      return;
    }

    const photo = postPicture[0];
    setLoadImage(photo);

    try {
      const progressToastId = toast.loading("Uploading: 0%"); // Initialize a loading toast
      setImagePlaceholder(true);
      const downloadURL = await uploadImage(photo, (progress) => {
        toast.loading(`Uploading: ${progress}%`, { id: progressToastId }); // Update progress
      });

      toast.dismiss(progressToastId); // Remove progress toast
      toast.success("Image uploaded successfully!"); // Success toast

      console.log("Download URL:", downloadURL);
      setImagePlaceholder(false);
      setDownloadedImage(downloadURL); // Save to state or database
    } catch (error) {
      toast.dismiss(); // Dismiss any ongoing toasts
      toast.error("Failed to upload the image."); // Error toast
      console.error("Image upload failed:", error);
    }
  };

  // useEffect(() => {
  //   if (allMessages?.length > 0) {
  //     const chats = allMessages.filter((msg) => msg.receiver === newGroupId);
  //     setMessages(chats);
  //   }
  // }, [allMessages, user]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (socket.current) {
      socket.current.emit("typing", {
        sender: user?._id,
        name: user?.firstname,
        groupID: newGroupId && newGroupId,
        mode,
      });
    }
  };

  function formatMessageDate(dateString) {
    const msgDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // Check if the date is today
    if (
      msgDate.getDate() === today.getDate() &&
      msgDate.getMonth() === today.getMonth() &&
      msgDate.getFullYear() === today.getFullYear()
    ) {
      return "Today";
    }

    // Check if the date is yesterday
    if (
      msgDate.getDate() === yesterday.getDate() &&
      msgDate.getMonth() === yesterday.getMonth() &&
      msgDate.getFullYear() === yesterday.getFullYear()
    ) {
      return "Yesterday";
    }

    // Return formatted date
    return msgDate.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent newline in input
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white w-full h-screen flex flex-col relative">
      {/* Group Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b h-16 2xl:h-28">
        <div className="flex items-center space-x-2 2xl:space-x-5 ">
          <div
            className="cursor-pointer md:hidden"
            onClick={() =>
              navigate(`/textup?tab=${sessionStorage.getItem("previousTab")}`)
            }
          >
            <MdArrowBackIos />
          </div>
          <div className="text-3xl 2xl:text-5xl bg-gray-200 rounded-full p-2">
            <MdGroups className="text-gray-400" />
          </div>

          <div>
            <h1 className=" text-base 2xl:text-3xl font-medium text-[#334E83] font-acme">
              {group?.name}
            </h1>
            <p className="text-xs text-gray-500 2xl:text-lg">
              {typing && groupID === newGroupId ? (
                `${typerName} typing...`
              ) : (
                <div className="flex gap-0.5 overflow-hidden text-ellipsis">
                  {groupMembers?.length > 0 &&
                    groupMembers?.map((membr) => (
                      <p>
                        {membr?.firstname == currentUser?.details.firstname
                          ? "(You),"
                          : membr?.firstname.trim() + ","}
                      </p>
                    ))}
                </div>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4 2xl:space-x-8">
          <CiSearch className="w-6 h-6 2xl:w-9 2xl:h-9  text-gray-600 cursor-pointer" />
          <IoIosInformationCircleOutline className="w-6 h-6 2xl:w-9 2xl:h-9  text-gray-600 cursor-pointer" />
        </div>
      </div>
      <Toaster />

      {/* Chat Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 bg-gray-50 relative"
        ref={offsetRef}
      >
        {msgLoading && (
          <Spinner className="mx-auto p-1.5 text-2xl text-white bg-[#334E83] rounded-full" />
        )}
        {messages?.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex w-full mb-2 ${
                msg.sender?._id === user?._id ? "justify-end" : "justify-start"
              }`}
              ref={index == 10 && !typing ? messagesEndRef : null}
            >
              <div className="flex flex-col items-end">
                {msg.sender?._id != user._id && (
                  <div
                    className={` w-full max-w-xs 2xl:text-lg sm:max-w-sm md:max-w-md lg:max-w-lg px-2 text-xs text-[#334E83] font-acme mt-1 flex gap-2 ${
                      msg.sender?._id === user?._id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {`~${msg.sender?.firstname}`}
                  </div>
                )}

                {/* Image Content */}
                {msg.imageURL && (
                  <img
                    src={msg.imageURL}
                    alt="Uploaded content"
                    onClick={() => setShowImagePopup(true)}
                    className="mt-2 rounded-lg shadow-md w-64 h-48 sm:w-80 sm:h-60 md:w-96 md:h-72 lg:w-[400px] lg:h-[300px] 2xl:w-[600px] 2xl:h-[500px] object-cover cursor-pointer transition-transform hover:scale-105"
                  />
                )}

                {showImagePopup && msg.imageURL && (
                  <div
                    className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center"
                    onClick={() => setShowImagePopup(false)}
                  >
                    <img
                      src={msg.imageURL}
                      alt="Full-size"
                      className="max-w-[90%] max-h-[90%] rounded-lg shadow-2xl transition-all duration-300"
                    />
                  </div>
                )}
                {/* Message Content */}
                {msg.content && (
                  <div
                    className={`w-full max-w-[260px] 2xl:text-2xl flex-col sm:max-w-sm md:max-w-md lg:max-w-lg 2xl:max-w-2xl  text-wrap  rounded-lg shadow ${
                      msg.sender?._id === user?._id
                        ? "bg-[#334E83] text-white"
                        : "bg-gray-200"
                    } break-words`}
                  >
                    <div className="pt-2 font-poppins font-light px-4">
                      {msg.content}
                    </div>
                    {/* Message Metadata */}
                    <div
                      className={` w-full pl-4 pr-2 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg 2xl:text-base text-gray-500 flex gap-1 ${
                        msg.sender?._id === user?._id
                          ? "justify-end text-white"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`text-[11px] 2xl:text-base ${
                          msg.sender?._id === user?._id && "opacity-60"
                        }`}
                      >
                        {formatMessageDate(msg.msgDate)}
                      </div>
                      <div
                        className={`text-[11px] 2xl:text-base text-nowrap ${
                          msg.sender?._id === user?._id && "opacity-60"
                        }`}
                      >
                        {new Date(msg.msgDate).toLocaleString("en-US", {
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true,
                        })}
                      </div>
                      {msg.sender?._id === user?._id && (
                        <div className="w-full flex items-end justify-end">
                          <PiChecksBold
                            className={`ml-1 text-base ${
                              msg.unread
                                ? "text-purple-500"
                                : "text-white opacity-50"
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">No messages yet...</div>
        )}

        {typing && (
          <>
            <h5 className="text-xs text-[#334E83] font-acme">~{typerName}</h5>
            <div className="flex justify-start items-center space-x-1">
              <div className="bg-gray-200 text-gray-800 px-3 py-3 rounded-2xl rounded-tl-none shadow-md transition-opacity duration-300 animate-fadeIn">
                <div className="flex space-x-1">
                  <span className="w-1.5 h-1.5 bg-[#334E83] rounded-full animate-typingBounce" />
                  <span
                    className="w-1.5 h-1.5 bg-[#334E83] rounded-full animate-typingBounce delay-150"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-[#334E83] rounded-full animate-typingBounce delay-300"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
        {typing && <div ref={messagesEndRef} />}
      </div>

      <EmojiPicker
        open={showEmoji}
        className="absolute bottom-0"
        onEmojiClick={(emo) => setNewMessage(newMessage + " " + emo.emoji)}
      />

      {/* Message Input Area */}
      <div className="border-t p-2 bg-white 2xl:p-3">
        <div className="flex w-full items-center space-x-2 md:space-x-4  2xl:space-x-8">
          <GrEmoji
            onClick={() => setShowEmoji((prev) => !prev)}
            className="w-6 h-6 2xl:w-9 2xl:h-9 text-gray-600 cursor-pointer"
          />

          <button onClick={() => setOpenDropdown((prev) => !prev)}>
            <GrAttachment className="w-6 h-6 2xl:w-7 2xl:h-7 text-gray-600 cursor-pointer" />
          </button>

          {/* Dropdown with transitions */}
          {openDropdown && (
            <div
              className={`bottom-14 left-4 opacity-100 translate-y-0 h-auto absolute transform transition-all duration-300 ease-in-out cursor-pointer text-[#334E83] bg-white flex-col justify-start items-center  px-5 py-4 rounded-md 2xl:py-8 2xl:px-10`}
            >
              {/* Photo Option */}
              <div
                onClick={() => handleSelectFile()}
                className="flex justify-start items-center font-roboto text-lg font-light gap-2 2xl:text-2xl 2xl:gap-5 2xl:mb-3"
              >
                <span>
                  <IoImageOutline />
                </span>
                <span>Photo</span>
              </div>

              {/* Document Option */}
              <div
                onClick={() => handleSelectFile()}
                className="flex justify-start items-center font-roboto text-lg font-light gap-2 2xl:text-2xl 2xl:gap-5 2xl:mb-3"
              >
                <span>
                  <IoDocumentOutline />
                </span>
                <span>Document</span>
              </div>

              {/* Poll Option */}
              <div className="flex justify-start items-center font-roboto text-lg font-light gap-2 2xl:text-2xl 2xl:gap-5 2xl:mb-3">
                <span>
                  <CgPoll />
                </span>
                <span>Poll</span>
              </div>

              {/* Camera Option */}
              <div className="flex justify-start items-center font-roboto text-lg font-light gap-2 2xl:text-2xl 2xl:gap-5 ">
                <span>
                  <BsCamera />
                </span>
                <span>Camera</span>
              </div>
            </div>
          )}

          <input
            type="file"
            className="hidden" // hide it from view, display via click only
            ref={inputRef}
            accept="image/*"
            onChange={(e) => {
              handleSendImage(e); // Prevents bubbling up
            }}
          />

          {downloadedImage && (
            <img
              className="w-3/6 h-1/3 object-cover bottom-16 left-16 absolute ring-1 ring-[#334E83] rounded-sm"
              src={`${downloadedImage}`}
            />
          )}

          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            className="flex-1 2xl:text-xl  p-2 max-w-5xl 2xl:min-w-[950px] 2xl:max-w-[1250px] border-b border-gray-300 rounded-md focus:outline-none focus:border-[#334E83] placeholder-gray-400"
          />

          <button
            onClick={handleSendMessage}
            className="flex items-center justify-center p-2 bg-[#334E83] text-white rounded-full hover:bg-[#4a6db9]"
          >
            <BiSend className="w-5 h-5 2xl:w-8 2xl:h-8" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupRoom;
