import React, { useState } from "react";

const Cell = ({ value, index, rowIndex, handleChange, rowLength }) => {
  const [hover, setHover] = useState(false);
  const [edited, setEdited] = useState(false);

  const newValue =
    value !== undefined &&
    value.toString().includes(".") &&
    typeof value === "number"
      ? value.toFixed(2)
      : value;

  return (
    <div className={`w-full relative`}>
      <input
        type="text"
        defaultValue={newValue}
        className={`w-full max-h-12 py-3 font-medium text-sm text-wrap overflow-hidden flex items-start gap-5 sm:gap-2 text-left outline-none ${
          edited
            ? "z-50 bg-slate-700 text-white duration-200"
            : "bg-inherit text-black duration-200"
        } ${index === 0 ? "pr-4" : "px-4"} border-r-[1px] border-slate-200`}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => {
          setEdited(true);
          setHover(false);
        }}
        onBlur={(e) => {
          handleChange(e.target.value, index, rowIndex);
          setEdited(false);
        }}
        name={newValue || "empty cell"}
      />
      {newValue !== undefined && newValue.toString().length >= 20 && hover && (
        <div
          className={`absolute ${
            index >= rowLength - 5 && "mb-16"
          } w-28 p-2 text-xs rounded-sm bg-black text-white text-wrap z-99 animate-fade`}
        >
          {newValue}
        </div>
      )}
    </div>
  );
};

export default Cell;
