import React from "react";

const Row = ({ id, firstName, lastName, email }) => {
  return (
    <div className="relative w-full py-6 px-8  sm:px-4 flex md:flex-wrap items-center justify-between gap-4">
      <div className="w-1/3 md:w-3/5 text-black font-medium text-sm flex items-center gap-5 sm:gap-2">
        {id}
      </div>
      <div className="w-1/3 md:w-3/5 text-black font-medium text-sm flex items-center gap-5 sm:gap-2">
        {firstName}
      </div>
      <div className="w-1/3 md:w-3/5 text-black font-medium text-sm flex items-center gap-5 sm:gap-2">
        {lastName}
      </div>
      <div className="w-1/3 md:w-3/5 text-black font-medium text-sm flex items-center gap-5 sm:gap-2">
        {email}
      </div>
      <span className="w-11/12 absolute bottom-0 h-[1px] bg-slate-200"></span>
    </div>
  );
};

export default Row;
