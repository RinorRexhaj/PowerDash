import React, { useState, useRef, useEffect } from "react";
import {
  faArrowDown,
  faArrowDown19,
  faArrowDownAZ,
  faDownload,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Row from "./Row";
import Columns from "./Columns";
import ImportExcel from "../components/ImportExcel";
import Chart from "../Charts/Chart";

const View = ({ type, created, deleted }) => {
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [fileSelected, setFileSelected] = useState(false);
  const [fileImported, setFileImported] = useState(false);
  const [minCol, setMinCol] = useState();
  const [view, setView] = useState("Data");
  const inputRef = useRef();

  useEffect(() => {
    let localData = localStorage.getItem(type);
    if (localData !== null) {
      localData = JSON.parse(localData);
      setData(localData);
      arrayToObjectData(localData);
    }
  }, []);

  const openInput = () => {
    inputRef.current.click();
  };

  const handleChange = (value, cell, index) => {
    setData(
      data.map((row, idx) => {
        if (index === idx) {
          row[cell] = value;
          return row;
        }
        return row;
      })
    );
  };

  const formatColumn = (column) => {
    let columnString = column.toString().charAt(0).toUpperCase();
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

  const arrayToObjectData = (data) => {
    setChartData(
      data
        .map((row, index) => {
          if (index === 0) return;
          let obj = {};
          Object.entries(data[0]).map((el, idx) => {
            obj = { ...obj, [el[1]]: row[idx] };
          });
          return obj;
        })
        .slice(1)
    );
  };

  return (
    <div
      className={`w-full relative ${
        type !== "" ? "flex" : "hidden"
      }  flex-col z-50 justify-center items-center animate-fade ${
        deleted && "animate-fadeOut"
      } [animation-fill-mode:backwards]`}
      style={{ animationDelay: created ? "0.2s" : "0s" }}
    >
      <div className="w-full relative min-h-125 shadow-2 bg-white flex flex-col overflow-y-clip">
        <div className="w-full sticky top-0 z-99 flex items-center justify-between shadow-2 bg-white py-3 px-8 sm:px-4">
          <h1 className={`flex text-xl font-semibold overflow-hidden`}>
            {type.split("").map((char, index) => {
              return (
                <p
                  className="animate-textReveal [animation-fill-mode:backwards]"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  key={`${char}-${index}`}
                >
                  {char === " " ? "\u00A0" : char}{" "}
                </p>
              );
            })}
          </h1>
          <div className="flex items-center gap-4">
            <div
              className="p-1 flex bg-slate-200 rounded-md items-center gap-1 animate-fade [animation-fill-mode:backwards]"
              style={{ animationDelay: "0.5s" }}
            >
              <button
                className={`px-3 py-1 font-medium rounded-md ${
                  view === "Data"
                    ? "bg-black text-white"
                    : "bg-white text-black"
                } animate-slideDown [animation-fill-mode:backwards] duration-500`}
                onClick={() => setView("Data")}
                style={{ animationDelay: "0.75s" }}
              >
                Data
              </button>
              <button
                className={`px-3 py-1 font-medium rounded-md ${
                  view === "Charts"
                    ? "bg-black text-white"
                    : "bg-white text-black"
                } animate-slideDown [animation-fill-mode:backwards]  duration-300`}
                onClick={() => setView("Charts")}
                style={{ animationDelay: "1s" }}
              >
                Charts
              </button>
            </div>
            <button
              className="px-3 py-2 flex items-center justify-center gap-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium duration-200 animate-slideDown [animation-fill-mode:backwards]"
              style={{ animationDelay: "0.5s" }}
              onClick={openInput}
            >
              <FontAwesomeIcon icon={faDownload} />
              Import Data
            </button>
          </div>
        </div>
        <span className="w-full sticky top-15 z-50 h-[1px] bg-slate-200"></span>
        {view === "Data" ? (
          <div>
            <Columns
              data={data[0]}
              formatColumn={formatColumn}
              minCol={minCol}
              handleChange={handleChange}
            />
            <span className="w-full h-[0.5px] bg-slate-200"></span>
            <ImportExcel
              type={type}
              setData={setData}
              setFileSelected={setFileSelected}
              setFileImported={setFileImported}
              inputRef={inputRef}
              setMinCol={setMinCol}
            />
            {fileSelected && data.length === 0 ? (
              <p className="text-red-500 font-bold">No data to display</p>
            ) : (
              data.map((element, index) => {
                if (index === 0) return;
                return (
                  <Row
                    element={element}
                    index={index}
                    key={Object.keys(element)[0] + index}
                    handleChange={handleChange}
                    rowLength={data.length}
                    minCol={minCol}
                  />
                );
              })
            )}
          </div>
        ) : (
          <Chart data={chartData} />
        )}
      </div>
    </div>
  );
};

export default View;
