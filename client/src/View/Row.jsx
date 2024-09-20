import React from "react";
import Cell from "./Cell";

const Row = ({ element, index, minCol, handleChange, rowLength }) => {
  return (
    <div
      className={`relative w-full px-8  sm:px-4 flex items-center animate-slideDown [animation-fill-mode:backwards]`}
      style={{ animationDelay: `${index > 15 ? 0 : index * 0.1 + 0.05}s` }}
    >
      {Object.entries(element).map(([key, value], idx) => {
        if (minCol - 1 === idx || minCol === key) return;
        return (
          <Cell
            key={key + value + idx}
            value={value}
            index={idx}
            rowIndex={index}
            handleChange={handleChange}
            rowLength={rowLength}
          />
        );
      })}
      <span className="w-full absolute left-0 bottom-0 h-[1px] bg-slate-200"></span>
    </div>
  );
};

export default Row;
