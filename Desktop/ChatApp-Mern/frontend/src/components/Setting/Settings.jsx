import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { RxCross2 } from "react-icons/rx";
import i18n from "../../i18n";
import { BsKey, BsPeople } from "react-icons/bs";
import { PiChatCircleDotsLight } from "react-icons/pi";
import { HiOutlineBellAlert } from "react-icons/hi2";
import { TfiHelpAlt, TfiWorld } from "react-icons/tfi";
import { TbMobiledata } from "react-icons/tb";
import axios from "axios";
import { backendPortURL } from "../../config";

const languageOptions = [
  { code: "en", label: "English 🇬🇧" },
  { code: "es", label: "Español 🇪🇸" },
  { code: "fr", label: "Français 🇫🇷" },
  { code: "ru", label: "Русский 🇷🇺" },
  { code: "pt", label: "Português 🇧🇷" },
];

const Settings = () => {
  const { t, i18n } = useTranslation();

  const currentUser = useSelector((state) => state.currentUser?.data.details);
  const [showModal, setShowModal] = useState(false);
  const [language, setLanguage] = useState(i18n.language);
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  // const [translatedName, setTranslatedName] = useState("");

  // useEffect(() => {
  //   if (currentUser?.firstname) {
  //     const fetchTranslation = () => {
  //       const result = i18n.t(currentUser.firstname); // Await the translation
  //       setTranslatedName(result); // Set the translated text in state
  //     };
  //     fetchTranslation();
  //   }
  // }, [currentUser?.firstname, t]);

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") || "en";
    i18n.changeLanguage(savedLang);
    setLanguage(savedLang);
  }, []);

  const changeLanguage = async (lng) => {
    setLoading(true);
    await i18n.changeLanguage(lng);
    localStorage.setItem("lang", lng);
    setLanguage(lng);
    setTimeout(() => setLoading(false), 1000); // Simulate loading time
    setShowModal(false);
  };

  useEffect(() => {
    const translate = async () => {
      const savedLang = localStorage.getItem("lang");
      if (savedLang != "en" && currentUser?.firstname) {
        const translated = await axios.post(`${backendPortURL}translate`, {
          text: currentUser?.firstname,
          to: savedLang,
        });
        // console.log("translated", translated.data[0].translations[0].text);
        setFirstName(translated?.data[0].translations[0].text);
      } else {
        console.log("currentUser?.firstName", currentUser?.firstname);
        setFirstName(currentUser?.firstname);
      }
    };

    if (currentUser?.firstname) {
      translate();
    }
  }, [currentUser.firstname]);

  return (
    <div className="w-full h-full text-[#334E83] pt-2.5 bg-white rounded-t-3xl flex flex-col justify-start overflow-y-auto">
      <div className="h-1 w-8 bg-gray-300  xl:w-12  mx-auto rounded-full "></div>

      {/* Profile Section */}
      <div className="flex justify-start items-start px-5 gap-3 pt-4">
        {loading ? (
          <div className="w-14 h-14 bg-gray-300 rounded-full animate-pulse"></div>
        ) : (
          <img
            src={currentUser?.profilePicture || "./profile-placeholder.webp"}
            alt="Profile"
            className="w-14 h-14 2xl:w-16 2xl:h-16 rounded-full"
          />
        )}

        <div className="flex justify-between w-full items-center">
          <div className="pt-0.5">
            {loading ? (
              <div className="h-6 w-32 bg-gray-300 rounded animate-pulse"></div>
            ) : (
              <h2 className="text-xl 2xl:text-2xl font-bold font-acme tracking-wider text-gray-900 uppercase">
                {firstName}
              </h2>
            )}

            {loading ? (
              <div className="h-4 w-24 bg-gray-300 rounded animate-pulse mt-1"></div>
            ) : (
              <p className="text-sm 2xl:text-lg text-gray-500 font-roboto">
                {t("Never give up")}💪
              </p>
            )}
          </div>
          {!loading && (
            <img
              src="./qrcode.png"
              alt="QR-Code"
              className="size-6 2xl:size-8"
            />
          )}
        </div>
      </div>

      {/* Settings Options */}
      <div className="pt-5">
        {loading ? (
          <SkeletonOptions />
        ) : (
          <>
            {/* Language Selection Option */}
            <div
              className="flex items-center gap-5 px-5 py-3 rounded-lg cursor-pointer"
              onClick={() => setShowModal(true)}
            >
              <div className="flex items-center p-2.5 2xl:p-3 2xl:text-3xl justify-center bg-gray-100 rounded-full">
                <TfiWorld />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-900 font-medium text-base 2xl:text-xl font-poppins">
                  {t("App Language")}
                </label>
                <p className="text-gray-500 2xl:text-base">
                  {languageOptions.find(({ code }) => code === language)
                    ?.label || "English 🇬🇧"}
                </p>
              </div>
            </div>
            <SettingOption
              icon={<BsKey />}
              title={"Account"}
              subtitle={"Privacy, security, change number"}
            />
            <SettingOption
              icon={<PiChatCircleDotsLight />}
              title={"Chat"}
              subtitle={"Chat history, theme, wallpapers"}
            />
            <SettingOption
              icon={<HiOutlineBellAlert />}
              title={"Notifications"}
              subtitle={"Messages, group and oters"}
            />
            <SettingOption
              icon={<TfiHelpAlt />}
              title={"Help"}
              subtitle={"Help center, contact us, privacy"}
            />
            <SettingOption
              icon={<TbMobiledata />}
              title={"Storage and data"}
              subtitle={"Network usage, storage usage"}
            />
            <SettingOption icon={<BsPeople />} title={"Invite a friend"} />
          </>
        )}
      </div>

      {/* Language Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-2">
          <div className="bg-white p-5 rounded-xl w-80 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold font-poppins">
                {t("Select Language")}
              </h3>
              <div
                className="text-lg text-red-600 cursor-pointer"
                onClick={() => setShowModal(false)}
              >
                <RxCross2 />
              </div>
            </div>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {languageOptions.map(({ code, label }) => (
                <li
                  key={code}
                  className="flex justify-between font-roboto items-center p-2 border-b cursor-pointer hover:bg-gray-100"
                  onClick={() => changeLanguage(code)}
                >
                  {label} {language === code && <span>&#10003;</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingOption = ({ icon, title, subtitle }) => {
  const { t } = useTranslation();
  const [translatedTitle, setTranslatedTitle] = useState("");
  const [translatedSubtitle, setTranslatedSubtitle] = useState("");

  useEffect(() => {
    const translateText = () => {
      const titleResult = t(title);
      const subtitleResult = subtitle ? t(subtitle) : "";
      setTranslatedTitle(titleResult);
      setTranslatedSubtitle(subtitleResult);
    };
    translateText();
  }, [t, title, subtitle]);

  return (
    <div className="flex items-center gap-5 px-5 py-3   rounded-lg hover:bg-gray-100 cursor-pointer">
      <div className="flex items-center p-2.5 2xl:p-3 2xl:text-3xl justify-center bg-gray-100 rounded-full">
        {icon}
      </div>
      <div className={`flex-col ${subtitle ? "items-start" : "items-center"}`}>
        <h3 className="text-gray-900 font-medium text-base 2xl:text-xl font-poppins">
          {translatedTitle}
        </h3>
        {subtitle && (
          <p className="text-sm 2xl:text-base text-gray-500">
            {translatedSubtitle}
          </p>
        )}
      </div>
    </div>
  );
};

// Skeleton Loader for Settings Options
const SkeletonOptions = () => {
  return (
    <div className="px-5 space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-5 py-3 rounded-lg bg-gray-100 animate-pulse"
        >
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div className="flex flex-col gap-1 w-full">
            <div className="h-4 w-32 bg-gray-300 rounded"></div>
            <div className="h-3 w-24 bg-gray-300 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Settings;
