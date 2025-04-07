import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { motion } from "framer-motion";
import {
  FaPhoneSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";
import { PiPhoneCallThin } from "react-icons/pi";
import { FaUser } from "react-icons/fa";

const CallUI = ({
  myStream,
  remoteStream,
  whichCall,
  endCall,
  from,
  sendStreams,
  receiveBy,
  showTimer,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [showPhoneIcon, setShowPhoneIcon] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  console.log("showTimer", showTimer);

  useEffect(() => {
    if (!remoteStream || remoteStream.getAudioTracks().length === 0) {
      console.error("No audio track in remoteStream");
    }

    if (remoteStream && audioRef.current) {
      audioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Timer logic
  useEffect(() => {
    if (showTimer) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timerRef.current); // Cleanup timer on unmount
  }, [showTimer]);

  // Format time in mm:ss
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Toggle Microphone
  const handleToggleMute = () => {
    if (myStream) {
      myStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setIsMuted(!isMuted);
    }
  };

  // Toggle Camera
  const handleToggleCamera = () => {
    if (myStream) {
      myStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setIsCameraOn(!isCameraOn);
    }
  };

  const handleSendStreams = () => {
    setShowPhoneIcon(false);
    sendStreams();
  };

  return (
    <div className="w-full h-screen flex flex-col justify-start pt-14 items-center bg-black relative overflow-hidden">
      {/* Video Call UI */}
      {whichCall === "video" ? (
        <>
          {remoteStream && (
            <ReactPlayer
              playing
              height="100%"
              width="100%"
              url={remoteStream}
              className="absolute top-0 left-0"
            />
          )}
          {myStream && (
            <div className="absolute bottom-5 right-5 bg-black p-1 rounded-lg shadow-lg border border-gray-700">
              <ReactPlayer
                playing
                height="120px"
                width="180px"
                url={myStream}
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center text-white">
          {from?.profilePicture || receiveBy?.profilePicture ? (
            <img
              src={
                from?.profilePicture ||
                receiveBy?.profilePicture ||
                "../../profile-placeholder.webp"
              }
              alt="Caller"
              className="w-24 h-24 rounded-full mb-3 border-2 border-gray-500 shadow-lg"
            />
          ) : (
            <FaUser className="w-24 h-24 rounded-full mb-3 border-2 border-gray-500 shadow-lg text-gray-200 bg-gray-100/60 p-1.5" />
          )}
          <h2 className="text-2xl font-semibold">
            {from?.firstname ? from?.firstname : receiveBy?.firstname}
          </h2>
          <p className="text-gray-400 text-lg mt-1">
            {showTimer ? formatTime(callDuration) : "Calling..."}
          </p>
          {remoteStream && <audio ref={audioRef} autoPlay playsInline />}
        </div>
      )}

      {/* Call Icon with Animated Ring Effect */}
      {showPhoneIcon && (
        <div className="absolute top-1/2 flex items-center justify-center">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-12 h-12 rounded-full ring-1 ring-white"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
          <motion.div
            className="relative flex items-center justify-center w-12 h-12 ring-2 ring-white bg-black rounded-full shadow-2xl"
            initial={{ scale: 1 }}
            animate={{ rotate: [-10, 10, -10] }} // Rotating effect
            transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut" }}
            onClick={handleSendStreams}
          >
            <PiPhoneCallThin className="text-white text-2xl" />
          </motion.div>
        </div>
      )}

      {/* Call Controls */}
      <div className="absolute bottom-10 flex space-x-6">
        <button
          onClick={handleToggleMute}
          className="w-16 h-16 flex items-center justify-center bg-[#343e39] rounded-full shadow-md hover:bg-gray-600 transition"
        >
          {isMuted ? (
            <FaMicrophoneSlash size={28} color="white" />
          ) : (
            <FaMicrophone size={28} color="white" />
          )}
        </button>
        <button
          onClick={endCall}
          className="w-16 h-16 flex items-center justify-center bg-[#EA3736] rounded-full shadow-md hover:bg-red-500 transition"
        >
          <FaPhoneSlash size={28} color="white" />
        </button>
        {whichCall === "video" && (
          <button
            onClick={handleToggleCamera}
            className="w-16 h-16 flex items-center justify-center bg-[#343e39] rounded-full shadow-md hover:bg-gray-600 transition"
          >
            {isCameraOn ? (
              <FaVideo size={28} color="white" />
            ) : (
              <FaVideoSlash size={28} color="white" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default CallUI;
