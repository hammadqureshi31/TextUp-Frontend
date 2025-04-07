import React from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router";
import { backendPortURL } from "../../config";

const WelcomeScreen = () => {
  const navigate = useNavigate();

  const handleNavigate = (path)=>{
    navigate(`${path}`);
  }

  const handleGoogleSignIn = async () => {
    try {
      window.location.href = `${backendPortURL}auth/google/callback`; 
    } catch (error) {
      console.error("Google sign-in error", error);
    }
  };

  return (
    <div className="flex flex-col justify-between min-h-screen bg-gradient-to-r from-[#04081E] via-[#2A2760] to-[#334E83] text-white px-6 md:px-12 py-6 md:py-8">
      {/* Main content */}
      <div className="flex flex-col items-center justify-center flex-grow text-center space-y-6 md:space-y-8">
        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-bold font-poppins leading-tight">
          Connect friends <br /> easily & quickly
        </h1>

        {/* Subtext */}
        <p className="text-gray-300 font-light md:text-lg max-w-md mx-auto md:tracking-wide">
          Our chat app is the perfect way to stay connected with friends and
          family.
        </p>

        {/* Sign up with email button */}
        <button onClick={()=>handleNavigate('/signup')}
         className="mt-4 w-auto md:w-auto bg-gradient-to-r from-[#4C4D8A] to-[#7780A1] text-white py-3 px-12 rounded-full shadow-lg hover:shadow-2xl hover:shadow-black hover:font-medium transition-all duration-200 ease-in-out">
          Sign up with Email
        </button>

        {/* OR divider */}
        <div className="flex items-center justify-center w-full max-w-md md:my-6 space-x-2">
          <hr className="border-gray-500 flex-1 w-1/5" />
          <span className="text-sm md:text-base text-gray-400">OR</span>
          <hr className="border-gray-500 flex-1 w-1/5" />
        </div>

        {/* Sign up with Google button */}
        <button onClick={handleGoogleSignIn}
         className="flex items-center space-x-3 py-3 px-8 rounded-full bg-white text-black shadow-md hover:bg-gray-100 transition-all duration-300">
          <FcGoogle className="w-6 h-6" />
          <span className="font-light text-sm md:text-base">Sign up with Google</span>
        </button>
      </div>

      {/* Footer login link */}
      <div className="text-center mt-2 md:pb-6">
        <p className="text-sm md:text-base text-gray-400">
          Already have an account?{" "}
          <a onClick={()=>handleNavigate('/login')} className="text-blue-300 hover:text-blue-500 underline cursor-pointer">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
