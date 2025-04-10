import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { selectGroup } from "../../redux/slice/selectedGroup";
import { IoImageOutline } from "react-icons/io5";
import useSocket from "../../hooks/useSocket";
import { MdGroups } from "react-icons/md";
import axios from "axios";
import { backendPortURL } from "../../config";

const GroupCard = ({ grp, currentTab }) => {
  const selectedGroup = useSelector((state) => state.selectedGroup);
  const [lastMessage, setLastMessage] = useState(null);
  const [userLastMsgs, setUserLastMsgs] = useState();
  const [translatedLastMsg, setTranslatedLastMsg] = useState("");
  const [groupName, setGroupName] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const allMessages = useSelector((state) => state.allMessages.data);
  const currentUser = useSelector((state) => state.currentUser.data);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const setupSocket = true;
  const { socket, typing, typerName, groupID } = useSocket(
    grp?._id && setupSocket,
    grp?._id
  );

  let loading = false;
  // console.log(grp);


  useEffect(()=>{
    const msgMap = new Map([]);
    if(currentUser){
      Object.entries(currentUser.lastMessages).forEach(([key,value])=>{
        msgMap.set(key,value);
      })
      setUserLastMsgs(msgMap);
    }
  },[currentUser])

  useEffect(() => {
    if (userLastMsgs) {
      userLastMsgs?.forEach((value,key) =>{
        if(key === grp?._id && value?.mode === "group"){
          setLastMessage(value)
        }
      });
    }

     if (currentUser?.groupUnreads.length > 0) {
      const updateUnread = currentUser?.groupUnreads.filter((msg)=>msg?.receiver === grp?._id && msg?.sender !== currentUser?.details._id)
      setUnreadCount(updateUnread || 0);
    }
  }, [userLastMsgs]);


  
  useEffect(() => {
    if (grp?.name) {
      const translate = async () => {
        const savedLang = localStorage.getItem("lang");
        if (savedLang != "en") {
          const translated = await axios.post(`${backendPortURL}translate`, {
            text: grp?.name,
            to: savedLang,
          });
          // console.log("translated", translated.data[0].translations[0].text);
          setGroupName(translated?.data[0].translations[0].text);
        } else {
          setGroupName(grp?.name);
        }
      };

      translate();
    }
  }, [grp]);

  useEffect(() => {
    if (lastMessage?.content?.length !== 0) {
      const translate = async () => {
        const savedLang = localStorage.getItem("lang");
        if (savedLang != "en") {
          const translated = await axios.post(`${backendPortURL}translate`, {
            text: lastMessage?.content,
            to: savedLang,
          });
          // console.log("translated", translated.data[0].translations[0].text);
          setTranslatedLastMsg(translated?.data[0].translations[0].text);
        } else {
          setTranslatedLastMsg(lastMessage?.content);
        }
      };

      translate();
    }
  }, [lastMessage]);


  
  const handleClick = () => {
    if (grp?._id) {
      dispatch(selectGroup(grp?._id));
      sessionStorage.setItem("previousTab", currentTab);
      sessionStorage.setItem("replaceChat", currentTab);
      navigate(`/textup?tab=${currentTab}&groupId=${grp?._id}`);
    }
  };
  return (
    <>
      <div
        onClick={handleClick}
        className={`flex items-center p-4 rounded-lg overflow-hidden hover:bg-gray-100 transition duration-300 cursor-pointer ${
          selectedGroup === grp?._id ? "bg-gray-100" : "bg-white"
        }`}
      >
        <div className="text-4xl bg-gray-200 rounded-full p-2 2xl:text-5xl">
          <MdGroups className="text-gray-400"/>
        </div>

        <div className="ml-4 flex flex-col w-full">
          <div className="flex justify-between items-center">
            <h1 className="text-base sm:text-lg 2xl:text-2xl font-semibold text-[#334E83] font-poppins tracking-tighter">
              {groupName}
            </h1>

            <span className="text-xs 2xl:text-lg opacity-30 font-sans">
              {lastMessage &&
                new Date(lastMessage.msgDate).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </span>
          </div> 

          <div className="flex justify-between items-center mt-1">
            {loading ? (
              <div className="w-40 h-4 bg-gray-200 rounded-md animate-pulse"></div>
            ) : (
              <p className="text-sm 2xl:text-xl truncate opacity-40 font-roboto overflow-hidden">
                { typing && grp?._id === groupID ? (
                  <div className="font-acme text-[#334E83] font-light tracking-wide">
                    {typerName == currentUser.details?.firstname ? `you are typing...` : `${typerName} is typing...`}
                  </div>
                ) : lastMessage?.sender?._id ? (
                    lastMessage?.receiver == grp?._id ? (
                    lastMessage.imageURL ? (
                      <div className="flex gap-2">
                        <IoImageOutline className="mt-0.5" />
                        <span>image</span>
                      </div>
                    ) : lastMessage.content?.length > 35 ? (
                      `${translatedLastMsg?.substring(0, 35)}...`
                    ) : (
                      translatedLastMsg
                    )
                  ) : (
                    "No messages yet"
                  )
                ) : // Check sender/receiver relationship for lastMessage
                 lastMessage?.receiver === grp?._id  ? (
                  lastMessage.imageURL ? (
                    <div className="flex gap-2">
                      <IoImageOutline className="mt-0.5" />
                      <span>image</span>
                    </div>
                  ) : lastMessage.content?.length > 35 ? (
                    `${translatedLastMsg?.substring(0, 30)}...`
                  ) : (
                    translatedLastMsg
                  )
                ) : (
                  "No messages yet"
                )}
              </p>
            )}
            {loading ? (
              <div className="w-6 h-6 bg-gray-200 rounded-full ml-1.5 animate-pulse"></div>
            ) : (
              unreadCount?.length > 0 && (
                <div className="text-xs bg-[#F04A4C] text-white px-2 py-1 rounded-full ml-2 2xl:text-lg">
                  {unreadCount?.length}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GroupCard;
