import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";


const firebaseConfig = {
  apiKey: import.meta.env.apiKey,
  authDomain: import.meta.env.authDomain,
  projectId: "textup-chatapp",
  storageBucket: "textup-chatapp.appspot.com",
  messagingSenderId: import.meta.env.messagingSenderId,
  appId: import.meta.env.appId
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
const storage = getStorage(app);

export const uploadImage = async (imageFile, onProgressCallback) => {
  if (!imageFile || !imageFile.type.startsWith("image/")) {
    toast.error("Invalid file type. Please select an image.");
    throw new Error("Invalid file type.");
  }

  const fileName = `${new Date().getTime()}_${imageFile.name}`;
  const storageRef = ref(storage, fileName);

  const uploadTask = uploadBytesResumable(storageRef, imageFile);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progressValue = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        if (onProgressCallback) onProgressCallback(progressValue);
      },
      (error) => {
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL); // Return the download URL on success
        } catch (error) {
          reject(error); // Reject with an error if URL fetch fails
        }
      }
    );
  });
};