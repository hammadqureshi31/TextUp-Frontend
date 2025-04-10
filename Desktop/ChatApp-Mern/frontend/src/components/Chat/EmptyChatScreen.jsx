import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TfiComment } from "react-icons/tfi";
import { CiLock } from "react-icons/ci";
import { useTranslation } from "react-i18next";

// Message Bubble Component
const MessageBubble = ({ text, delay, xMove }) => {
  const [visible, setVisible] = useState(true);
  const animationDuration = 10;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false);
    }, (delay + animationDuration) * 1000);

    return () => clearTimeout(timeout);
  }, [delay]);

  if (!visible) return null;

  return (
    <motion.div
      className="flex items-center justify-center relative"
      initial={{ opacity: 0, y: 0, x: 0 }}
      animate={{
        opacity: 1,
        y: [-0, -250, -230, -700],
        x: [0, xMove, xMove * -0.5, xMove * -0.5],
      }}
      transition={{
        duration: animationDuration,
        delay,
        ease: "easeInOut",
        times: [0, 0.4, 0.6, 1],
      }}
    >
      {/* Left Wing */}
      <motion.img
        src="./wing-left.png"
        alt="Left Wing"
        className="absolute left-[-30px] top-[-15px] z-20 w-10 h-10 bg-transparent"
        animate={{
          rotate: [10, 20, -20, 10],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
      />

      {/* Bubble */}
      <motion.div
        className="text-white text-base w-full px-3 py-1.5 mx-auto flex text-center justify-center rounded-lg shadow-md z-50 bg-gradient-to-r from-[#2A2760] to-[#334E83]"
        animate={{ y: [0, -5, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        {text}
      </motion.div>

      {/* Right Wing */}
      <motion.img
        src="./wing-right.png"
        alt="Right Wing"
        className="absolute right-[-30px] top-[-15px] z-20 w-10 h-10 bg-transparent"
        animate={{
          rotate: [10, -20, 20, 10],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

const EmptyChatScreen = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col overflow-hidden z-20 items-center justify-center h-screen bg-gray-100 relative w-full">
      {/* Logo Section */}
      <div
        className="text-center"
        style={{
          clipPath:
            "polygon(0% 0%, 100% 0%, 100% 74.1%, 30.3% 74.1%, 9.5% 100%, 9.5% 74.1%, 0% 74.1%)",
        }}
      >
        <div className="relative">
          <TfiComment className="mx-auto w-32 h-32 opacity-5 mb-20" />
          <h1 className="absolute left-1/2 top-1/4 text-3xl pt-10 -translate-x-1/2 -translate-y-1/2 font-semibold text-[#334E83] opacity-30 font-acme">
            {t("TextUp")}
          </h1>
        </div>
      </div>

      {/* ✨ Whimsical Floating Chat ✨ */}
      <div className="absolute bottom-20 w-full flex justify-center">
        <motion.div className="relative w-fit h-40">
          <MessageBubble text={t("Hey there! 👋")} delay={0} xMove={-50} />
          <MessageBubble text={t("What’s up? 😊")} delay={6} xMove={50} />
          <MessageBubble text={t("Let’s chat! 🗨️")} delay={12} xMove={-100} />
          <MessageBubble text={t("Messages that fly! 🚀")} delay={18} xMove={100} />
        </motion.div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-5 text-sm opacity-50">
        <CiLock className="inline-block text-base mb-0.5" /> {t("End-to-end encrypted")}
      </div>
    </div>
  );
};

export default EmptyChatScreen;
