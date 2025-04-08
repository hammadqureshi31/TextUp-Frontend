import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ChatCard from "../../pages/Chats/ChatCard";
// import { Modal, Button } from "flowbite-react";
import axios from "axios";
import { backendPortURL } from "../../config";
import { getAllUsers } from "../../redux/slice/allUsersSlice";
import { FiUserPlus } from "react-icons/fi";
import { IoArrowBackOutline } from "react-icons/io5";
import { fetchUserDetails } from "../../redux/slice/userSlice";


const ContactList = ({
  openModal,
  setOpenModal,
  currentTab,
  contactAdded,
  setContactAdded,
}) => {
  const selector = useSelector((state) => state.currentUser.data);
  const allUsers = useSelector((state) => state.allUsers.data);
  const [availableContacts, setAvailableContacts] = useState([]);
  const [contact, setContact] = useState([]);
  const dispatch = useDispatch();
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(null);

  console.log(selector.contactedUsers)

  useEffect(() => {
    if (selector) {
      setUser(selector.details);
      setLoading(false);
    }
    dispatch(getAllUsers());
  }, [selector, dispatch]);

  useEffect(() => {
    if (allUsers && user) {
      setAvailableContacts(allUsers.filter((u) => (user?._id !== u?._id) && !user?.contacts.includes(u._id) ));

      if (user?.contacts && user?.contacts.length > 0) {
        const filteredContacts = allUsers.filter((u) =>
          user.contacts?.includes(u._id)
        );
        setContact(filteredContacts);
      }
    }
  }, [user, allUsers]);

  const addNewUserContact = async (addContact) => {
    setButtonLoading(addContact);
    try {
      await axios.post(`${backendPortURL}user/add-new-contact/${user?._id}`, {
        contactId: addContact,
      });
      setContactAdded((prev) => !prev);
      dispatch(fetchUserDetails());
      setOpenModal(false);
    } catch (error) {
      console.error("Error adding contact:", error);
    } finally {
      setButtonLoading(null);
    }
  };

  return (
    <>
      <div className=" relative w-full h-full text-[#334E83] pt-2.5 bg-white rounded-t-3xl flex flex-col justify-start text-center">
        <div className="h-1 w-8 2xl:w-12 bg-gray-300 mx-auto rounded-r-full rounded-l-full"></div>

        <div className="flex items-center justify-start gap-5 p-4 cursor-pointer"
        onClick={() => {
          setOpenModal((prev)=>!prev);
        }}>
          <div className="p-3 border border-dashed rounded-full bg-[#334E83]">
            <FiUserPlus
              className=" text-xl text-white 2xl:text-3xl"
            />
          </div>
          <h3 className="font-semibold font-poppins text-[#334E83] 2xl:text-2xl">
            New Contact
          </h3>
        </div>

        {/* Chats */}
        <div className="mt-1">
          {user && user.contacts?.length > 0 && (
            contact.length > 1 ? (
              contact.map((singleContact) => (
                <ChatCard
                  key={singleContact._id}
                  singleContact={singleContact}
                  loading={loading}
                  currentTab={currentTab}
                />
              ))
            ) : (
              <ChatCard
                key={user.contacts[0]?._id}
                singleContact={contact[0]}
                loading={loading}
                currentTab={currentTab}
              />
            )
          ) }
        </div>

        {/* Add Contact Screen */}
        {openModal && (
          <div className=" absolute w-full h-full bg-white top-6">
             {/* Header */}
          <div className="flex justify-start items-center gap-16 py-4 px-6 font-poppins text-[#334E83]">
            <div className=" cursor-pointer" onClick={()=>setOpenModal((prev)=>!prev)}>
              <IoArrowBackOutline />
            </div>
            <h2 className="text-lg font-semibold tracking-wide">
              Add New Contact
            </h2>
          </div>

          {/* Body */}
          <div className="bg-gray-50 p-6 rounded-b-xl">
            <div className="space-y-3 w-full">
              {availableContacts.length > 0 ? (
                availableContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="flex w-full items-center justify-between p-3 border-b border-gray-200 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          contact.profilePicture || "./profile-placeholder.webp"
                        }
                        alt={contact.firstname}
                        className=" w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h1 className="text-sm font-poppins font-medium text-[#334E83]">
                          {contact.firstname} {contact.lastname}
                        </h1>
                      </div>
                    </div>
                    <button
                      className={`bg-[#334E83] cursor-pointer text-white px-3 py-1.5 text-xs rounded-lg font-roboto shadow-md transition-transform transform ${
                        buttonLoading
                          ? "hover:cursor-not-allowed opacity-50"
                          : "hover:scale-105"
                      } duration-200 ease-out`}
                      onClick={() => addNewUserContact(contact._id)}
                      disabled={buttonLoading}
                    >
                      {buttonLoading === contact._id ? "Adding..." : "Add"}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">
                  No contacts available
                </p>
              )}
            </div>
          </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ContactList;
