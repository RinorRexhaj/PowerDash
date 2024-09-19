import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

const Columns = ({ data, formatColumn, minCol }) => {
  const [hover, setHover] = useState(-1);
  return (
    <div className="w-full sticky top-16 z-50 shadow-2 py-3 px-8 sm:px-4 flex items-center justify-between bg-white gap-4">
      {data !== undefined &&
        data.map((column, index) => {
          const value = formatColumn(column);
          if (minCol - 1 === index) return;
          return (
            <p
              className={`w-full max-h-12 flex items-start text-slate-500 text-[16px] font-medium cursor-pointer text-wrap overflow-hidden select-none hover:text-slate-700 duration-150 ease-linear animate-slideIn [animation-fill-mode:backwards]`}
              style={{
                animationDelay: `${index * 0.2 + 0.1}s`,
              }}
              onMouseEnter={() => setHover(index)}
              onMouseLeave={() => setHover(-1)}
              key={column + index}
            >
              {value}
              <FontAwesomeIcon
                icon={faArrowDown}
                className="relative m-auto w-3 h-3"
              />
              {value.toString().length >= 20 && hover === index && (
                <span className="absolute w-32 p-2 text-xs rounded-sm bg-black text-white text-wrap z-50 animate-fade">
                  {value}
                </span>
              )}
            </p>
          );
        })}
    </div>
  );
};

export default Columns;
