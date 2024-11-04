import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDownWideShort,
  faArrowUpShortWide,
} from "@fortawesome/free-solid-svg-icons";
import currency from "currency.js";

const Sort = ({
  columns,
  view,
  data,
  setData,
  chartData,
  setChartData,
  timeData,
  setTimeData,
  dataTypes,
  setSort,
  xAxisKey,
  yAxisKey,
  operation,
  setFormattedData,
  copyData,
}) => {
  const [sorted, setSorted] = useState(false);
  const [sortType, setSortType] = useState(false);
  const [sortColumn, setSortColumn] = useState("");

  useEffect(() => {
    if (view === "Charts") {
      if (sortColumn !== "") {
        setChartData(sortChart(dataTypes[sortColumn], sortColumn));
      } else {
        setFormattedData(copyData);
      }
    } else {
      const columnIndex = columns.indexOf(sortColumn);
      const dataType = dataTypes[columns[columnIndex]];
      if (columnIndex !== -1 && dataType !== undefined) {
        setData(sortData(dataType, columnIndex));
      }
    }
  }, [sortType, sortColumn]);

  useEffect(() => {
    setSortColumn(xAxisKey);
  }, [xAxisKey]);

  // useEffect(() => {
  //   setChartData(sortChart());
  // }, [formattedData]);

  useEffect(() => {
    setSort(false);
    setSortColumn("");
  }, [view]);

  const sortData = (dataType, columnIndex) => {
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
    return sortedData;
  };

  const sortChart = (dataType, sortColumn) => {
    const sortedData = [...chartData].sort((a, b) => {
      if (dataType === "string") {
        return !sortType
          ? a[sortColumn].localeCompare(b[sortColumn])
          : b[sortColumn].localeCompare(a[sortColumn]);
      } else if (dataType === "number")
        return !sortType
          ? currency(a[sortColumn]) - currency(b[sortColumn])
          : currency(b[sortColumn]) - currency(a[sortColumn]);
      else if (dataType === "date")
        return !sortType
          ? new Date(a[sortColumn]).getTime() -
              new Date(b[sortColumn]).getTime()
          : new Date(b[sortColumn]).getTime() -
              new Date(a[sortColumn]).getTime();
    });
    return sortedData;
  };

  return (
    <div
      className="relative flex border-4 border-slate-200 rounded-md animate-slideIn [animation-fill-mode:backwards]"
      style={{ animationDelay: "0.9s" }}
    >
      <button
        className="min-w-32 h-8 flex gap-3 items-center justify-between py-1 px-3 bg-blue-500 rounded-l-sm text-white font-medium text-left hover:bg-blue-600 duration-150"
        onClick={() => setSorted(!sorted)}
      >
        {sortColumn === "" ? "Sort By:" : sortColumn}
      </button>
      <span className="h-full w-[1px] bg-white"></span>
      <button
        className="w-8 flex items-center justify-center bg-blue-500 rounded-r-sm text-white font-medium text-left hover:bg-blue-600 duration-150"
        onClick={() => setSortType(!sortType)}
      >
        <FontAwesomeIcon
          icon={sortType ? faArrowDownWideShort : faArrowUpShortWide}
        />
      </button>
      <div
        className={`absolute right-0 top-10.5 ${
          sorted ? "flex animate-fade" : "hidden animate-fadeOut"
        } flex-col bg-white border-2 border-slate-200 shadow-3 rounded-sm duration-300`}
      >
        <button
          className={`min-w-40 rounded-sm font-medium py-1 px-2 text-left ${
            sortColumn === ""
              ? "bg-black text-white"
              : "text-black hover:bg-slate-200"
          } duration-200`}
          onClick={() => {
            setSorted(false);
            setSort(false);
            setSortColumn("");
          }}
          key={"nosort"}
        >
          No Sort
        </button>
        {columns.map((col) => {
          return (
            <button
              className={`min-w-40 rounded-sm font-medium py-1 px-2 text-left ${
                sortColumn === col
                  ? "bg-black text-white"
                  : "text-black hover:bg-slate-200"
              } duration-200`}
              onClick={() => {
                setSorted(false);
                setSortColumn(col);
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
