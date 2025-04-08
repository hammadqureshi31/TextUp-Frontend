import React, { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import MessageList from "../../components/Chat/MessageList";
import GroupList from "../../components/Chat/GroupList";
import ContactList from "../../components/Chat/ContactList";
import Settings from "../../components/Setting/Settings";
import HeaderMenu from "../../components/Navigation/HeaderMenu";
import FooterMenu from "../../components/Navigation/FooterMenu";
import Sidebar from "../../components/Navigation/Sidebar";
import EmptyChatScreen from "../../components/Chat/EmptyChatScreen";
import ReplaceChatScreen from "../../components/Chat/ReplaceChatScreen";
import { useCallSocket } from "../../context/SocketProvider";
import useSocket from "../../hooks/useSocket";
import PeerService from "../../service/peer";
import CallUI from "../../components/Chat/CallUI";
import Search from "../../components/Search/Search";
import { fetchAllMessages } from "../../redux/slice/messagesSlice";
import { setCallOffer } from "../../redux/slice/callOffer";
import { backendPortURL } from "../../config";

const Home = () => {
  const location = useLocation();
  const currentUser = useSelector((state) => state.currentUser?.data.details);
  const selector = useSelector((state) => state.currentUser?.data);
  const callOffer = useSelector((state)=>state.callOffer);
  const allUser = useSelector((state) => state.allUsers.data);
  const selectedChat = useSelector((state) => state.selectedChat);
  const allMessage = useSelector((state) => state.allMessages.data);
  const [newChatId, setNewChatId] = useState();
  const [currentTab, setCurrentTab] = useState("messages");
  const [previousTab, setPreviousTab] = useState(null);
  const [replaceChat, setReplaceChat] = useState(null);
  const [showChatRoom, setShowChatRoom] = useState(null);
  const [contactAdded, setContactAdded] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();
  const { socket, setLastSeenAndOnlineEvent } = useSocket(true);
  const callSocket = useCallSocket();
  const [incomingCall, setIncomingCall] = useState(null);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [callee, setCallee] = useState(null);
  const [offerProp, setOfferProp] = useState(null);
  const [showSearch, setShowSearch] = useState(null);
  const dispatch = useDispatch();
  
  useEffect(() => {
    // console.log(socket);
    if (currentUser && socket?.current) {
      if (socket?.current !== undefined) {
        setLastSeenAndOnlineEvent(true);
      } else return;
    }
  }, []);

  // const handleBeforeUnload = () => {
  //   if (socket?.current !== undefined) {
  //     setLastSeenAndOnlineEvent(false);
  //   }
  // };

  const handleBeforeUnload = () => {
    const url = `${backendPortURL}user/update-lastseen`; 
    const data = JSON.stringify({ userId: currentUser._id });

    navigator.sendBeacon(url, data);
  };

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [socket, setLastSeenAndOnlineEvent]);

  useEffect(() => {
    if (selectedChat) {
      setNewChatId(selectedChat);
    }

    // console.log("Home rendering");
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get("tab");
    const userIdParam = urlParams.get("to");
    const groupParam = urlParams.get("create");
    const groupIdParam = urlParams.get("groupId");
    setPreviousTab(sessionStorage.getItem("previousTab"));
    setReplaceChat(sessionStorage.getItem("replaceChat"));

    if (tabParam) {
      setCurrentTab(tabParam);
      setShowSearch(false);
      if (previousTab === replaceChat) {
        setShowChatRoom(null);
      }
      if (tabParam === "search") {
        setShowSearch(true);
      }
    }

    if (userIdParam) {
      const windowWidth = window.innerWidth;

      if (windowWidth >= 786) {
        setShowChatRoom("chatroom");
      } else if (windowWidth < 786) {
        navigate(`/textup/chats/${userIdParam}`);
      }
    }

    if (groupParam) {
      const windowWidth = window.innerWidth;

      if (windowWidth >= 786) {
        setShowChatRoom("creategroup");
      } else if (windowWidth < 786) {
        navigate(`/textup/groups/create`);
      }
    }

    if (groupIdParam) {
      const windowWidth = window.innerWidth;

      if (windowWidth >= 786) {
        setShowChatRoom("grouproom");
      } else if (windowWidth < 786) {
        navigate(`/textup/groups/${groupIdParam}`);
      }
    }
  }, [
    location.search,
    currentTab,
    selectedChat,
    newChatId,
    showChatRoom,
    currentUser,
    selector
  ]);

  useEffect(() => {
    // console.log("callSocket", callSocket);
    callSocket.emit("joined", {
      userId: currentUser?._id,
      socketId: callSocket.id,
    });
  }, [callSocket]);

  const handleIncomingCall = useCallback(
    async (from, offer, userId, callMode) => {
      // setOfferProp(offer);
      console.log("offer",offer);
      dispatch(setCallOffer(offer));
      const windowWidth = window.innerWidth;
      windowWidth < 786 ? 
      navigate(`/textup/chats/${from?._id}/${currentUser?._id}/${callMode}`)
      :
      navigate(
        `/textup?tab=${currentTab}&to=${from?._id}&from=${currentUser?._id}&call=${callMode}`
      );
    },
    [callSocket]
  );

  useEffect(() => {
    callSocket.on("incoming:call", ({ from, offer, userId, callMode }) => {
      console.log("incoming:call", from);
      handleIncomingCall(from, offer, userId, callMode);
    });
    callSocket.on("call:rejected", () => {
      // toast.error("Call rejected");
      setIncomingCall(null);
      setIncomingOffer(null);
      setCallee(null);
    });

    return () => {
      callSocket.off("incoming:call", handleIncomingCall);
      callSocket.off("call:rejected");
    };
  }, [callSocket, handleIncomingCall]);


  return (
    <div className="w-full h-full max-h-screen flex overflow-hidden max-w-screen-2xl mx-auto 2xl:max-w-[2100px]">
      {/* Sidebar */}
      <div className="hidden sm:flex justify-center bg-white text-center min-w-12 2xl:min-w-20 ring-2 ring-gray-200">
        <Sidebar showChatRoom={showChatRoom} setShowChatRoom={setShowChatRoom}/>
      </div>

      {showSearch ? (
        <Search currentTab={currentTab}/>
      ) : (
        <div className="ring-1 ring-gray-200 bg-gradient-to-r from-[#04081E] via-[#2A2760] to-[#334E83] min-h-screen w-full md:max-w-sm 2xl:max-w-lg">
          {/* Header Menu */}
          <div className="w-full bg-transparent h-20 2xl:h-28">
            <HeaderMenu openModal={openModal} setOpenModal={setOpenModal} />
          </div>

          {/* Main Content */}
          <div className="flex-grow h-[calc(100%-159px)] sm:h-[calc(100%-80px)] 2xl:h-[calc(100%-109px)]  overflow-hidden">
            {currentTab === "messages" && (
              <MessageList currentTab={currentTab} />
            )}
            {currentTab === "groups" && <GroupList currentTab={currentTab} />}
            {currentTab === "contacts" && (
              <ContactList
                openModal={openModal}
                setOpenModal={setOpenModal}
                currentTab={currentTab}
                contactAdded={contactAdded}
                setContactAdded={setContactAdded}
              />
            )}
            {currentTab === "setting" && <Settings />}
          </div>

          {/* Footer Menu */}
          <div className="bg-white h-[79px] ring-1 ring-gray-100 sm:hidden">
            <FooterMenu />
          </div>
        </div>
      )}

      {/* Chat Room or Empty Chat Screen */}
      <div className="hidden relative md:flex ring-1 ring-gray-200 w-full overflow-hidden">
        {showChatRoom ? (
          <ReplaceChatScreen
            showChatRoom={showChatRoom}
          />
        ) : (
          <EmptyChatScreen /> 
        )}
      </div>
    </div>
  );
};

export default Home;
