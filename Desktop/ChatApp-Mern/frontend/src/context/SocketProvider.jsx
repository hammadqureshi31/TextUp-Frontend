import React, { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";
import { backendPortURL } from "../config";

const SocketContext = createContext(null);

export const useCallSocket = () => {
  const callSocket = useContext(SocketContext);
  // console.log("callsocketprovider", callSocket)
  return callSocket;
};

export const SocketProvider = (props) => {
  const callSocket = useMemo(
    () =>
      io(`${backendPortURL}`, {
        path: "/calling",
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 3,
        transports: ["websocket"],
      }),
    []
  );

  console.log("callsocketprovider", callSocket)

  return (
    <SocketContext.Provider value={callSocket}>
      {props.children}
    </SocketContext.Provider>
  );
};
