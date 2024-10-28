import React, { useEffect, useRef, useState, useCallback } from "react";
import { CartesianGrid, Cell, Tooltip, XAxis, YAxis } from "recharts";
import axios from "axios";
import BarsChart from "./BarsChart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faImage } from "@fortawesome/free-solid-svg-icons";
import { useCurrentPng } from "recharts-to-png";
import FileSaver from "file-saver";

const Chart = ({
  title,
  data,
  formattedData,
  setFormattedData,
  dataTypes,
  sort,
  setCopyData,
  xAxisKey,
  setXAxisKey,
  yAxisKey,
  setYAxisKey,
  operation,
  setOperation,
}) => {
  let initialData = [];
  const [chartType, setChartType] = useState("Bar");
  const [timePeriod, setTimePeriod] = useState(false);
  const [timeData, setTimeData] = useState([]);
  const [periods, setPeriods] = useState("Monthly");
  const [trendLine, setTrendLine] = useState(false);
  const chartTypes = ["Bar", "Pie", "Scatter"];
  const operations = ["Total", "Average"];
  const timePeriods = ["Daily", "Weekly", "Monthly", "Yearly"];
  const [getPng, { ref, isLoading }] = useCurrentPng();
  const groupings = {
    Daily: (date) => date.toISOString().split("T")[0],
    Weekly: (date) => {
      const startOfWeek = new Date(date);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      return startOfWeek.toISOString().split("T")[0];
    },
    Monthly: (date) => `${date.toLocaleString("default", { month: "short" })}`,
    Yearly: (date) => `${date.getFullYear()}`,
  };
  const trendLineInput = useRef(null);

  useEffect(() => {
    if (data && data.length > 0) {
      if (!sort) initializeKeys(data[0]);
      if (dataTypes !== undefined) formatData();
    }
    // axios.get("http://127.0.0.1:5000").then((res) => console.log(res.data));
  }, []);

  useEffect(() => {
    if (data && data.length > 0) {
      if (!sort) initializeKeys(data[0]);
      if (dataTypes !== undefined) {
        formatData();
        handleTimePeriod();
      }
    }
  }, [data]);

  useEffect(() => {
    formatData();
  }, [yAxisKey, operation]);

  useEffect(() => {
    formatData();
    handleTimePeriod();
  }, [xAxisKey]);

  useEffect(() => {
    formatData();
    groupByTimePeriod(initialData, periods);
  }, [periods]);

  const handleTimePeriod = () => {
    if (dataTypes[xAxisKey] === "date") {
      setTimePeriod(true);
      groupByTimePeriod(initialData, periods);
    } else {
      setTimePeriod(false);
      setPeriods("Monthly");
    }
  };

  const formatData = () => {
    const formattedData = data.map((row) => {
      let newRow = { ...row };
      Object.entries(row).map(([key, value]) => {
        const type = dataTypes[key];
        if (type === "string") newRow[key] = value;
        else if (type === "number") {
          newRow[key] = parseFloat(value.replace(/[^0-9.-]+/g, ""));
        } else if (type === "date") {
          newRow[key] = isNaN(new Date(value).getTime())
            ? value
            : new Date(value);
        }
      });
      return newRow;
    });
    let newData;
    if (operation === "Total") {
      newData = groupByProperty(formattedData, xAxisKey);
    } else if (operation === "Average") {
      newData = averageByProperty(formattedData, xAxisKey, yAxisKey);
    }
    if (initialData.length === 0) {
      initialData = newData;
    }
    setFormattedData(newData);
    setCopyData(newData);
  };

  const initializeKeys = (data) => {
    const keys = Object.keys(data);
    if (keys.length >= 2) {
      setXAxisKey(keys[0]);
      keys.forEach((key) => {
        if (dataTypes[key] === "number") setYAxisKey(key);
        return;
      });
    }
  };

  const groupByProperty = (arr, prop) => {
    return arr.reduce((acc, obj) => {
      const existing = acc.find((item) => item[prop] === obj[prop]);
      if (existing) {
        for (let key in obj) {
          if (key !== prop && typeof obj[key] === "number") {
            existing[key] = (existing[key] || 0) + obj[key];
          }
        }
      } else {
        acc.push({ ...obj });
      }
      return acc;
    }, []);
  };

  const averageByProperty = (arr, groupByProp, avgProp) => {
    const grouped = arr.reduce((acc, obj) => {
      const existing = acc.find(
        (item) => item[groupByProp] === obj[groupByProp]
      );
      if (existing) {
        existing.sum += obj[avgProp];
        existing.count++;
      } else {
        acc.push({ ...obj, sum: obj[avgProp], count: 1 });
      }
      return acc;
    }, []);
    return grouped
      .map((item) => ({
        ...item,
        [avgProp]: item.sum / item.count,
      }))
      .map(({ sum, count, ...rest }) => rest);
  };

  const groupByTimePeriod = (data, period) => {
    const groupBy = groupings[period];
    const xKey = [...data].map((val) => val[xAxisKey]);
    const minDate = Math.min(...xKey);
    const maxDate = Math.max(...xKey);
    let groupedData = data.reduce((acc, item) => {
      const date = new Date(item[xAxisKey]);
      const key = groupBy(date);
      const newValue = { ...item };
      const existing = acc.find((val) => val[xAxisKey] === key);
      if (existing) {
        existing[yAxisKey] += item[yAxisKey];
      } else {
        newValue[xAxisKey] = key;
        newValue[yAxisKey] = item[yAxisKey];
        acc.push(newValue);
      }
      return acc;
    }, []);
    if (period !== "Monthly") {
      groupedData.sort(
        (a, b) =>
          new Date(a[xAxisKey]).getTime() - new Date(b[xAxisKey]).getTime()
      );
    } else {
      groupedData = sortAndCompleteMonths(groupedData);
    }
    setTimeData(groupedData);
  };

  const sortAndCompleteMonths = (months) => {
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
    const monthSet = new Set(months[xAxisKey]);
    monthOrder.forEach((month) => {
      let mon = months.find((m) => m[xAxisKey] === month);
      monthSet.add({
        [xAxisKey]: month,
        [yAxisKey]: mon === undefined ? 0 : mon[yAxisKey],
      });
    });
    return Array.from(monthSet).sort(
      (a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b)
    );
  };

  const chartToImage = useCallback(async () => {
    const png = await getPng();
    if (png) {
      FileSaver.saveAs(png, `${title}.png`);
    }
  }, [getPng]);

  return (
    <div className="py-6">
      <div className="px-6 flex items-center gap-3 mb-4">
        <label className="font-medium">Chart Type: </label>
        <select
          className="relative flex border-4 border-slate-200 font-medium rounded-md cursor-pointer"
          onChange={(e) => setChartType(e.target.value)}
          value={chartType}
        >
          {chartTypes.map((type) => {
            return (
              <option value={type} className={`font-medium`}>
                {type} Chart
              </option>
            );
          })}
        </select>
        <label className="font-medium">Operation: </label>
        <select
          className="relative flex border-4 border-slate-200 font-medium rounded-md cursor-pointer"
          onChange={(e) => setOperation(e.target.value)}
          value={operation}
        >
          {operations.map((type) => {
            return (
              <option value={type} className={`font-medium`}>
                {type}
              </option>
            );
          })}
        </select>
        <label className="font-medium">Trend Line: </label>
        <input
          type="checkbox"
          name="trendline"
          id="trendline"
          ref={trendLineInput}
          onClick={() => {
            setTrendLine(!trendLine);
          }}
          className="w-4 h-4 cursor-pointer"
        />
        <button
          className="absolute right-8 px-3 py-2 flex items-center justify-center gap-2 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium duration-200 animate-slideDown [animation-fill-mode:backwards]"
          style={{ animationDelay: "0.2s" }}
          onClick={() => chartToImage()}
        >
          <FontAwesomeIcon icon={faImage} />
          Save as Image
        </button>{" "}
        <button
          className="absolute right-8 top-32 px-3 py-2 flex items-center justify-center gap-2 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium duration-200 animate-slideDown [animation-fill-mode:backwards]"
          style={{ animationDelay: "0.3s" }}
        >
          <FontAwesomeIcon icon={faChartLine} />
          Generate Report
        </button>{" "}
      </div>

      <div className="px-6 flex items-center gap-4 mb-4 font-medium">
        <label>X-Axis: </label>
        <div className="flex">
          <select
            className="relative flex border-4 border-slate-200 rounded-md cursor-pointer"
            onChange={(e) => setXAxisKey(e.target.value)}
            value={xAxisKey}
          >
            {Object.keys(data[0] || {}).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
          {timePeriod && (
            <select
              className="relative flex border-4 border-slate-200 rounded-md cursor-pointer"
              onChange={(e) => setPeriods(e.target.value)}
              value={periods}
            >
              {timePeriods.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          )}
        </div>

        {chartType !== "Pie" && (
          <>
            <label>Y-Axis: </label>
            <select
              className="relative flex border-4 border-slate-200 rounded-md cursor-pointer"
              onChange={(e) => setYAxisKey(e.target.value)}
              value={yAxisKey}
            >
              {Object.keys(data[0] || {}).map((key) => {
                if (dataTypes[key] === "number")
                  return (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  );
              })}
            </select>
          </>
        )}
      </div>

      {chartType === "Bar" && (
        <BarsChart
          data={data}
          timePeriod={timePeriod}
          timeData={timeData}
          formattedData={formattedData}
          xAxisKey={xAxisKey}
          yAxisKey={yAxisKey}
          trendLine={trendLine}
          dataTypes={dataTypes}
          groupings={groupings}
          periods={periods}
          chartRef={ref}
        />
      )}

      {chartType === "Pie" && (
        <PieChart width={400} height={400}>
          <Pie
            dataKey={xAxisKey}
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={150}
            fill="#82ca9d"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      )}

      {chartType === "Scatter" && (
        <ScatterChart width={830} height={350}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisKey} className="font-medium" />
          <YAxis dataKey={yAxisKey} className="font-medium" />
          <Tooltip />
          <Scatter data={data} fill="#8884d8" />
        </ScatterChart>
      )}
    </div>
  );
};

export default Chart;
