import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GoPlus } from "react-icons/go";
import { MdKeyboardBackspace } from "react-icons/md";
import { useNavigate } from "react-router";
import { IoMdCheckmark } from "react-icons/io";
import { backendPortURL } from "../../config";
import toast, { Toaster } from "react-hot-toast";
import { getAllUsers } from "../../redux/slice/allUsersSlice";
import axios from "axios";
import { Spinner } from "flowbite-react";
import { FaUser } from "react-icons/fa";

const CreateGroup = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [admin, setAdmin] = useState();
  const [members, setMembers] = useState([]);
  const selector = useSelector((state) => state.currentUser.data.details);
  const allUsers = useSelector((state) => state.allUsers.data);
  const [invited, setInvited] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(getAllUsers());
  }, []);

  useEffect(() => {
    if (selector) setAdmin(selector);
    const users = allUsers?.filter((user) => user?._id !== selector?._id);
    setMembers(users?.slice(0, 6));
  }, [selector, allUsers, dispatch]);

  const handleInviteMembers = (inviteId) => {
    if (invited.includes(inviteId)) {
      const filteredMemb = invited.filter((memb) => memb !== inviteId);
      setInvited(filteredMemb);
    } else {
      setInvited((prevInvited) => [...prevInvited, inviteId]);
    }
    console.log(invited);
  };

  const handleCreateGroup = async () => {
    // fields validation logic
    const isFormValid = () => {
      if (!name || name.length <= 3) {
        toast.error("Group name must be at least 4 characters.");
        return false;
      }
      if (!description || description.length <= 5) {
        toast.error("Description must be at least 6 characters.");
        return false;
      }
      if (!invited || invited.length < 2) {
        toast.error("Please invite at least two members.");
        return false;
      }
      return true;
    };

    if (!isFormValid()) return;

    try {
      const payload = {
        name,
        description,
        admin: admin?._id,
        invited: [...invited, admin?._id],
      };

      console.log(payload);

      setLoading(true);
      // Send API request
      const response = await axios.post(
        `${backendPortURL}group/create`
        // payload
      );

      if (response.status === 201 || response.status === 200) {
        toast.success("Group created successfully!");
        setLoading(false);
        navigate("/textup?tab=groups");
      } else {
        toast.error(
          response.data?.message || "Something went wrong, Please try later!"
        );
      }
    } catch (error) {
      console.error(
        "Error creating group:",
        error.response?.data || error.message
      );
      setLoading(false);
      toast.error(
        error.response?.data?.message ||
          "Something went wrong, Please try later!"
      );
    }
  };

  return (
    <div className="w-full bg-white px-6 py-5 2xl:py-0 2xl:pt-10 rounded-xl shadow-lg max-w-full mx-auto overflow-y-auto">
      {/* Header Section */}
      <div className="flex w-3/4 items-center justify-between opacity-75 font-light mb-12 sm:w-3/5">
        <MdKeyboardBackspace
          className="text-2xl 2xl:text-3xl cursor-pointer"
          onClick={() => navigate("/textup?tab=groups")}
        />
        <h1 className=" text-xl font-semibold ml-4 2xl:text-4xl">
          Create Group
        </h1>
      </div>

      {/* Group Description */}
      <div className="mb-8 ">
        <h2 className="mx-auto text-left sm:text-center text-5xl mb-4 2xl:mb-8 font-acme sm:text-[rgb(51,78,131)] sm:max-w-md md:max-w-xl 2xl:max-w-3xl sm:font-semibold sm:text-6xl md:text-7xl 2xl:text-8xl">
          Make Group for <br className="hidden md:block" /> Team Work
        </h2>
        <div className="flex gap-2 mb-2 font-roboto sm:max-w-md sm:mx-auto text-center sm:justify-center md:gap-5 md:pl-5">
          <span className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-sm 2xl:text-base">
            Group work
          </span>
          <span className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-sm md:ml-8 2xl:text-base 2xl:ml-12">
            Team relationship
          </span>
        </div>

        <div className="md:flex md:gap-3 mt-5 md:mt-10 md:mb-10 md:max-w-screen-sm  mx-auto">
          {/* Custom Floating Labels */}
          <div className="relative md:w-full">
            <input
              type="text"
              id="groupName"
              className="block w-full px-3 pt-5 pb-2 text-sm text-gray-900 bg-transparent border-b rounded-md border-gray-300 focus:outline-none focus:border-[#334E83] peer"
              placeholder=" "
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label
              htmlFor="groupName"
              className="absolute text-gray-500 font-poppins text-sm left-3 top-0 transform -translate-y-1/2 scale-90 origin-left px-1 peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2.5 peer-focus:scale-90 peer-focus:-translate-y-1/2 transition-all"
            >
              Group Name
            </label>
          </div>

          <div className="relative md:w-full">
            <input
              type="text"
              id="groupDescription"
              className="block w-full px-3 pt-5 pb-2 text-sm text-gray-900 bg-transparent border-b rounded-md border-gray-300 focus:outline-none focus:border-[#334E83] peer"
              placeholder=" "
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <label
              htmlFor="groupDescription"
              className="absolute text-gray-500 text-sm font-poppins left-3 top-0 transform -translate-y-1/2 scale-90 origin-left px-1 peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2.5 peer-focus:scale-90 peer-focus:-translate-y-1/2 transition-all"
            >
              Group Description
            </label>
          </div>
        </div>
      </div>

      {/* Group Admin Section */}
      <div className="md:flex md:gap-52 md:max-w-screen-sm  mx-auto">
        <div className="mb-6 w-fit text-nowrap">
          <h2 className="text-lg 2xl:text-xl font-semibold mb-2 text-[#334E83] font-poppins">
            Group Admin
          </h2>
          <div className="flex items-center md:mt-3">
            {admin?.profilePicture ? (
              <img
                src={admin?.profilePicture || "./profile-placeholder.webp"}
                alt="admin"
                className="w-12 h-12 rounded-full mr-3"
              />
            ) : (
              <FaUser className="w-12 h-12 rounded-full mr-3 text-gray-200 bg-gray-100/60 p-1.5" />
            )}
            <div>
              <h3 className="text-base 2xl:text-xl font-semiboldv font-acme">
                {admin?.firstname}
              </h3>
              <h5 className="text-sm 2xl:text-base text-gray-500 font-roboto">
                Group Admin
              </h5>
            </div>
          </div>
        </div>

        {/* Invited Members Section */}
        <div className="mb-6 md:max-w-72 ">
          <h2 className="text-lg 2xl:text-xl font-semibold mb-2 text-[#334E83] font-poppins">
            Invite Members
          </h2>
          <div className="flex gap-3 flex-wrap md:mt-3">
            {members?.length > 0 ? (
              members.map((member) => (
                <div key={member?._id} className="relative">
                  {member?.profilePicture ? (
                    <img
                      src={
                        member?.profilePicture || "./profile-placeholder.webp"
                      }
                      alt="member"
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <FaUser className="w-12 h-12 rounded-full text-gray-200 bg-gray-100/60 p-1.5" />
                  )}
                  <div
                    className="absolute -bottom-1 -right-2 cursor-pointer"
                    onClick={() => handleInviteMembers(member?._id)}
                  >
                    {invited?.includes(member?._id) ? (
                      <IoMdCheckmark className="text-black bg-gray-100 border-2 border-white p-1 text-2xl rounded-full" />
                    ) : (
                      <GoPlus className="text-black bg-gray-50 border-2 border-white p-0.5 text-2xl rounded-full" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No member available</div>
            )}

            {/* Add member icon */}
            <div className="w-12 h-12 cursor-pointer opacity-40 border border-dashed border-black rounded-full bg-gray-200 flex items-center justify-center">
              <GoPlus className="text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Create Button */}
      <div className="mt-4 md:mt-10 w-full text-center md:max-w-screen-sm md:mx-auto">
        <button
          onClick={handleCreateGroup}
          className="w-full bg-[#334E83] font-poppins text-white py-3 hover:scale-105 rounded-full hover:bg-[#2A2760] transition-all ease-in-out duration-500"
        >
          {loading ? <Spinner className="w-full mx-auto" /> : "Create"}
        </button>
      </div>

      <Toaster />
    </div>
  );
};

export default CreateGroup;
