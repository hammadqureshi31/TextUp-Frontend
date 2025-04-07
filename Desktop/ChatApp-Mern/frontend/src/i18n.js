// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import axios from "axios";

const LIBRETRANSLATE_URL = "https://libretranslate.de/translate"; // Free public instance

// Function to fetch translation from LibreTranslate API
const fetchTranslation = async (text, targetLang) => {
  try {
    const response = await axios.post(LIBRETRANSLATE_URL, {
      q: text,
      source: "en", // Assuming default text is in English
      target: targetLang,
      format: "text",
    });

    return response.data.translatedText;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Return original text if translation fails
  }
};

// Custom translation function
const customTFunction = (key) => {
  const currentLang = i18n.language;

  if (currentLang === "en") return key; // No need to translate if English

  // Check if translation is already cached
  if (i18n.store.data[currentLang]?.translation?.[key]) {
    return i18n.store.data[currentLang].translation[key]; // Return synchronously
  }

  // If not cached, return the key immediately and fetch the translation in the background
  fetchTranslation(key, currentLang).then((translatedText) => {
    // Store translation in i18next cache
    if (!i18n.store.data[currentLang]) i18n.store.data[currentLang] = { translation: {} };
    i18n.store.data[currentLang].translation[key] = translatedText;
    // Trigger a re-render if necessary (e.g., using a state update)
  });

  return key; // Return the key synchronously while fetching the translation
};

// Initialize i18next
i18n.use(initReactI18next).init({
  lng: localStorage.getItem("lang") || "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

// Override default `t()` function
i18n.t = customTFunction;

export default i18n;