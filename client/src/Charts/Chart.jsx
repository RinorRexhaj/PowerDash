import React, { useEffect, useRef, useState, useCallback } from "react";
import { CartesianGrid, Cell, Tooltip, XAxis, YAxis } from "recharts";
import axios from "axios";
import BarsChart from "./BarsChart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faImage,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useGenerateImage } from "recharts-to-png";
import FileSaver from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const Chart = ({
  title,
  data,
  formattedData,
  setFormattedData,
  timeData,
  setTimeData,
  dataTypes,
  columns,
  sort,
  setCopyData,
  xAxisKey,
  setXAxisKey,
  yAxisKey,
  setYAxisKey,
  operation,
  setOperation,
  timePeriod,
  setTimePeriod,
}) => {
  let initialData = [];
  const [chartType, setChartType] = useState("Bar");
  const [periods, setPeriods] = useState("Monthly");
  const [createWithAI, setCreateWithAI] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [total, setTotal] = useState(0);
  const [average, setAverage] = useState(0);
  const [trendLine, setTrendLine] = useState(false);
  const chartTypes = ["Bar", "Pie", "Scatter"];
  const operations = ["Total", "Average"];
  const timePeriods = ["Daily", "Monthly", "Quarterly", "Yearly"];
  const [getPng, { ref }] = useGenerateImage({
    quality: 0.8,
    type: "image/png",
  });
  const groupings = {
    Daily: (date) => date.toISOString().split("T")[0],
    Monthly: (date) => `${date.toLocaleString("default", { month: "short" })}`,
    Quarterly: (date) => {
      const month = new Date(date).getMonth();
      if (month >= 0 && month <= 2) return "Q1";
      else if (month >= 3 && month <= 5) return "Q2";
      else if (month >= 6 && month <= 8) return "Q3";
      return "Q4";
    },
    Yearly: (date) => `${date.getFullYear()}`,
  };
  // const trendLineInput = useRef(null);
  const createWithAIRef = useRef(null);

  useEffect(() => {
    if (data && data.length > 0) {
      if (!sort) initializeKeys(data[0]);
      if (dataTypes !== undefined) formatData();
    }
  }, []);

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

  useEffect(() => {
    formatData();
    handleTimePeriod();
  }, [xAxisKey, yAxisKey, operation]);

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
    let groupedData = data.reduce((acc, item) => {
      const date = new Date(item[xAxisKey]);
      const key = groupBy(date);
      const newValue = { ...item };
      const existing = acc.find((val) => val[xAxisKey] === key);
      if (existing) {
        existing[yAxisKey] += item[yAxisKey];
        existing.count += 1;
      } else {
        newValue[xAxisKey] = key;
        newValue[yAxisKey] = item[yAxisKey];
        newValue.count = 1;
        acc.push(newValue);
      }
      return acc;
    }, []);
    if (operation === "Average") {
      groupedData.forEach((item) => {
        item[yAxisKey] /= item.count;
      });
    }
    if (period === "Monthly") {
      groupedData = sortAndCompleteMonths(groupedData);
    } else if (period === "Quarterly") {
      groupedData = sortAndCompleteQuarters(groupedData);
    } else if (period === "Yearly") {
      groupedData = sortAndCompleteYears(groupedData);
    } else {
      groupedData.sort(
        (a, b) =>
          new Date(a[xAxisKey]).getTime() - new Date(b[xAxisKey]).getTime()
      );
    }
    groupedData.forEach((item) => delete item.count);
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

  const sortAndCompleteQuarters = (data) => {
    const quarterOrder = ["Q1", "Q2", "Q3", "Q4"];
    const quarters = new Set(data[xAxisKey]);
    quarterOrder.forEach((quarter) => {
      let q = data.find((m) => m[xAxisKey] === quarter);
      quarters.add({
        [xAxisKey]: quarter,
        [yAxisKey]: q === undefined ? 0 : q[yAxisKey],
      });
    });
    return Array.from(quarters).sort(
      (a, b) => quarterOrder.indexOf(a) - quarterOrder.indexOf(b)
    );
  };

  const sortAndCompleteYears = (data) => {
    const minYear = Math.min(...data.map((item) => item[xAxisKey]));
    const maxYear = Math.max(...data.map((item) => item[xAxisKey]));
    const years = new Set(data[xAxisKey]);
    for (let i = minYear; i <= maxYear; i++) {
      let y = data.find((y) => y[xAxisKey] == i);
      years.add({
        [xAxisKey]: i,
        [yAxisKey]: y === undefined ? 0 : y[yAxisKey],
      });
    }
    return Array.from(years).sort((a, b) => a[xAxisKey] - b[xAxisKey]);
  };

  const analyzePrompt = async () => {
    createWithAIRef.current.blur();
    setCreateWithAI(false);
    setPrompt("");
    setAnalyzing(true);
    const cols = [...columns].map((col) => {
      col = col.replace(/([a-z])([A-Z])/g, "$1 $2");
      col = col.replace(/[_-]/g, " ");
      return col.toLowerCase().trim();
    });
    const formattedColumns = await axios
      .post("http://127.0.0.1:5000/lemma", { columns: cols })
      .then((res) => res.data);
    let words, synoyms;
    await axios
      .post("http://127.0.0.1:5000/prompt", {
        prompt,
      })
      .then((res) => {
        words = res.data.words;
        synoyms = res.data.synonyms;
      });
    let chartType, xAxis, yAxis, operation, timePeriod, sort;
    words.forEach((word) => {
      chartTypes.forEach((type) => {
        if (word.word === type.toLowerCase()) chartType = type;
      });
      operations.forEach((op) => {
        if (word.word === op.toLowerCase()) operation = op;
      });
      for (const [index, col] of formattedColumns.entries()) {
        for (const w of col.split(" ")) {
          if (w === word.word && dataTypes[columns[index]] === "number") {
            yAxis = columns[index];
            return;
          }
        }
      }
      for (const [index, col] of formattedColumns.entries()) {
        for (const w of col.split(" ")) {
          if (w === word.word || word.word.includes(w)) {
            xAxis = columns[index];
            return;
          }
        }
      }
      for (const [index, period] of [
        "day",
        "month",
        "quarter",
        "year",
      ].entries()) {
        if (word.word === period || word.word.includes(period)) {
          timePeriod = timePeriods[index];
          if (xAxis === undefined) {
            for (const col of columns) {
              if (dataTypes[col] === "date") {
                xAxis = col;
                break;
              }
            }
          }
          return;
        }
      }
    });
    setTimeout(() => {
      if (chartType !== undefined) setChartType(chartType);
      else setChartType("Bar");
      if (operation !== undefined) setOperation(operation);
      else setOperation("Total");
      if (yAxis !== undefined) setYAxisKey(yAxis);
      if (xAxis !== undefined) setXAxisKey(xAxis);
      if (timePeriod !== undefined) setPeriods(timePeriod);
      setAnalyzing(false);
    }, 800);
  };

  const chartToImage = useCallback(async () => {
    const png = await getPng();
    if (png) {
      FileSaver.saveAs(png, `${title}.png`);
    }
  }, [getPng]);

  const chartToPDF = useCallback(async () => {
    const png = await getPng();
    if (png) {
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(png);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(png, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.addPage();
      const columns = Object.keys(data[0] || {});
      const tableData = [];
      columns.forEach((column) => {
        if (typeof data[0][column] === "number") {
          // Numeric data: Calculate statistics
          const columnData = data.map((row) => row[column]);
          const total = columnData.reduce((sum, value) => sum + value, 0);
          const avg = total / columnData.length;
          const max = Math.max(...columnData);
          const min = Math.min(...columnData);

          tableData.push([
            column,
            `Total: ${total.toFixed(2)}`,
            `Avg: ${avg.toFixed(2)}`,
            `Max: ${max.toFixed(2)}`,
            `Min: ${min.toFixed(2)}`,
          ]);
        } else {
          // Categorical data: Count occurrences
          const counts = data.reduce((acc, row) => {
            acc[row[column]] = (acc[row[column]] || 0) + 1;
            return acc;
          }, {});
          Object.entries(counts).forEach(([value, count]) => {
            tableData.push([column, `Value: ${value}`, `Count: ${count}`]);
          });
        }
      });
      const headers =
        tableData.length > 0 && typeof data[0][columns[0]] === "number"
          ? ["Column", "Total", "Average", "Max", "Min"]
          : ["Column", "Value", "Count"];

      // Add table to the new page
      autoTable(pdf, {
        head: [headers],
        body: tableData,
        startY: 20,
      });
      const pdfBlob = pdf.output("blob");
      FileSaver.saveAs(pdfBlob, `${title}.pdf`);
    }
  }, [getPng, data, title]);

  return (
    <div className="py-4">
      <div className="px-6 flex items-center gap-3 mb-4">
        <label htmlFor="type" className="font-medium">
          Chart Type:{" "}
        </label>
        <select
          className="relative flex border-4 border-slate-200 font-medium rounded-md cursor-pointer"
          id="type"
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
        <label htmlFor="operation" className="font-medium">
          Operation:{" "}
        </label>
        <select
          className="relative flex border-4 border-slate-200 font-medium rounded-md cursor-pointer"
          id="operation"
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
        <div className="absolute top-20 right-8 flex gap-2">
          <div
            className={`relative w-50 ${
              createWithAI
                ? "h-19 items-start"
                : "h-9 items-center cursor-pointer"
            } flex justify-center rounded-md  duration-300`}
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
              name="prompt"
              className={`h-full w-full relative resize-none text-start px-3 py-2 flex items-center align-top gap-2 text-sm text-white font-medium outline-none overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 duration-300 animate-slideDown ${
                createWithAI
                  ? "from-violet-700 to-indigo-700 outline-1 outline-slate-400 rounded-xl"
                  : "cursor-pointer rounded-md"
              } [animation-fill-mode:backwards] caret-white placeholder:text-slate-300`}
              value={createWithAI ? prompt : ""}
              ref={createWithAIRef}
              placeholder={createWithAI && "Write your prompt..."}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  analyzePrompt();
                }
              }}
            />
            <div
              className={`absolute margin-auto z-50 text-sm text-white font-medium flex gap-1 items-center ${
                createWithAI
                  ? "animate-slideOut opacity-0"
                  : !analyzing && "animate-slideIn opacity-100"
              } ${
                analyzing && "animate-analyzing"
              } [animation-fill-mode:backwards]`}
            >
              {!analyzing && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  id="Layer_1"
                  data-name="Layer 1"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  version="1.1"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  xmlns:svgjs="http://svgjs.dev/svgjs"
                >
                  <g width="100%" height="100%" transform="matrix(1,0,0,1,0,0)">
                    <path
                      d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z"
                      fill="#fffcfc"
                      fill-opacity="1"
                      data-original-color="#000000ff"
                      stroke="none"
                      stroke-opacity="1"
                    />
                  </g>
                </svg>
              )}
              {analyzing ? "Analyzing" : "Create with AI"}
              {analyzing && (
                <div className="mt-1.5x flex gap-1 animate-analyzing">
                  <div className="w-1 h-1 bg-white rounded-full animate-typing [animation-delay:-1s]"></div>
                  <div className="w-1 h-1 bg-white rounded-full animate-typing [animation-delay:-0.3s]"></div>
                  <div className="w-1 h-1 bg-white rounded-full animate-typing [animation-delay:0.4s]"></div>
                </div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCreateWithAI(false);
                setAnalyzing(false);
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
              onClick={() => chartToPDF()}
            >
              <FontAwesomeIcon icon={faChartLine} />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 flex items-center gap-4 mb-4 font-medium">
        <label htmlFor="xAxis">X-Axis: </label>
        <div className="flex">
          <select
            className="relative flex border-4 border-slate-200 rounded-md cursor-pointer"
            id="xAxis"
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
              id="timePeriod"
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
            <label htmlFor="yAxis">Y-Axis: </label>
            <select
              className="relative flex border-4 border-slate-200 rounded-md cursor-pointer"
              id="yAxis"
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
