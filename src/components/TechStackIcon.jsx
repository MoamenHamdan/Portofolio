import React from 'react';

const TechStackIcon = ({ TechStackIcon, Language }) => {
  return (
    <div className="group p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-300 ease-in-out flex flex-col items-center justify-center gap-3 hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl">
      <div className="relative flex items-center justify-center">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-red-500 rounded-full opacity-0 group-hover:opacity-50 blur transition duration-300"></div>
        {/* Fixed container — same size for every icon */}
        <div className="relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center">
          <img
            src={TechStackIcon}
            alt={`${Language} icon`}
            className="w-full h-full object-contain transform transition-transform duration-300"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
        </div>
      </div>
      <span className="text-slate-300 font-semibold text-xs md:text-sm tracking-wide group-hover:text-white transition-colors duration-300 text-center leading-tight">
        {Language}
      </span>
    </div>
  );
};

export default TechStackIcon;