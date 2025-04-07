import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { useSelector } from "react-redux";
import { MdGroups } from "react-icons/md";
import { useNavigate } from "react-router";
import { MdArrowBackIos } from "react-icons/md";

const Search = ({ currentTab }) => {
  const allUser = useSelector((state) => state.allUsers.data);
  const currentUser = useSelector((state) => state.currentUser.data);
  const [userContacts, setUserContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [displayContacts, setDisplayContacts] = useState([]);
  const navigate = useNavigate();

  // Filter user contacts based on currentUser's contactedUsers
  const handleFilterUserContacts = useCallback(() => {
    if (currentUser && allUser) {
      const filteredContacts = allUser.filter((user) =>
        currentUser.contactedUsers.some((usr) => usr._id === user._id)
      );

      const allChats = [...filteredContacts, ...currentUser?.myGroups];
      console.log(allChats);
      setUserContacts(allChats);
    }
  }, [currentUser, allUser]);

  useEffect(() => {
    handleFilterUserContacts();
  }, [handleFilterUserContacts]);

  useEffect(() => {
    const filteredSearch = setTimeout(() => {
      setLoading(false);
      if (search.length == 0 || search.trim() === '') return setDisplayContacts(userContacts);
      else {
        setDisplayContacts(
          userContacts?.filter(
            (user) =>
              user.firstname?.toLowerCase().includes(search.toLowerCase()) ||
              user.name?.toLowerCase().includes(search.toLowerCase())
          )
        );
      }
    }, 500);

    () => clearTimeout(filteredSearch);
  }, [search, userContacts]);

  const handleClick = (user) => {
    if (user) {
      setSelectedChat(user._id);
      sessionStorage.setItem("previousTab", currentTab);
      sessionStorage.setItem("replaceChat", currentTab);
      if (user?.firstname) {
        navigate(`/textup?tab=${currentTab}&to=${user?._id}`);
      } else {
        navigate(`/textup?tab=${currentTab}&groupId=${user?._id}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex-col justify-start items-start px-3 pt-4 w-full md:max-w-sm 2xl:max-w-md">
      {/* Search Input */}

      <div className="flex justify-start items-center w-full">
        <div
          className="cursor-pointer md:hidden text-[#334E83]"
          onClick={() => navigate(-1)}
        >
          <MdArrowBackIos />
        </div>
        <div className="flex justify-start w-full items-center p-2 bg-gray-100 gap-3 rounded-lg">
          <CiSearch className="text-3xl" />
          <input
            type="search"
            placeholder="Search people or groups..."
            className="w-full bg-transparent focus:outline-none"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <h3 className="font-poppins mt-4">Chats</h3>
      <ul>
        {loading ? (
          // Loading Skeleton
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center p-4 rounded-lg overflow-hidden hover:bg-gray-100 transition duration-300 cursor-pointer"
            >
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="ml-3 flex flex-col w-full">
                <div className="w-32 h-6 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="w-40 h-4 bg-gray-200 rounded-md animate-pulse mt-1"></div>
              </div>
            </div>
          ))
        ) : displayContacts.length > 0 ? (
          // Filtered Results
          displayContacts.map((user) => (
            <div
              key={user._id}
              onClick={() => handleClick(user)}
              className={`flex items-center py-4 rounded-lg overflow-hidden hover:bg-gray-100 transition duration-300 cursor-pointer ${
                selectedChat === user?._id ? "bg-gray-100" : "bg-white"
              }`}
            >
              <div className="flex-shrink-0">
                {user.firstname ? (
                  <img
                    src={user?.profilePicture || "./profile-placeholder.webp"}
                    alt={`${user?.firstname}'s profile`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="text-4xl bg-gray-100 rounded-full p-2">
                    <MdGroups className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="ml-3 flex flex-col w-full">
                <h1 className="text-base sm:text-lg font-semibold text-[#334E83] font-poppins tracking-tighter">
                  {user?.firstname || user.name}
                </h1>
                <p className="text-sm truncate opacity-40 font-roboto overflow-hidden">
                  {user?.description
                    ? user.description
                    : "Hey there! I am using TextUp."}
                </p>
              </div>
            </div>
          ))
        ) : (
          // No Results Found
          <p className="text-sm text-center truncate opacity-40 font-roboto overflow-hidden">
            No results found for '{search}'
          </p>
        )}
      </ul>
    </div>
  );
};

export default Search;
