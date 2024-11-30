import {
  faFilter,
  faMagnifyingGlassChart,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import Search from "./Search";
import Filter from "./Filter";
import currency from "currency.js";

const FilterSearch = ({
  columns,
  view,
  data,
  setData,
  chartData,
  setChartData,
  copyChartData,
  formattedData,
  setFormattedData,
  timeData,
  setTimeData,
  dataTypes,
  yAxisKey,
  operation,
  copyData,
  timePeriod,
  groupings,
}) => {
  const [filter, setFilter] = useState(false);
  const [filterColumns, setFilterColumns] = useState([]);
  const [currentColumn, setCurrentColumn] = useState("");
  const [currentValues, setCurrentValues] = useState([]);
  const [valueSet, setValueSet] = useState([]);
  const [search, setSearch] = useState(false);

  useEffect(() => {
    initializeValues();
  }, []);

  useEffect(() => {
    initializeValues();
  }, [view]);

  const initializeValues = () => {
    setFilter(false);
    if (view === "Data") {
      if (data.length > 0) setValues();
    } else {
      if (copyChartData.length > 0) setChartValues();
    }
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
    setCurrentValues(
      Array(columns.length)
        .fill(null)
        .map(() => [])
    );
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
        onClick={() => setFilter(!filter)}
      >
        Filter <FontAwesomeIcon icon={faFilter} />
      </button>
      <span className="h-full w-[1px] z-99 bg-white"></span>
      <button
        className="w-24 py-1 px-3 flex gap-2 items-center bg-emerald-400 rounded-r-sm text-white font-medium text-left hover:bg-emerald-500 duration-150 animate-slideIn [animation-fill-mode:backwards]"
        style={{ animationDelay: "1.2s" }}
      >
        Search <FontAwesomeIcon icon={faMagnifyingGlassChart} />
      </button>
      {filter ? (
        <Filter
          view={view}
          dataTypes={dataTypes}
          filter={filter}
          columns={columns}
          data={data}
          setData={setData}
          copyData={copyData}
          copyChartData={copyChartData}
          chartData={chartData}
          setChartData={setChartData}
          formattedData={formattedData}
          setFormattedData={setFormattedData}
          timeData={timeData}
          setTimeData={setTimeData}
          timePeriod={timePeriod}
          yAxisKey={yAxisKey}
          filterColumns={filterColumns}
          setFilterColumns={setFilterColumns}
          currentColumn={currentColumn}
          setCurrentColumn={setCurrentColumn}
          currentValues={currentValues}
          setCurrentValues={setCurrentValues}
          valueSet={valueSet}
          setValueSet={setValueSet}
        />
      ) : (
        search && <Search />
      )}
    </div>
  );
};

export default FilterSearch;
