import React, { useState, useRef, useEffect } from "react";
import {
  faAngleDown,
  faAngleUp,
  faArrowDown,
  faArrowDown19,
  faArrowDownAZ,
  faDownload,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import Row from "./Row";
import Columns from "./Columns";
import ImportExcel from "../components/ImportExcel";
import Chart from "../Charts/Chart";
import Sort from "../components/Sort";

const View = ({ type, data, setData, created, deleted }) => {
  const [chartData, setChartData] = useState([]);
  const [dataTypes, setDataTypes] = useState(undefined);
  const [fileSelected, setFileSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileImported, setFileImported] = useState(false);
  const [columns, setColumns] = useState([]);
  const [view, setView] = useState("Data");
  const [deletedRow, setDeletedRow] = useState(undefined);
  const inputRef = useRef();
  const views = ["Data", "Charts"];

  useEffect(() => {
    let localData = localStorage.getItem(type);
    if (localData !== null && localData !== undefined && localData !== "") {
      localData = JSON.parse(localData);
      setData(localData);
      setColumns(localData[0]);
      arrayToObjectData(localData);
      inferDataTypes(localData);
    } else {
      setData([]);
      setColumns([]);
      setChartData([]);
      setDataTypes([]);
    }
    moment().format();
  }, [type]);

  useEffect(() => {
    if (data.length > 0) {
      setColumns(data[0]);
      inferDataTypes(data);
    }
  }, [data]);

  const inferDataTypes = (data) => {
    const headers = data[0];
    const types = {};

    headers.forEach((header) => {
      types[header] = [];
    });

    const isNumber = (value) => {
      if (value === undefined || value.trim() === "") return false;
      const cleanValue = value.replace(/[$,€]/g, "");
      return !isNaN(parseFloat(cleanValue)) && isFinite(cleanValue);
    };

    const isDate = (value) => {
      const valString = value.split(" ");
      let invalidString = !isNumber(valString[0]) && isNumber(valString[1]);
      const m = moment(value);
      return m.isValid() && !invalidString;
    };

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      row.forEach((value, index) => {
        if (value.trim() === "") {
          return;
        }
        if (isNumber(value)) {
          types[headers[index]].push("number");
        } else if (isDate(value)) {
          types[headers[index]].push("date");
        } else {
          types[headers[index]].push("string");
        }
      });
    }

    const inferredTypes = {};
    for (const header in types) {
      const counts = {};
      types[header].forEach((type) => {
        counts[type] = (counts[type] || 0) + 1;
      });

      let dominantType = "string";
      let maxCount = 0;
      for (const type in counts) {
        if (counts[type] > maxCount) {
          dominantType = type;
          maxCount = counts[type];
        }
      }
      inferredTypes[header] = dominantType;
    }
    setDataTypes(inferredTypes);
  };

  const openInput = () => {
    inputRef.current.click();
  };

  const deleteRow = (row) => {
    setDeletedRow(row);
    setTimeout(() => {
      setData(data.filter((r, index) => row !== index));
      setDeletedRow(-1);
    }, 400);
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
            {dataTypes !== undefined && (
              <Sort
                columns={columns}
                data={data}
                setData={setData}
                dataTypes={dataTypes}
              />
            )}
            <div
              className="p-1 flex bg-slate-200 rounded-md items-center gap-1 animate-fade [animation-fill-mode:backwards]"
              style={{ animationDelay: "0.5s" }}
            >
              {views.map((chart, index) => {
                return (
                  <button
                    className={`px-3 py-1 font-medium rounded-md ${
                      view === chart
                        ? "bg-black text-white"
                        : "bg-white text-black"
                    } animate-slideDown [animation-fill-mode:backwards] duration-500`}
                    onClick={() => setView(chart)}
                    style={{ animationDelay: index * 0.25 + 0.75 + "s" }}
                    key={"View-" + chart}
                  >
                    {chart}
                  </button>
                );
              })}
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
            {data.length > 0 && columns.length > 0 && (
              <Columns
                data={data}
                setData={setData}
                columns={columns}
                setColumns={setColumns}
                formatColumn={formatColumn}
                handleChange={handleChange}
              />
            )}
            <span className="w-full h-[0.5px] bg-slate-200"></span>
            <ImportExcel
              type={type}
              setData={setData}
              setFileSelected={setFileSelected}
              setFileImported={setFileImported}
              setLoading={setLoading}
              inputRef={inputRef}
            />
            {loading ? (
              <p className={`text-black font-bold`}>Loading...</p>
            ) : fileSelected && (data.length === 0 || data[0].length === 0) ? (
              <p className={`text-red-500 font-bold`}>No data to display</p>
            ) : (
              data.map((element, index) => {
                if (index === 0) return;
                const obj = Object.entries(element);
                return (
                  <Row
                    element={element}
                    index={index}
                    key={obj[0][1] + index}
                    handleChange={handleChange}
                    deleteRow={deleteRow}
                    deletedRow={deletedRow}
                    rowLength={data.length}
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
