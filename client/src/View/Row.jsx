import React from "react";

const Row = ({ element, index }) => {
  return (
    <div
      className={`relative w-full py-4 px-8  sm:px-4 flex md:flex-wrap items-center justify-between gap-4 animate-slideDown [animation-fill-mode:backwards]`}
      style={{ animationDelay: `${index * 0.1 + 0.05}s` }}
    >
      {Object.entries(element).map(([key, value]) => {
        return (
          <div
            className="w-full text-black font-medium text-sm flex items-center gap-5 sm:gap-2"
            key={key}
          >
            {value}
          </div>
        );
      })}
      <span className="w-11/12 absolute bottom-0 h-[1px] bg-slate-200"></span>
    </div>
  );
};

export default Row;
