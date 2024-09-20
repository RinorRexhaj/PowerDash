import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";

const Columns = ({ data, formatColumn, handleChange, minCol }) => {
  const [hover, setHover] = useState(-1);
  const [edited, setEdited] = useState(-1);

  return (
    <div className="w-full sticky top-16 z-50 shadow-2 py-3 px-8 sm:px-4 flex items-center justify-between bg-white gap-4">
      {data !== undefined &&
        data.map((column, index) => {
          const value = formatColumn(column);
          if (minCol - 1 === index) return;
          return (
            <div className="relative" key={value + index}>
              <input
                type="text"
                className={`w-full max-h-12 flex items-start text-[16px] font-medium cursor-pointer text-wrap ${
                  edited === index
                    ? "z-50 bg-slate-700 text-white"
                    : "bg-inherit text-slate-500 hover:text-slate-700"
                } overflow-hidden select-none  duration-150 ease-linear animate-slideIn [animation-fill-mode:backwards]`}
                style={{
                  animationDelay: `${
                    edited !== index ? index * 0.2 + 0.1 : 0
                  }s`,
                }}
                // onMouseEnter={() => setHover(index)}
                // onMouseLeave={() => setHover(-1)}
                defaultValue={value}
                onClick={() => setEdited(index)}
                onBlur={(e) => {
                  setEdited(-1);
                  handleChange(e.target.value, index, 0);
                }}
              />
              {/* <FontAwesomeIcon
                icon={faArrowDown}
                className="relative my-auto w-3 h-3"
              /> */}
              {value.toString().length >= 10 && hover === index && (
                <span className="absolute top-8 w-32 p-2 text-xs rounded-sm bg-black text-white text-wrap z-50 animate-fade">
                  {value}
                </span>
              )}
            </div>
          );
        })}
    </div>
  );
};

export default Columns;
