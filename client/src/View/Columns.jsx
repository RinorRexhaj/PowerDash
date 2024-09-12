import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const Columns = ({ data }) => {
  const formatColumn = (column) => {
    let columnString = column.charAt(0).toUpperCase();
    for (let i = 1; i < column.length; i++) {
      if (column.charAt(i) === "_") {
        columnString += " " + column.charAt(i + 1).toUpperCase();
        i++;
      } else {
        columnString += column.charAt(i);
      }
    }
    return columnString;
  };

  return (
    <div className="w-full py-4 px-8 sm:px-4 flex items-center justify-between bg-white gap-4">
      {Object.keys(data).map((column, index) => {
        return (
          <p
            className={`w-full flex items-center text-slate-500 font-medium cursor-pointer select-none hover:text-slate-700 duration-150 ease-linear animate-slideIn [animation-fill-mode:backwards]`}
            style={{ animationDelay: `${index * 0.2 + 0.1}s` }}
            key={column + index}
          >
            {formatColumn(column)}
            <FontAwesomeIcon
              icon={faArrowDown}
              className="relative w-4 h-4 left-2"
            />
          </p>
        );
      })}
    </div>
  );
};

export default Columns;
