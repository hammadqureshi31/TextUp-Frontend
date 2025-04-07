import React from 'react'

const Textup = () => {
  return (
    <div 
      className="relative flex items-center w-full justify-center min-h-screen bg-white" 
      >
      <div className="text-center animate-bounce" style={{
        clipPath: 'clip-path: polygon(0% 0%, 100% 0%, 100% 74.1%, 30.3% 74.1%, 9.5% 100%, 9.5% 74.1%, 0% 74.1%)'
      }}>
        <div className="relative">
          <h1 className=" animate-pulse relative text-5xl md:text-6xl lg:text-7xl font-bold text-[#334E83] font-acme">
            TextUp
          </h1>
        </div>
      </div>
    </div>
  )
}

export default Textup