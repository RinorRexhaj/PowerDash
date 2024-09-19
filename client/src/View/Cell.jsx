import React, { useState } from "react";

const Cell = ({ value, index }) => {
  const newValue =
    value !== undefined &&
    value.toString().includes(".") &&
    typeof value === "number"
      ? value.toFixed(2)
      : value;
  const [hover, setHover] = useState(false);
  return (
    <div
      className="w-full max-h-12 py-3 px-0.5 text-black font-medium text-sm text-wrap overflow-hidden flex items-start gap-5 sm:gap-2 text-left border-r-[1px] border-slate-200"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {newValue}
      {newValue.toString().length >= 20 && hover && (
        <div className="absolute w-36 p-2 text-xs rounded-sm bg-black text-white text-wrap z-50 animate-fade">
          {newValue}
        </div>
      )}
    </div>
  );
};

export default Cell;
