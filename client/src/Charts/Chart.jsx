import React, { useEffect, useRef, useState, useCallback } from "react";
import { CartesianGrid, Cell, Tooltip, XAxis, YAxis } from "recharts";
import axios from "axios";
import BarsChart from "./BarsChart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faImage,
  faWandMagicSparkles,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useGenerateImage } from "recharts-to-png";
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
  const [createWithAI, setCreateWithAI] = useState(false);
  const [total, setTotal] = useState(0);
  const [average, setAverage] = useState(0);
  const [trendLine, setTrendLine] = useState(false);
  const chartTypes = ["Bar", "Pie", "Scatter"];
  const operations = ["Total", "Average"];
  const timePeriods = ["Daily", "Weekly", "Monthly", "Yearly"];
  const [getPng, { ref }] = useGenerateImage({
    quality: 0.8,
    type: "image/png",
  });
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
  const createWithAIRef = useRef(null);

  const colors = [
    "#003f5c",
    "#2f4b7c",
    "#665191",
    "#a05195",
    "#d45087",
    "#f95d6a",
    "#ff7c43",
    "#ffa600",
    "#003f5c",
    "#2f4b7c",
    "#665191",
    "#a05195",
  ];

  // useEffect(() => {
  //   const fetchDataTypes = async () => {
  //     try {
  //       const openai = new OpenAI({
  //         apiKey:
  //           env.OPEN_AI_KEY,
  //         dangerouslyAllowBrowser: true,
  //       });
  //       const response = await openai.chat.completions.create({
  //         model: "gpt-4o-mini",
  //         messages: [
  //           { role: "system", content: "You are a helpful assistant." },
  //           {
  //             role: "user",
  //             content:
  //               "Return the data types of these columns in this array: " +
  //               JSON.stringify(data[0]),
  //           },
  //         ],
  //       });

  //       console.log(response.choices[0].message.content);
  //       setDataTypes(response.choices[0].message.content);
  //     } catch (error) {
  //       console.error("Error fetching data types:", error);
  //     }
  //   };

  //   fetchDataTypes();
  // }, [data]);

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
    if (total === 0 && average === 0) {
      calculateTotalAverage(formattedData);
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

  const calculateTotalAverage = (data) => {
    let total = 0,
      average = 0;
    [...data].forEach((row) => {
      if (row[yAxisKey] !== undefined) {
        total += row[yAxisKey];
        average += row[yAxisKey];
      }
    });
    average /= data.length;
    setTotal(total.toFixed(2));
    setAverage(average.toFixed(2));
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
    <div className="py-4">
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
        <div className="absolute top-20 right-8 flex gap-3">
          <div
            className={`relative ${
              createWithAI
                ? "h-19 items-start"
                : "h-9 items-center cursor-pointer"
            } flex justify-center rounded-md  overflow-hidden duration-300`}
            onClick={() => {
              if (!createWithAI) {
                setCreateWithAI(true);
                setTimeout(() => {
                  createWithAIRef.current.focus();
                }, 500);
              }
            }}
          >
            <textarea
              className={`h-full w-full resize-none px-3 py-2 flex items-center align-top gap-2 text-sm text-white font-medium outline-none overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 hover:bg-gradient-to-r hover:from-violet-700 hover:to-indigo-700 duration-300 animate-slideDown [animation-fill-mode:backwards] caret-white placeholder:text-slate-300`}
              ref={createWithAIRef}
              placeholder={createWithAI && "Write your prompt..."}
            />
            <p
              className={`absolute margin-auto z-99 text-sm text-white flex gap-1 items-center ${
                createWithAI
                  ? "animate-slideOut opacity-0"
                  : "animate-slideIn opacity-100"
              } [animation-fill-mode:backwards]`}
            >
              <FontAwesomeIcon icon={faWandMagicSparkles} />
              Create with AI
            </p>
            <button
              onClick={(e) => {
                setCreateWithAI(false);
                e.stopPropagation();
                createWithAIRef.current.blur();
              }}
              className={`absolute top-1 right-1 w-4 h-4 p-1 flex items-center justify-center rounded-full bg-white ${
                createWithAI ? "z-99 opacity-80" : "-z-99 opacity-0"
              }`}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <button
              className="px-3 py-2 flex items-center gap-2 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium duration-200 animate-slideDown [animation-fill-mode:backwards]"
              style={{ animationDelay: "0.2s" }}
              onClick={() => chartToImage()}
            >
              <FontAwesomeIcon icon={faImage} />
              Save as Image
            </button>{" "}
            <button
              className="px-3 py-2 flex items-center gap-2 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium duration-200 animate-slideDown [animation-fill-mode:backwards]"
              style={{ animationDelay: "0.3s" }}
            >
              <FontAwesomeIcon icon={faChartLine} />
              Generate Report
            </button>
          </div>
        </div>
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
          operation={operation}
          total={total}
          average={average}
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
