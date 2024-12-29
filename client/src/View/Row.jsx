import React, { useState } from "react";
import Cell from "./Cell";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const Row = ({
  element,
  index,
  handleChange,
  deleteRow,
  deletedRow,
  rowLength,
}) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      className={`relative w-full px-8 sm:px-4 flex items-center ${
        deletedRow !== index
          ? deletedRow === undefined && "animate-slideDown"
          : "animate-fadeOut"
      } [animation-fill-mode:backwards]`}
      style={{
        animationDelay: `${
          deletedRow !== index && index > 15 ? 0 : index * 0.05 + 0.05
        }s`,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* {hover && (
        <button
          className="absolute left-0 px-2 py-1 rounded-sm bg-red-500 hover:bg-red-600 text-white duration-150 animate-fade"
          onClick={() => deleteRow(index)}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
      )} */}
      {Object.entries(element).map(([key, value], idx) => {
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
