import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { IoIosCamera } from "react-icons/io";
import axios from "axios";
import { useNavigate } from "react-router";
import { uploadImage } from '../../firebase/firebase'
import { Spinner } from "flowbite-react";
import toast, { Toaster } from 'react-hot-toast';
import { backendPortURL } from "../../config";

const ProfileSetup = () => {
  const selector = useSelector((state) => state.currentUser.data?.details);
  const [user, setUser] = useState();
  const [firstname, setFirstname] = useState("");
  const [email, setEmail] = useState("");
  const [lastname, setLastname] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (selector) {
      setUser(selector);
      setFirstname(selector.firstname);
      setEmail(selector.email);
      setImagePreview(selector.profilePicture);
    }
  }, [selector]);

  const handleClickIcon = () => {
    fileInputRef.current.click();
  };

  const handleChangeProfilePicture = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) {
      console.error("No file selected.");
      return;
    }
    setProfilePicture(file);
    setImagePreview(URL.createObjectURL(file));

    try {
      const downloadURL = await uploadImage(file);
      if (downloadURL) {
        console.log(downloadURL);
        setImageURL(downloadURL);
      }
    } catch (err) {
        toast.error("An error occurred during the image upload.");
      console.error("Image upload error:", err);
    }
  };

    const handleFormSubmit = async (e) => {
      e.preventDefault();

      if (!imageURL && profilePicture) {
        toast.error("Please wait for the image to finish uploading.");
        console.log(imageURL)
        return;
      }

      try {
        setUpdateLoading(true);
        axios.defaults.withCredentials = true;
        const updatedUser = await axios.post(
          `${backendPortURL}user/profile-setup/${user?._id}`,
          {
            lastname,
            profilePicture: imageURL || user?.profilePicture,
            profileSetup: true,
          }
        );

        toast.success("Profile updated successfully.");
        setUpdateLoading(false);
        console.log("Update", updatedUser.data);

        if(updatedUser.data){
          setTimeout(() => {
            navigate('/textup')
          }, 2000);
        }
      } catch (error) {
        toast.error("Error in updating profile.");
        console.error("Error in updating profile:", error);
      }
    };

  return (
    <>
      <div className="flex justify-center text-center px-4 pt-10 md:pt-10">
        <div className="mx-auto rounded-lg shadow-md p-6 bg-white flex flex-col justify-center text-left gap-3 w-full max-w-lg">
          <div className="relative w-56 mx-auto">
            <img
              className="mx-auto rounded-full h-40 w-40 ring-2 ring-[#334E83]"
              src={
                imagePreview ||
                "../profile-placeholder.webp"
              }
              alt="Profile"
            />
            <div className="absolute bottom-0 text-white rounded-full right-5 cursor-pointer text-2xl">
              <IoIosCamera
                className="cursor-pointer text-4xl text-[#334E83]"
                onClick={handleClickIcon}
              />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleChangeProfilePicture}
                style={{ display: "none" }}
              />
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 "
              htmlFor="firstname"
            >
             First name
            </label>
            <input
              type="text"
              id="firstname"
              name="firstname"
              placeholder="Your first name"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              className="mt-1 px-4 py-3 w-full border-b border-gray-300 rounded-md text-gray-700 focus:outline-none focus:border"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 "
              htmlFor="lastname"
            >
              Last name
            </label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              placeholder="Your last name"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              className="mt-1 px-4 py-3 w-full border-b border-gray-300 rounded-md text-gray-700 focus:outline-none focus:border"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-700 "
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 px-4 py-3 w-full border-b border-gray-300 rounded-md text-gray-700 focus:outline-none focus:border"
            />
          </div>

          <button
            type="submit"
            onClick={handleFormSubmit}
            className="w-full mt-2 py-3 bg-gradient-to-r  font-poppins from-[#04081E] via-[#2A2760] to-[#334E83] text-white rounded-full hover:from-gray-700 hover:to-indigo-700 focus:outline-none transition"
          >
            {updateLoading ? <Spinner className="w-full"/> : "Save profile"}
          </button>

          <Toaster /> 

          <div className="block text-sm text-center cursor-pointer font-medium text-gray-700 "
          >
            <h3 onClick={()=>navigate('/textup')} >Skip for now</h3>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileSetup;
