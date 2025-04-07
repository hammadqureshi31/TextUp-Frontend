import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { HiOutlineVideoCamera } from "react-icons/hi2";
import { IoCallOutline } from "react-icons/io5";
import { BiSend } from "react-icons/bi";
import { GrAttachment, GrEmoji } from "react-icons/gr";
import { MdArrowBackIos } from "react-icons/md";
import {
  fetchAllMessages,
  resetMessages,
} from "../../redux/slice/messagesSlice";
import useSocket from "../../hooks/useSocket";
import { history } from "../../redux/slice/chatHistorySlice";
import { IoImageOutline } from "react-icons/io5";
import { IoDocumentOutline } from "react-icons/io5";
import { CgPoll } from "react-icons/cg";
import { BsCamera } from "react-icons/bs";
import { uploadImage } from "../../firebase/firebase";
import toast, { Toaster } from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";
import { useCallSocket } from "../../context/SocketProvider";
import CallUI from "../../components/Chat/CallUI";
import PeerService from "../../service/peer";
// import { ref } from "firebase/storage";
import { Spinner } from "flowbite-react";
import { FaUser } from "react-icons/fa";
import { PiChecksBold, PiChecksLight } from "react-icons/pi";

const ChatRoom = () => {
  const { userId: pathUserId, callerId, calleeId, callOption } = useParams();

  console.log("callerId, calleeId, callOption", callerId, calleeId, callOption);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.currentUser.data);
  const allMessages = useSelector((state) => state.allMessages.data);
  const msgLoading = useSelector((state) => state.allMessages.isloading);
  const msgError = useSelector((state) => state.allMessages.isError);
  const callOffer = useSelector((state) => state.callOffer);
  const [offset, setOffset] = useState(0);

  const allUser = useSelector((state) => state.allUsers);
  const chatHistory = useSelector((state) => state.chatHistory);
  const [newChatId, setNewChatId] = useState(pathUserId || "");
  const [user, setUser] = useState();
  const [receiveBy, setReceiveBy] = useState();
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
  const mode = "inbox";
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [callee, setCallee] = useState(null);
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [showCallUI, setShowCallUI] = useState(false);
  const [callStreams, setCallStreams] = useState(false);
  const [whichCall, setWhichCall] = useState(false);
  const [currentTab, setCurrentTab] = useState(null);
  const [rejected, setRejected] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [imagePlaceholder, setImagePlaceholder] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const offsetRef = useRef();
  let allMsgs = 0;
  let negotiationCount = 1;
  let negotiationCountEmit = 1;
  let streamRef = useRef();
  const msgDetails = {
    newChatId: newChatId || receiveBy?._id,
    userId: currentUser?.details._id || user?._id,
    mode,
    offset,
  };

  const newMsgDetails = {
    newChatId: newChatId || receiveBy?._id,
    userId: currentUser?.details._id || user?._id,
    mode,
    offset: 0,
  };

  const {
    sendMessage,
    socket,
    markAsRead,
    typing,
    typerMode,
    fetchMsgs,
    setfetchMsgs,
  } = useSocket(setupSocket, newChatId);
  const [decFetch, setDecFetch] = useState(false);

  console.log("callOffer", callOffer);

  // Mark Unread messages as read
  useEffect(() => {
    if (
      (user?._id && (newChatId || pathUserId)) ||
      socket.current !== undefined
    ) {
      // console.log(newChatId, " ", pathUserId);
      markAsRead(mode);
    }
    // console.log("all users:", allUser);
  }, [newChatId, pathUserId, socket.current]);

  // const handleSetStreams = async () => {
  //   const stream = await navigator.mediaDevices.getUserMedia({
  //     video: whichCall === "video" ? true : false,
  //     audio: true,
  //   });
  //   setMyStream(stream);
  // };

  // get and set userid from url
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const queryUserId = urlParams.get("to");
    const activeUser = urlParams.get("from");
    const tab = urlParams.get("tab");
    const call = urlParams.get("call");
    const activeUserId = pathUserId || queryUserId || callerId;
    // if (activeUser) {
    localStorage.setItem("callee", activeUserId);
    setNewChatId(activeUserId);
    setOffset(0);
    // }
    if (newChatId || pathUserId) setSetupSocket(true);
    if (call || callOption) {
      setIncomingCall(activeUserId);
      setShowIncomingCall(true);
      setIncomingOffer(callOffer);
      setWhichCall(call || callOption);
      console.log("call || callOption && offerProp");
      // handleSetStreams();
      localStorage.setItem("from", currentUser?.details._id);
    }
    if (tab) setCurrentTab(tab || "messages");
  }, [location.search, pathUserId, newChatId]);

  // Update messages state with chat history

  useEffect(() => {
    if (!allMessages) return;

    allMsgs = parseInt(localStorage.getItem("allMsgs")) || 0;

    if (allMessages.length !== allMsgs) {
      // console.log("messages state updated", allMessages)
      reverseMsgs = [...allMessages].reverse();
      // console.log("messages state updated reverseMsgs", reverseMsgs)
      setMessages(reverseMsgs);
      localStorage.setItem("allMsgs", allMessages.length);
      dispatch(history(allMessages));
    }
  }, [allMessages]);

  // Set current and opposite user data
  useEffect(() => {
    if (currentUser?.details) {
      setUser(currentUser.details);
    }
    if (currentUser?.contactedUsers && newChatId) {
      const oppositeUser = currentUser.contactedUsers.find(
        (u) => u?._id === newChatId
      );
      if (oppositeUser) {
        setReceiveBy(oppositeUser);
      }
    }
  }, [currentUser, newChatId, currentUser?.contactedUsers]);

  useEffect(() => {
    if (newChatId && receiveBy?._id) {
      // dispatch(resetMessages());
      dispatch(fetchAllMessages(msgDetails));
      // setOffset(0);
      // setDecFetch(false);
    }
  }, [newChatId, receiveBy?._id]);

  useEffect(() => {
    if (newChatId && user && offset > 0 && fetchMsgs === false && !msgError) {
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

  // Auto-scroll to the bottom of messages
  useEffect(() => {
    if (messagesEndRef.current && allMessages) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typing]);

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!newMessage.trim() && !downloadedImage) {
      toast.error("Message is required.");
      return;
    }
    // Determine message content and image
    const content = newMessage.trim() || "";
    const image = downloadedImage || null;
    dispatch(resetMessages());
    sendMessage(content, image, mode);
    // setOffset(0);
    // setDecFetch(true);
    setDownloadedImage(null);
    setNewMessage("");
    setShowEmoji(false);
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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

  // extract messages
  // useEffect(() => {
  //   if (allMessages?.length > 0 && allMessages.length !== allMsgs) {
  //     console.log("allMessages", allMessages);
  //     const chats = allMessages.filter(
  //       (msg) =>
  //         (msg.sender?._id === user?._id && msg.receiver === receiveBy?._id) ||
  //         (msg.receiver === user?._id && msg.sender?._id === receiveBy?._id)
  //     );
  //     setMessages(chats);
  //   }
  // }, [allMessages, user, receiveBy]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (socket.current) {
      socket.current?.emit("typing", {
        sender: user?._id,
        groupID: receiveBy?._id,
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

  const callSocket = useCallSocket();

  useEffect(() => {
    // console.log("PeerService", PeerService.peer);
    if (!PeerService.peer) {
      console.warn("⚠️ Peer connection is not initialized yet!");
      return;
    } else {
      console.log("⚠️ Peer connection is initialized");
    }
  }, []);

  const handleCallUser = useCallback(
    async (user, callMode) => {
      if (user.isOnline) {
        try {
          // Get the local stream
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: callMode === "video" ? true : false,
          });
          setMyStream(stream);

          // Create an offer
          const offer = await PeerService.getOffer();
          // console.log("Created offer:", offer);

          // Set the local description
          // await PeerService.setLocalDescription(offer);
          // console.log("Set local description with offer:", offer);

          // Send the offer to the remote peer
          callSocket.emit("make:call", {
            userId: user?._id,
            from: currentUser?.details,
            offer,
            callMode,
          });

          setShowCallUI(true);
          setWhichCall(callMode);
        } catch (error) {
          console.error("Error creating or setting offer:", error);
        }
      } else {
        console.log(`${user.firstname} is offline`);
        toast.error(`${user.firstname} is offline, you can sent text`);
      }
    },
    [callSocket]
  );

  const handleIncomingCall = useCallback(
    async ({ from, offer, userId, callMode }) => {
      console.log("set offer:", offer);
      setIncomingCall(from);
      setIncomingOffer(offer);
      setShowIncomingCall(true);
      setCallee(userId);
      setWhichCall(callMode);
      console.log("callMode: ", callMode);
    },
    [callSocket]
  );

  const sendStreams = useCallback(() => {
    console.log(myStream, PeerService.peer);
    if (myStream && PeerService.peer) {
      for (const track of myStream.getTracks()) {
        console.log("tracks", track);
        PeerService.peer.addTrack(track, myStream);
      }
      console.log("✅ Local tracks added to peer connection");
    } else {
      console.warn("⚠️ No local stream or peer connection found");
    }
  }, [myStream]);

  const handleAccept = async () => {
    console.log("incoming offer:", incomingOffer);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: whichCall === "video" ? true : false,
    });
    setMyStream(stream);
    sendStreams();
    // console.log("streams", stream);
    const ans = await PeerService.getAnswer(incomingOffer);
    callSocket.emit("call:accepted", { userId: incomingCall?._id, ans });
    setShowIncomingCall(false);
    setShowCallUI(true);
    setShowTimer(true);
  };

  const handleReject = useCallback(() => {
    const rejectedBy = localStorage.getItem("from");
    callSocket.emit("reject:call", {
      userId: receiveBy?._id || incomingCall?._id || rejectedBy,
    });

    // Clean up the local stream
    if (myStream) {
      myStream.getTracks().forEach((track) => {
        if (track.readyState === "live") {
          track.stop();
        }
      });
      setMyStream(null);
    }

    // Clean up the peer connection
    if (PeerService.peer) {
      PeerService.close();
      PeerService.peer = null;
    }

    // Reset all call-related states
    setIncomingCall(null);
    setIncomingOffer(null);
    setCallee(null);
    setShowIncomingCall(false);
    setRejected((prev) => !prev);
    setShowCallUI(false);

    // Reload the page and navigate
    navigate("/");
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }, [callSocket, incomingCall, myStream, navigate]);

  const handleCallAccepted = useCallback(
    async ({ from, ans }) => {
      await PeerService.setLocalDescription(ans);
      console.log("✅ Call Accepted! Setting remote description...", ans);

      PeerService.peer.ontrack = (ev) => {
        console.log("🚀 Remote tracks received in ontrack!", ev);
      };

      setShowCallUI(true);
      setShowTimer(true);
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    try {
      const userId = localStorage.getItem("callee");
      console.log("callee local", userId);
      const offer = await PeerService.getOffer();
      if (userId && offer) {
        callSocket.emit("peer:nego:needed", { offer, userId });
      }
    } catch (error) {
      console.error("Error handling negotiation needed event:", error);
    }
  }, [callSocket]);

  useEffect(() => {
    if (PeerService.peer) {
      PeerService.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    }
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      try {
        console.log("🔄 Received offer for negotiation:", offer);

        const ans = await PeerService.getAnswer(offer);

        callSocket.emit("peer:nego:done", { ans, userId: from });
        console.log("✅ Sent negotiation answer.");
      } catch (error) {
        console.error("❌ Error handling negotiation-needed event:", error);
      }
    },
    [callSocket]
  );

  const handleNegoNeedFinal = useCallback(async ({ from, ans }) => {
    console.log("final", ans);
    await PeerService.setLocalDescription(ans);
    setShowTimer(true);
    // sendStreams();
  }, []);

  // const handleTrack = (ev) => {
  //   console.log("🔊 handleTrack invoked!", ev);
  //   if (ev.streams.length > 0) {
  //     const remoteStream = ev.streams[0];
  //     console.log("✅ Got remote stream!", remoteStream);
  //     setRemoteStream(remoteStream);
  //   } else {
  //     console.warn("⚠️ No streams received in track event");
  //   }
  // };

  useEffect(() => {
    if (PeerService.peer) {
      PeerService.peer.addEventListener("track", async (ev) => {
        const remoteStream = ev.streams;
        console.log("GOT TRACKS!!", remoteStream[0]);
        setRemoteStream(remoteStream[0]);
        setCallStreams((prev) => !prev);
        // setShowCallUI(true);
        // sendStreams()
      });
    }
  }, []);

  const handleCallRejected = () => {
    toast.error("Call rejected");

    if (myStream) {
      myStream.getTracks().forEach((track) => {
        if (track.readyState === "live") {
          console.log("Stopping track:", track);
          track.stop();
        }
      });
      setMyStream(null);
    }

    if (PeerService.peer) {
      PeerService.close();
      PeerService.peer = null;
    }

    setIncomingCall(null);
    setIncomingOffer(null);
    // setCallee(null);
    setShowCallUI(false);

    navigate("/");
  };

  useEffect(() => {
    callSocket.on("incoming:call", handleIncomingCall);
    callSocket.on("call:accepted", handleCallAccepted);
    callSocket.on("peer:nego:needed", handleNegoNeedIncomming);
    callSocket.on("peer:nego:final", handleNegoNeedFinal);
    callSocket.on("call:rejected", handleCallRejected);

    return () => {
      callSocket.off("incoming:call", handleIncomingCall);
      callSocket.off("call:accepted", handleCallAccepted);
      callSocket.off("peer:nego:needed", handleNegoNeedIncomming);
      callSocket.off("peer:nego:final", handleNegoNeedFinal);
      callSocket.off("call:rejected");
    };
  }, [
    callSocket,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  return (
    <div className="bg-white w-full h-screen flex flex-col relative">
      {/* User Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b h-16 2xl:h-28">
        <div className="flex items-center space-x-2 2xl:space-x-5 ">
          <div
            className="cursor-pointer md:hidden"
            onClick={() => navigate("/textup")}
          >
            <MdArrowBackIos />
          </div>
          {receiveBy?.profilePicture ? (
            <img
              src={
                receiveBy?.profilePicture || "../../profile-placeholder.webp"
              }
              alt={`${receiveBy?.firstname}'s profile`}
              className="w-10 h-10 rounded-full object-cover 2xl:w-16 2xl:h-16"
            />
          ) : (
            <FaUser className="w-11 h-11 rounded-full object-cover 2xl:w-16 2xl:h-16 text-gray-200 bg-gray-100/60 p-1.5" />
          )}

          <div>
            <h1 className=" text-base text-nowrap text-ellipsis 2xl:text-3xl font-medium text-[#334E83] font-acme">
              {receiveBy?.firstname.slice(0, 1).toUpperCase()}
              {receiveBy?.firstname.slice(1)} {receiveBy?.lastname}
            </h1>
            <p className="hidden md:block text-xs text-gray-500 2xl:text-lg">
              {typing === receiveBy?._id
                ? "typing..."
                : receiveBy?.isOnline
                ? "online"
                : "Last seen " +
                  new Date(receiveBy?.lastSeen).toLocaleString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
            </p>

            <p className="text-xs text-gray-500 md:hidden">
              {typing === receiveBy?._id
                ? "typing..."
                : receiveBy?.isOnline
                ? "online"
                : "Last seen " +
                  new Date(receiveBy?.lastSeen).toLocaleString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    // year: "numeric",
                    // month: "short",
                    // day: "numeric",
                  })}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4 2xl:space-x-8 ">
          <HiOutlineVideoCamera
            onClick={() => handleCallUser(receiveBy, "video")}
            className="w-6 h-6 2xl:w-9 2xl:h-9  text-gray-600 cursor-pointer"
          />

          <IoCallOutline
            onClick={() => handleCallUser(receiveBy, "voice")}
            className="w-6 h-6 2xl:w-9 2xl:h-9 text-gray-600 cursor-pointer"
          />
          <IoIosInformationCircleOutline className="w-6 h-6 2xl:w-9 2xl:h-9 text-gray-600 cursor-pointer" />
        </div>
      </div>
      <Toaster />

      {/* Chat Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 bg-gray-50 pb-3"
        ref={offsetRef}
      >
        {msgLoading && (
          <Spinner className="mx-auto p-1.5 text-2xl text-white bg-[#334E83] rounded-full" />
        )}
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex w-full mb-2 ${
                msg.sender?._id === user?._id ? "justify-end" : "justify-start"
              }`}
              ref={index == 10 && !typing ? messagesEndRef : null}
            >
              <div className="flex flex-col items-end">
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
                    className={`w-full max-w-xs 2xl:text-2xl flex-col sm:max-w-sm md:max-w-md lg:max-w-lg 2xl:max-w-2xl  text-wrap  rounded-lg shadow ${
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

        {typing && typerMode === mode && (
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
        )}

        {typing && <div ref={messagesEndRef} />}
      </div>

      <EmojiPicker
        open={showEmoji}
        className="absolute bottom-0 w-fit"
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
              className={`bottom-14 left-4 opacity-100 translate-y-0 h-auto absolute transform transition-all duration-300 ease-in-out cursor-pointer text-[#334E83] bg-white flex-col justify-start items-center px-5 py-4 rounded-md 2xl:py-8 2xl:px-10`}
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
                className="flex justify-start items-center pt-1.5 font-roboto text-lg font-light gap-2 2xl:text-2xl 2xl:gap-5 2xl:mb-3"
              >
                <span>
                  <IoDocumentOutline />
                </span>
                <span>Document</span>
              </div>

              {/* Poll Option */}
              <div className="flex justify-start items-center pt-1.5 font-roboto text-lg font-light gap-2 2xl:text-2xl 2xl:gap-5 2xl:mb-3">
                <span>
                  <CgPoll />
                </span>
                <span>Poll</span>
              </div>

              {/* Camera Option */}
              <div className="flex justify-start items-center pt-1.5 font-roboto text-lg font-light gap-2 2xl:text-2xl 2xl:gap-5">
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

          {imagePlaceholder && (
            <div className="w-3/6 h-1/3 flex justify-center text-center items-center bottom-16 left-16 absolute ring-1 ring-gray-200 rounded-sm">
              <Spinner className="mx-auto bg-white" />
            </div>
          )}

          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onKeyDown={handleKeyDown}
            onChange={handleTyping}
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

      {/* Incoming Call UI */}
      {incomingCall && showIncomingCall && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-10 bg-white shadow-lg rounded-lg p-4 w-80 text-center">
          {/* Caller Info */}
          <div className="flex flex-col items-center gap-3">
            {incomingCall?.profilePicture || receiveBy?.profilePicture ? (
              <img
                src={
                  incomingCall?.profilePicture ||
                  receiveBy?.profilePicture ||
                  "../../profile-placeholder.webp"
                }
                alt="Caller"
                className="rounded-full w-20 h-20 border-4 border-gray-300 shadow-md"
              />
            ) : (
              <FaUser className="w-20 h-20 border-4 border-gray-300 shadow-md rounded-full text-gray-200 bg-gray-100/60 p-1.5" />
            )}

            <h1 className="text-xl font-semibold text-gray-800">
              {incomingCall?.firstname || receiveBy?.firstname}
            </h1>
            <p className="text-gray-500">Incoming Call...</p>
          </div>

          {/* Accept & Reject Buttons */}
          <div className="flex justify-around mt-4">
            <button
              onClick={handleAccept}
              className="px-4 py-2 rounded-md bg-green-500 text-white font-medium hover:bg-green-600 transition-all"
            >
              Accept
            </button>
            <button
              onClick={handleReject}
              className="px-4 py-2 rounded-md bg-red-500 text-white font-medium hover:bg-red-600 transition-all"
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Call UI */}
      {showCallUI && (
        <div className="absolute inset-0">
          {/* Call Screen */}
          <div className="relative h-full w-full">
            <CallUI
              myStream={myStream}
              remoteStream={remoteStream}
              whichCall={whichCall}
              endCall={handleReject}
              from={incomingCall}
              sendStreams={sendStreams}
              receiveBy={receiveBy}
              showTimer={showTimer}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
