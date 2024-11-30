import React, { useState, useEffect } from "react";
import {
  faArrowAltCircleRight,
  faXmarkCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Filter = ({
  view,
  dataTypes,
  filter,
  columns,
  data,
  setData,
  copyData,
  copyChartData,
  chartData,
  setChartData,
  formattedData,
  setFormattedData,
  timeData,
  setTimeData,
  timePeriod,
  yAxisKey,
  filterColumns,
  setFilterColumns,
  currentColumn,
  setCurrentColumn,
  currentValues,
  setCurrentValues,
  valueSet,
  setValueSet,
}) => {
  const [timeFilter, setTimeFilter] = useState("");

  useEffect(() => {
    if (view === "Data") filterData();
    else filterCharts();
  }, [view]);

  useEffect(() => {
    setCurrentColumn("");
  }, [filter]);

  useEffect(() => {
    if (currentValues.length !== 0) {
      if (view === "Data") filterData();
      else filterCharts();
    }
  }, [currentValues, filterColumns]);

  useEffect(() => {
    if (timeFilter !== "") orderByTime();
  }, [timeFilter]);

  const filterData = () => {
    const newData = [...copyData].slice(1).filter((row) => {
      for (let i = 0; i < row.length; i++) {
        if (currentValues[i].includes(row[i])) return false;
      }
      return true;
    });
    newData.unshift(columns);
    setData(newData);
  };

  const filterCharts = () => {
    const newData = [...copyChartData].filter((row) => {
      const entries = Object.entries(row);
      for (let i = 0; i < entries.length; i++) {
        const [key, value] = entries[i];
        if (currentValues[columns.indexOf(key)].includes(value)) return false;
      }
      return true;
    });
    setChartData(newData);
  };

  const orderByTime = () => {
    if (timeFilter === "Monthly") {
      const monthOrder = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      setValueSet(
        valueSet.map((set, index) => {
          if (index === columns.indexOf(currentColumn)) return monthOrder;
          return set;
        })
      );
    } else if (timeFilter === "Quarterly") {
      setValueSet(
        valueSet.map((set, index) => {
          if (index === columns.indexOf(currentColumn))
            return ["Q1", "Q2", "Q3", "Q4"];
          return set;
        })
      );
    } else if (timeFilter === "Yearly") {
      const yearSet = new Set();
      [...data]
        .slice(1)
        .map((item) =>
          yearSet.add(
            new Date(item[columns.indexOf(currentColumn)]).getFullYear()
          )
        );
      const sorted = Array.from(yearSet).sort((a, b) => a - b);
      setValueSet(
        valueSet.map((set, index) => {
          if (index === columns.indexOf(currentColumn)) return sorted;
          return set;
        })
      );
    } else {
      const daySet = new Set();
      [...data]
        .slice(1)
        .map((day) => daySet.add(day[columns.indexOf(currentColumn)]));
      const sorted = Array.from(daySet).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      );
      setValueSet(
        valueSet.map((set, index) => {
          if (index === columns.indexOf(currentColumn)) return sorted;
          return set;
        })
      );
    }
  };

  return (
    <>
      <div
        className={`absolute w-full z-999 left-0 top-10 animate-fade flex-col bg-white border-2 border-slate-200 shadow-3 rounded-sm duration-300`}
      >
        <button
          className={`min-w-40 rounded-sm font-medium py-1 px-2 text-left text-black hover:bg-slate-200 duration-200`}
          onClick={() => {
            setFilterColumns([]);
            setCurrentColumn("");
            setCurrentValues(
              Array(columns.length)
                .fill(null)
                .map(() => [])
            );
          }}
          key={"nofilter"}
        >
          No Filter
        </button>
        {filterColumns.map((key) => {
          return (
            <button
              className={`min-w-40 rounded-sm font-medium py-1 px-2 text-left flex justify-between items-center bg-black text-white duration-200`}
              onClick={() => {
                if (!filterColumns.includes(key)) {
                  setFilterColumns([...filterColumns, key]);
                }
                if (currentColumn === key) setCurrentColumn("");
                else setCurrentColumn(key);
              }}
              key={key + "filter"}
            >
              {key}{" "}
              <FontAwesomeIcon
                icon={faXmarkCircle}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentValues(
                    currentValues.map((val, index) => {
                      if (index === columns.indexOf(key)) return [];
                      return val;
                    })
                  );
                  if (filterColumns.includes(key)) {
                    setFilterColumns(filterColumns.filter((k) => k !== key));
                  }
                  if (currentColumn === key) setCurrentColumn("");
                }}
              />
            </button>
          );
        })}
        {[...columns]
          .filter((col) => !filterColumns.includes(col))
          .map((key) => {
            return (
              <button
                className={`min-w-40 rounded-sm font-medium py-1 px-2 text-left text-black flex justify-between items-center hover:bg-slate-200 duration-200`}
                onClick={() => {
                  if (currentColumn === key) setCurrentColumn("");
                  else setCurrentColumn(key);
                }}
                key={key + "filter"}
              >
                {key} <FontAwesomeIcon icon={faArrowAltCircleRight} />
              </button>
            );
          })}
      </div>
      {currentColumn !== "" && (
        <div
          className={`absolute w-full left-48 top-20 py-1 pl-2 animate-fade flex-col gap-10 bg-white border-2 border-slate-200 shadow-3 rounded-sm duration-300`}
        >
          <p className="font-medium">{currentColumn}</p>
          {dataTypes[currentColumn] === "date" && (
            <div className="flex gap-1 flex-wrap mb-2">
              {["Daily", "Monthly", "Quarterly", "Yearly"].map((val) => (
                <button
                  className={`w-5/12 rounded-sm text-sm font-medium ${
                    timeFilter !== val
                      ? "bg-slate-300 text-black"
                      : "bg-black text-white"
                  } px-1 py-0.5`}
                  onClick={() => setTimeFilter(val)}
                >
                  {val}
                </button>
              ))}
            </div>
          )}
          <div className="max-h-50 z-99 overflow-y-auto">
            <label
              key={"select-all-filter"}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                className="form-checkbox rounded text-blue-600 focus:ring-blue-500 focus:ring-2"
                id={"select-all-filter"}
                checked={
                  currentValues[columns.indexOf(currentColumn)].length === 0
                }
                onChange={() => {
                  if (
                    currentValues[columns.indexOf(currentColumn)].length === 0
                  ) {
                    setCurrentValues(
                      currentValues.map((curr, index) => {
                        if (index === columns.indexOf(currentColumn))
                          return valueSet[columns.indexOf(currentColumn)];
                        return curr;
                      })
                    );
                    if (!filterColumns.includes(currentColumn))
                      setFilterColumns([...filterColumns, currentColumn]);
                  } else {
                    setCurrentValues(
                      currentValues.map((curr, index) => {
                        if (index === columns.indexOf(currentColumn)) return [];
                        return curr;
                      })
                    );
                    setFilterColumns(
                      filterColumns.filter((k) => k !== currentColumn)
                    );
                  }
                }}
              />
              <span className="text-slate-800">Select All</span>
            </label>
            {valueSet[columns.indexOf(currentColumn)].map((val) => {
              return (
                <label
                  key={val}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="form-checkbox rounded text-blue-600 focus:ring-blue-500 focus:ring-2"
                    id={val + "-filter"}
                    checked={
                      !currentValues[columns.indexOf(currentColumn)].includes(
                        val
                      )
                    }
                    onChange={() => {
                      if (
                        !currentValues[columns.indexOf(currentColumn)].includes(
                          val
                        )
                      ) {
                        setCurrentValues(
                          currentValues.map((values, index) => {
                            if (columns.indexOf(currentColumn) !== index)
                              return values;
                            return [...values, val];
                          })
                        );
                        if (!filterColumns.includes(currentColumn))
                          setFilterColumns([...filterColumns, currentColumn]);
                      } else {
                        const newValues = currentValues.map((values, index) => {
                          if (columns.indexOf(currentColumn) !== index)
                            return values;
                          return values.filter((v) => v !== val);
                        });
                        setCurrentValues(newValues);
                        if (
                          filterColumns.includes(currentColumn) &&
                          newValues[columns.indexOf(currentColumn)].length === 0
                        )
                          setFilterColumns(
                            filterColumns.filter((k) => k !== currentColumn)
                          );
                      }
                    }}
                  />
                  <span className="text-slate-800">{val}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default Filter;
