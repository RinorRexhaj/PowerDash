import {
  faCircleMinus,
  faFilter,
  faFilterCircleXmark,
  faMagnifyingGlassChart,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import Search from "./Search";
import Filter from "./Filter";
import currency from "currency.js";

const FilterSearch = ({
  columns,
  view,
  data,
  setData,
  setChartData,
  copyData,
  copyChartData,
  dataTypes,
  groupings,
  formattedColumns,
  setSort,
  setSortType,
  setSortColumn,
}) => {
  const [filter, setFilter] = useState(false);
  const [search, setSearch] = useState(false);
  const [filterColumns, setFilterColumns] = useState([]);
  const [currentColumn, setCurrentColumn] = useState("");
  const [currentValues, setCurrentValues] = useState([]);
  const [valueSet, setValueSet] = useState([]);
  const [timeFilter, setTimeFilter] = useState("Daily");
  const selectAllRef = useRef(null);

  useEffect(() => {
    initializeValues();
  }, []);

  useEffect(() => {
    if (currentValues.length === 0) return;
    if (view === "Data") filterData();
    else filterCharts();
  }, [view]);

  useEffect(() => {
    if (currentValues.length === 0) return;
    setCurrentColumn("");
  }, [filter]);

  useEffect(() => {
    if (currentValues.length === 0) return;
    filterData();
    filterCharts();
    if (currentColumn !== "") {
      if (
        currentValues[columns.indexOf(currentColumn)].length !== 0 &&
        currentValues[columns.indexOf(currentColumn)].length !==
          valueSet[columns.indexOf(currentColumn)].length
      )
        selectAllRef.current.indeterminate = true;
      else selectAllRef.current.indeterminate = false;
    }
  }, [currentValues]);

  useEffect(() => {
    if (currentValues.length === 0) return;
    filterData();
    filterCharts();
    orderByTime();
  }, [timeFilter]);

  const filterData = () => {
    const newData = [...copyData].slice(1).filter((row) => {
      for (let i = 0; i < row.length; i++) {
        const type = dataTypes[columns[i]];
        if (
          (type === "date" &&
            currentValues[i].includes(
              timeFilter === "Yearly"
                ? parseInt(groupings[timeFilter](row[i]))
                : groupings[timeFilter](row[i])
            )) ||
          currentValues[i].includes(row[i])
        )
          return false;
      }
      return true;
    });
    if (search) return;
    newData.unshift(columns);
    setData(newData);
  };

  const filterCharts = () => {
    const newData = [...copyChartData].filter((row) => {
      const entries = Object.entries(row);
      for (let i = 0; i < entries.length; i++) {
        const [key, value] = entries[i];
        const type = dataTypes[key];
        if (
          type === "date" &&
          currentValues[columns.indexOf(key)].includes(
            timeFilter === "Yearly"
              ? parseInt(groupings[timeFilter](value))
              : groupings[timeFilter](value)
          )
        )
          return false;
        else if (currentValues[columns.indexOf(key)].includes(value))
          return false;
      }
      return true;
    });
    setChartData(newData);
  };

  const initializeValues = () => {
    setFilter(false);
    if (
      copyData.length > 0 &&
      !currentValues.some((values) => values.length > 0)
    )
      setValues();
    if (
      copyChartData.length > 0 &&
      !currentValues.some((values) => values.length > 0)
    )
      setChartValues();
  };

  const setValues = () => {
    const newValueSet = Array(columns.length)
      .fill(null)
      .map(() => new Set());
    [...data].slice(1).forEach((row) => {
      row.forEach((entry, index) => {
        if (index < newValueSet.length) {
          newValueSet[index].add(entry);
        }
      });
    });
    const newValues = newValueSet.map((set) => Array.from(set));
    const sortedValues = newValues.map((col, index) => {
      return col.sort((a, b) => {
        const dataType = dataTypes[columns[index]];
        if (dataType === "string") {
          return a.localeCompare(b);
        } else if (dataType === "number") {
          return currency(a) - currency(b);
        } else if (dataType === "date") {
          return new Date(a).getTime() - new Date(b).getTime();
        }
      });
    });
    setValueSet(sortedValues);
    setCurrentValues(columns.map(() => []));
  };

  const setChartValues = () => {
    const newValueSet = Array(columns.length)
      .fill(null)
      .map(() => new Set());
    [...copyChartData].forEach((row) => {
      Object.entries(row).forEach((entry, index) => {
        if (index < newValueSet.length) {
          newValueSet[index].add(entry[1]);
        }
      });
    });
    const newValues = newValueSet.map((set) => Array.from(set));
    const sortedValues = newValues.map((col, index) => {
      return col.sort((a, b) => {
        const dataType = dataTypes[columns[index]];
        if (dataType === "string") {
          return a.localeCompare(b);
        } else if (dataType === "number") {
          return currency(a) - currency(b);
        } else if (dataType === "date") {
          return new Date(a).getTime() - new Date(b).getTime();
        }
      });
    });
    setValueSet(sortedValues);
    setCurrentValues(columns.map(() => []));
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
      [...copyData]
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
    <div
      className="relative z-9999 flex border-4 border-slate-200 rounded-md animate-slideIn [animation-fill-mode:backwards]"
      style={{ animationDelay: "0.9s" }}
    >
      <button
        className={`w-24 h-8 flex gap-2 items-center justify-between py-1 px-3 ${
          currentValues.some((values) => values.length > 0)
            ? "bg-cyan-600"
            : "bg-cyan-500"
        }  rounded-l-sm text-white font-medium text-left hover:bg-cyan-600 duration-150 animate-slideIn [animation-fill-mode:backwards]`}
        style={{ animationDelay: "1.1s" }}
        onClick={() => {
          setFilter(!filter);
          setSearch(false);
        }}
      >
        Filter{" "}
        <FontAwesomeIcon
          icon={
            currentValues.some((values) => values.length > 0)
              ? faFilterCircleXmark
              : faFilter
          }
          className={`${
            currentValues.some((values) => values.length > 0) &&
            "hover:bg-cyan-800 py-1 px-1.5 rounded-sm duration-150"
          }`}
          onClick={(e) => {
            if (currentValues.some((values) => values.length > 0)) {
              e.stopPropagation();
              setCurrentValues(columns.map(() => []));
              setFilterColumns([]);
              setCurrentColumn("");
            }
          }}
        />
      </button>
      <span className="h-full w-[1px] z-99 bg-white"></span>
      <button
        className={`w-24 py-1 px-3 flex gap-2 items-center bg-emerald-400 rounded-r-sm text-white font-medium text-left hover:bg-emerald-500 ${
          search && "bg-emerald-500"
        } duration-150 animate-slideIn [animation-fill-mode:backwards]`}
        style={{ animationDelay: "1.2s" }}
        onClick={() => {
          setSearch(!search);
          setFilter(false);
        }}
      >
        Search <FontAwesomeIcon icon={faMagnifyingGlassChart} />
      </button>
      <Filter
        view={view}
        dataTypes={dataTypes}
        filter={filter}
        columns={columns}
        filterColumns={filterColumns}
        setFilterColumns={setFilterColumns}
        currentColumn={currentColumn}
        setCurrentColumn={setCurrentColumn}
        currentValues={currentValues}
        setCurrentValues={setCurrentValues}
        valueSet={valueSet}
        setValueSet={setValueSet}
        groupings={groupings}
        setFilter={setFilter}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        selectAllRef={selectAllRef}
      />
      <Search
        search={search}
        setSearch={setSearch}
        data={data}
        setData={setData}
        copyData={copyData}
        dataTypes={dataTypes}
        columns={columns}
        formattedColumns={formattedColumns}
        setSortType={setSortType}
        setSortColumn={setSortColumn}
        valueSet={valueSet}
        currentValues={currentValues}
        setCurrentValues={setCurrentValues}
        filterColumns={filterColumns}
        setFilterColumns={setFilterColumns}
      />
    </div>
  );
};

export default FilterSearch;
