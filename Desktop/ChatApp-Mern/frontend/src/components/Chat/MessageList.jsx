import React, { useEffect, useState } from "react";
import ChatCard from "../../pages/Chats/ChatCard";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

const MessageList = ({ currentTab }) => {
  const currentUser = useSelector((state) => state.currentUser?.data.details);
  const allLastMsg = useSelector((state) => state.currentUser?.data.lastMessages);
  const commonUsers = useSelector((state)=>state.currentUser?.data.contactedUsers);
  const allMessages = useSelector((state)=>state.allMessages?.data);
  const [allUsers, setAllUsers] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // console.log("allLastMsg", allLastMsg)

  useEffect(() => {
    if (currentUser) {
      setLoading(false);
    }
    if(currentUser && commonUsers.length > 0){
      setAllUsers(commonUsers)
    }
  }, [dispatch,allMessages]);



  return (
    <div className="w-full h-full text-[#334E83] pt-2.5 2xl:pt-4 bg-white rounded-t-3xl flex flex-col justify-start text-center">
      <div className="h-1 w-8 2xl:w-12 bg-gray-300 mx-auto rounded-full"></div>

      {/* Chats */}
      <div className="mt-1">
        {currentUser && currentUser.contacts.length > 0 ? (
          allUsers && allUsers.length > 0 ? (
            allUsers.map((contact, index) => (
              <ChatCard
                key={index}
                singleContact={contact}
                loading={loading}
                currentTab={currentTab}
              />
            ))
          ) : (
            <ChatCard
              key={currentUser.contacts[0]?._id}
              singleContact={contactList}
              loading={loading}
              currentTab={currentTab}
            />
          )
        ) : (
          <div className="mt-10 text-sm">
            Start messaging,{" "}
            <span
              onClick={() => navigate("/textup?tab=contacts")}
              className="text-[#334E83] opacity-30 underline cursor-pointer"
            >
              Add Contact Here
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;
