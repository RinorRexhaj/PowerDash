import React, { useEffect, useState } from "react";

const View = ({ type, created }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, [type]);

  return (
    <div
      className={`w-full ${
        type !== "" ? "flex" : "hidden"
      }  flex-col justify-center items-center ${!mounted && "animate-fade"}`}
      style={{ animationDelay: created ? "0.2s" : "0s" }}
    >
      <div className="w-full relative min-h-125 shadow-2 bg-white flex flex-col">
        <div className="w-full flex items-center justify-between bg-white py-4 px-8 sm:px-4">
          <h1 className="text-xl font-semibold animate-slideDown">{type}</h1>
        </div>
        <span className="w-full h-[1px] bg-slate-200"></span>
      </div>
    </div>
  );
};

export default View;
