import React from "react";
import Cell from "./Cell";

const Row = ({ element, index, minCol }) => {
  return (
    <div
      className={`relative w-full px-8  sm:px-4 flex md:flex-wrap items-center justify-between gap-4 animate-slideDown [animation-fill-mode:backwards]`}
      style={{ animationDelay: `${index > 15 ? 0 : index * 0.1 + 0.05}s` }}
    >
      {Object.entries(element).map(([key, value], index) => {
        if (minCol - 1 === index || minCol === key) return;
        return <Cell key={key + value + index} value={value} index={index} />;
      })}
      <span className="w-11/12 absolute bottom-0 h-[1px] bg-slate-200"></span>
    </div>
  );
};

export default Row;
