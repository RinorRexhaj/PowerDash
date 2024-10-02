import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";
import currency from "currency.js";

const Sort = ({ columns, data, setData, dataTypes }) => {
  const [sort, setSort] = useState(false);
  const [sortType, setSortType] = useState(false);
  const [sortColumn, setSortColumn] = useState("");

  useEffect(() => {
    const columnIndex = columns.indexOf(sortColumn);
    const dataType = dataTypes[columns[columnIndex]];
    if (columnIndex !== -1 && dataType !== undefined) {
      const sortedData = [...data]
        .filter((row, index) => index !== 0)
        .sort((a, b) => {
          if (dataType === "string") {
            return !sortType
              ? a[columnIndex].localeCompare(b[columnIndex])
              : b[columnIndex].localeCompare(a[columnIndex]);
          } else if (dataType === "number") {
            return !sortType
              ? currency(a[columnIndex]) - currency(b[columnIndex])
              : currency(b[columnIndex]) - currency(a[columnIndex]);
          } else if (dataType === "date") {
            return !sortType
              ? new Date(a[columnIndex]).getTime() -
                  new Date(b[columnIndex]).getTime()
              : new Date(b[columnIndex]).getTime() -
                  new Date(a[columnIndex]).getTime();
          }
        });
      sortedData.unshift(columns);
      setData(sortedData);
    }
  }, [sortType, sortColumn]);

  return (
    <div
      className="relative flex border-4 border-slate-200 rounded-md animate-slideIn [animation-fill-mode:backwards]"
      style={{ animationDelay: "0.9s" }}
    >
      <button
        className="min-w-32 h-8 flex gap-3 items-center justify-between py-1 px-3 bg-blue-500 rounded-l-sm text-white font-medium text-left hover:bg-blue-600 duration-150"
        onClick={() => setSort(!sort)}
      >
        {sortColumn === "" ? "Sort By:" : sortColumn}
      </button>
      <span className="h-full w-[1px] bg-white"></span>
      <button
        className="w-8 flex items-center justify-center bg-blue-500 rounded-r-sm text-white font-medium text-left hover:bg-blue-600 duration-150"
        onClick={() => setSortType(!sortType)}
      >
        <FontAwesomeIcon icon={!sortType ? faAngleDown : faAngleUp} />
      </button>
      <div
        className={`absolute right-0 top-10.5 ${
          sort ? "flex animate-fade" : "hidden animate-fadeOut"
        } flex-col bg-white border-2 border-slate-200 shadow-3 rounded-sm duration-300`}
      >
        {columns.map((col) => {
          return (
            <button
              className={`min-w-40 rounded-sm font-medium py-1 px-2 text-left ${
                sortColumn === col
                  ? "bg-black text-white"
                  : "text-black hover:bg-slate-200"
              } duration-200`}
              onClick={() => {
                setSortColumn(col);
                setSort(false);
              }}
              key={col + "sort"}
            >
              {col}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Sort;
