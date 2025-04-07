import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useCallSocket} from '../../context/SocketProvider'

const VideoCallComponent = ({ receiveBy }) => {
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callerId, setCallerId] = useState(null);
  const currentUser = useSelector((state) => state.currentUser.data);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peer = useRef(null);
  const localStream = useRef(null);
  const call = useRef(null);
  const callSocket = useCallSocket();


  const startCall = async (receiveBy) => {
    setIsCalling(true);

    try {
      // Get user media stream
      localStream.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream.current;
      }

      // Verify PeerJS instance and receiver ID
      if (!peer.current) {
        throw new Error("PeerJS is not initialized");
      }
      console.log("Calling user:", receiveBy);

      // Call the receiver using PeerJS
      call.current = peer.current.call(receiveBy, localStream.current);

      if (!call.current) {
        throw new Error("Failed to create call");
      }

      call.current.on("stream", (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      call.current.on("close", () => {
        console.log("Call ended");
        setIsCalling(false);
      });
    } catch (error) {
      console.error("Error starting call:", error);
      setIsCalling(false);
    }
  };

  const acceptCall = async () => {
    setIsCalling(true);
    setIncomingCall(null);

    try {
      localStream.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream.current;
      }

      incomingCall.answer(localStream.current);

      incomingCall.on("stream", (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });
    } catch (error) {
      console.error("Error accepting call:", error);
    }
  };

  const declineCall = () => {
    if (incomingCall) {
      incomingCall.close();
      setIncomingCall(null);
      setCallerId(null);
    }
  };

  useEffect(() => {
    return () => {
      socket.disconnect();
      if (peer.current) peer.current.destroy();
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div>
      {incomingCall && (
        <div>
          <p>Incoming Call from {callerId}</p>
          <button onClick={acceptCall}>Accept</button>
          <button onClick={declineCall}>Decline</button>
        </div>
      )}
      <div className="video-container">
        <video ref={localVideoRef} autoPlay muted className="local-video" />
        <video ref={remoteVideoRef} autoPlay className="remote-video" />
      </div>
      {!isCalling && !incomingCall && (
        <button onClick={() => startCall(receiveBy)}>Start Call</button>
      )}
    </div>
  );
};

export default VideoCallComponent;