import React from 'react';
import { TfiComment } from 'react-icons/tfi';

const SplashScreen = () => {
  return (
    <div 
      className="relative flex items-center w-full justify-center min-h-screen bg-gradient-to-r from-[#04081E] via-[#2A2760] to-[#334E83] shadow-xl" 
      >
      <div className='relative'>
      <TfiComment className="mx-auto min-w-52 min-h-48 md:min-w-72 md:min-h-80 opacity-20" />
      <div className="absolute left-10 top-1/3 text-center transform -translate-x-1/2 -translate-y-1/2 animate-bounce" style={{
        clipPath: 'clip-path: polygon(0% 0%, 100% 0%, 100% 74.1%, 30.3% 74.1%, 9.5% 100%, 9.5% 74.1%, 0% 74.1%)',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)' 
      }}>
        <div className="">
          <h1 className="animate-pulse text-5xl md:text-6xl lg:text-7xl font-bold text-[#DED4E5] font-acme">
            TextUp
          </h1>
        </div>
      </div>
      </div>
    </div>
  );
};

export default SplashScreen;
