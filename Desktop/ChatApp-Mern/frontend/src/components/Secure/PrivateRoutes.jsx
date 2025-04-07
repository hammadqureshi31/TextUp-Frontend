import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router";
import useSocket from "../../hooks/useSocket";

const PrivateRoutes = () => {
  const user = useSelector((state) => state.currentUser.data);
  const { socket, setLastSeenAndOnlineEvent } = useSocket();

  // useEffect(() => {

  //   const handleBeforeUnload = () => {
  //     if (socket.current) {
  //       setLastSeenAndOnlineEvent(false);
  //     }
  //   };

  //   window.addEventListener("beforeunload", handleBeforeUnload);

  //   return () => {
  //     window.removeEventListener("beforeunload", handleBeforeUnload);
  //   };
  // }, [socket, setLastSeenAndOnlineEvent]);

  return <div>{user ? <Outlet /> : <Navigate to={"/login"} />}</div>;
};

export default PrivateRoutes;
