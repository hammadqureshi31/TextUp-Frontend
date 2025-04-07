import React, { useState, useEffect } from "react";
import WelcomeScreen from "../Auth/WelcomeScreen";
import { fetchUserDetails } from "../../redux/slice/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import ProfileSetup from "../../components/Setting/ProfileSetup";
import SplashScreen from "../Splash/SplashScreen";
import { getAllUsers } from "../../redux/slice/allUsersSlice";
import { fetchAllMessages } from "../../redux/slice/messagesSlice";
// import { fetchAllMessages } from "../../redux/slice/messagesSlice";

const Starter = () => {
  const [showSplash, setShowSplash] = useState(true);
  const dispatch = useDispatch();
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate(); 
  const selector = useSelector((state) => state?.currentUser?.data?.details);


  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
      dispatch(fetchUserDetails());
      dispatch(getAllUsers());
    }, 3000);

    return () => clearTimeout(splashTimer); 
  }, [dispatch]);

  useEffect(() => {
    if(selector) setCurrentUser(selector);
    // console.log(selector);
  }, [selector]);

  useEffect(() => {
    if (!showSplash && currentUser) {
      if (currentUser.profileSetup) {
        navigate("/textup?tab=messages");
      }
    }
  }, [showSplash, currentUser]);

  return (
    <div>
      {showSplash ? (
        <SplashScreen />
      ) : currentUser && !currentUser.profileSetup ? (
        <ProfileSetup />
      ) : (
        <WelcomeScreen />
      )}
    </div>
  );
};

export default Starter;
