import React, { useEffect, useRef, useState, useCallback, act } from "react";
import axios from "axios";
import BarsChart from "./BarsChart";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faImage,
  faLightbulb,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useGenerateImage } from "recharts-to-png";
import FileSaver from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import PiesChart from "./PiesChart";

const Chart = ({
  title,
  data,
  setData,
  formattedData,
  setFormattedData,
  timeData,
  setTimeData,
  dataTypes,
  columns,
  formattedColumns,
  sort,
  xAxisKey,
  setXAxisKey,
  yAxisKey,
  setYAxisKey,
  operation,
  setOperation,
  timePeriod,
  setTimePeriod,
  groupings,
}) => {
  let initialData = [];
  const [chartType, setChartType] = useState("Bar");
  const [periods, setPeriods] = useState("Monthly");
  const [createWithAI, setCreateWithAI] = useState(false);
  const [suggestion, setSuggestion] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [total, setTotal] = useState(0);
  const [average, setAverage] = useState(0);
  const [xAxisMenu, setXAxisMenu] = useState(false);
  const [trendLine, setTrendLine] = useState(false);
  const chartTypes = ["Bar", "Pie"];
  const operations = ["Total", "Average", "Min", "Max", "Count"];
  const timePeriods = ["Daily", "Monthly", "Quarterly", "Yearly"];
  const [getPng, { ref }] = useGenerateImage({
    quality: 0.8,
    type: "image/jpg",
  });
  const createWithAIRef = useRef(null);

  useEffect(() => {
    if (data && data.length > 0) {
      if (!sort) initializeKeys(data[0]);
      if (dataTypes !== undefined) formatData();
    }
  }, []);

  useEffect(() => {
    if (dataTypes !== undefined) {
      if (data.length === 0) {
        setData([{ [xAxisKey]: xAxisKey, [yAxisKey]: "0" }]);
      } else {
        formatData();
        handleTimePeriod();
      }
    }
  }, [data]);

  useEffect(() => {
    formatData();
    handleTimePeriod();
  }, [xAxisKey, yAxisKey, operation]);

  useEffect(() => {
    formatData();
    groupByTimePeriod(initialData, xAxisKey[0], periods);
  }, [periods]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload !== undefined && payload[0] !== undefined) {
      return (
        <div className="px-2 py-1.5 bg-white border border-slate-400">
          <p className="font-bold">
            {payload[0].payload[xAxisKey[0]] +
              (payload[0].payload[xAxisKey[1]] !== undefined
                ? " - " + payload[0].payload[xAxisKey[1]]
                : "")}
          </p>
          <div className="flex gap-1">
            <p className="font-normal">{payload[0].name}: </p>
            <p className="font-medium">
              {new Intl.NumberFormat("en-US", {
                compactDisplay: "short",
              }).format(payload[0].payload[yAxisKey])}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleTimePeriod = () => {
    if (dataTypes[xAxisKey[0]] === "date") {
      setTimePeriod(true);
      groupByTimePeriod(initialData, xAxisKey[0], periods);
    } else if (dataTypes[xAxisKey[1]] === "date") {
      setTimePeriod(true);
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
    if (xAxisKey.length === 1) {
      if (operation === "Total") {
        newData = groupByProperty(formattedData, xAxisKey[0]);
      } else if (operation === "Average") {
        newData = averageByProperty(formattedData, xAxisKey[0], yAxisKey);
      } else if (operation === "Min") {
        newData = minByProperty(formattedData, xAxisKey[0], yAxisKey);
      } else if (operation === "Max") {
        newData = maxByProperty(formattedData, xAxisKey[0], yAxisKey);
      } else {
        newData = countByProperty(formattedData, xAxisKey[0]);
      }
    } else {
      newData = groupByProperties(formattedData, xAxisKey);
    }
    if (initialData.length === 0) {
      initialData = newData;
    }
    calculateTotalAverage(formattedData);
    setFormattedData(newData);
    if (dataTypes[xAxisKey[0]] === "date") {
      setTimeData(newData);
    }
  };

  const initializeKeys = (data) => {
    const keys = Object.keys(data);
    if (keys.length >= 2) {
      const xKey = keys.find((key) => dataTypes[key] !== "number");
      const yKey = keys.find((key) => dataTypes[key] === "number");
      if (!xAxisKey.includes(xKey) && xAxisKey.length === 0)
        setXAxisKey([...[], xKey]);
      setYAxisKey(yKey);
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

  const groupByProperties = (arr, props) => {
    const groupBy = groupings[periods];
    let groupedData = arr.reduce((acc, item) => {
      const compositeKey = props
        .map((prop) => {
          if (dataTypes[prop] === "string") return item[prop];
          return groupBy(item[prop]);
        })
        .join("||");
      let existingGroup = acc.find((group) => group.groupKey === compositeKey);
      if (existingGroup) {
        existingGroup[yAxisKey] += item[yAxisKey];
        existingGroup.count += 1;
      } else {
        const newGroup = {
          groupKey: compositeKey,
          ...Object.fromEntries(
            props.map((key) => [
              key,
              dataTypes[key] === "string" ? item[key] : groupBy(item[key]),
            ])
          ),
          [yAxisKey]: item[yAxisKey],
          count: 1,
        };
        acc.push(newGroup);
      }
      return acc;
    }, []);
    groupedData.forEach((row) => delete row.groupKey);
    if (operation === "Average") {
      groupedData.forEach((row) => {
        row[yAxisKey] /= row.count;
        delete row.count;
      });
    }
    [...props].reverse().forEach((prop) => {
      if (dataTypes[prop] === "string") {
        groupedData.sort((a, b) => {
          if (a[prop] < b[prop]) return -1;
          else if (a[prop] > b[prop]) return 1;
          return 0;
        });
      } else {
        const prop = props.find((prop) => dataTypes[prop] === "date");
        switch (periods) {
          case "Daily":
            groupedData.sort(
              (a, b) =>
                new Date(a[prop]).getTime() - new Date(b[prop]).getTime()
            );
            break;
          case "Monthly":
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
            groupedData.sort(
              (a, b) =>
                monthOrder.indexOf(a[prop]) - monthOrder.indexOf(b[prop])
            );
            break;
          case "Quarterly":
            const quarterOrder = ["Q1", "Q2", "Q3", "Q4"];
            groupedData.sort(
              (a, b) =>
                quarterOrder.indexOf(a[prop]) - quarterOrder.indexOf(b[prop])
            );
            break;
          case "Yearly":
            groupedData.sort((a, b) => a[prop] - b[prop]);
            break;
        }
      }
    });
    return groupedData;
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

  const minByProperty = (data, xAxisKey, yAxisKey) => {
    const minData = data.reduce((acc, item) => {
      const key = item[xAxisKey];
      const existingGroup = acc.find((group) => group[xAxisKey] === key);
      if (existingGroup) {
        existingGroup[yAxisKey] = Math.min(
          existingGroup[yAxisKey],
          item[yAxisKey]
        );
      } else {
        acc.push({ [xAxisKey]: key, [yAxisKey]: item[yAxisKey] });
      }
      return acc;
    }, []);
    return minData;
  };

  const maxByProperty = (data, xAxisKey, yAxisKey) => {
    return data.reduce((acc, item) => {
      const key = item[xAxisKey];
      const existingGroup = acc.find((group) => group[xAxisKey] === key);
      if (existingGroup) {
        existingGroup[yAxisKey] = Math.max(
          existingGroup[yAxisKey],
          item[yAxisKey]
        );
      } else {
        acc.push({ [xAxisKey]: key, [yAxisKey]: item[yAxisKey] });
      }
      return acc;
    }, []);
  };

  const countByProperty = (data, xAxisKey) => {
    return data.reduce((acc, item) => {
      const key = item[xAxisKey];
      const existingGroup = acc.find((group) => group[xAxisKey] === key);
      if (existingGroup) {
        existingGroup[yAxisKey] += 1;
      } else {
        acc.push({ [xAxisKey]: key, [yAxisKey]: 1 });
      }
      return acc;
    }, []);
  };

  const calculateTotalAverage = (data) => {
    let total = 0,
      average = 0;
    [...data].forEach((row) => {
      if (row[yAxisKey] !== undefined) {
        total += parseFloat(row[yAxisKey]);
        average += parseFloat(row[yAxisKey]);
      }
    });
    average /= data.length;
    setTotal(total.toFixed(2));
    setAverage(average.toFixed(2));
  };

  const groupByTimePeriod = (data, prop, period) => {
    const groupBy = groupings[period];
    let groupedData = data.reduce((acc, item) => {
      const date = new Date(item[prop]);
      const key = groupBy(date);
      const newValue = { ...item };
      const existing = acc.find((val) => val[prop] === key);
      if (existing) {
        existing[yAxisKey] += item[yAxisKey];
        existing.count += 1;
      } else {
        newValue[prop] = key;
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
      groupedData = sortAndCompleteMonths(groupedData, prop);
    } else if (period === "Quarterly") {
      groupedData = sortAndCompleteQuarters(groupedData, prop);
    } else if (period === "Yearly") {
      groupedData = sortAndCompleteYears(groupedData, prop);
    } else {
      groupedData.sort(
        (a, b) => new Date(a[prop]).getTime() - new Date(b[prop]).getTime()
      );
    }
    groupedData.forEach((item) => delete item.count);
    calculateTotalAverage(groupedData);
    setTimeData(groupedData);
    return groupedData;
  };

  const sortAndCompleteMonths = (months, prop) => {
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
    const monthSet = new Set(months[prop]);
    monthOrder.forEach((month) => {
      let mon = months.find((m) => m[prop] === month);
      monthSet.add({
        ...mon,
        [prop]: month,
        [yAxisKey]: mon === undefined ? 0 : mon[yAxisKey],
      });
    });
    return Array.from(monthSet).sort(
      (a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b)
    );
  };

  const sortAndCompleteQuarters = (data, prop) => {
    const quarterOrder = ["Q1", "Q2", "Q3", "Q4"];
    const quarters = new Set(data[prop]);
    quarterOrder.forEach((quarter) => {
      let q = data.find((m) => m[prop] === quarter);
      quarters.add({
        [prop]: quarter,
        [yAxisKey]: q === undefined ? 0 : q[yAxisKey],
      });
    });
    return Array.from(quarters).sort(
      (a, b) => quarterOrder.indexOf(a) - quarterOrder.indexOf(b)
    );
  };

  const sortAndCompleteYears = (data, prop) => {
    const minYear = Math.min(...data.map((item) => item[prop]));
    const maxYear = Math.max(...data.map((item) => item[prop]));
    const years = new Set(data[prop]);
    for (let i = minYear; i <= maxYear; i++) {
      let y = data.find((y) => y[prop] == i);
      years.add({
        [prop]: i,
        [yAxisKey]: y === undefined ? 0 : y[yAxisKey],
      });
    }
    return Array.from(years).sort((a, b) => a[prop] - b[prop]);
  };

  const analyzePrompt = async (prompt) => {
    createWithAIRef.current.blur();
    setCreateWithAI(false);
    setSuggestion(false);
    setPrompt("");
    setAnalyzing(true);
    let words, actions, entities;
    await axios
      .post("http://127.0.0.1:5000/create", {
        prompt,
      })
      .then((res) => {
        words = res.data.words.map((word) => word.word);
      });
    let chartType, xAxis, yAxis, operation, timePeriod;
    words.forEach((word) => {
      chartTypes.forEach((type) => {
        if (word === type.toLowerCase()) chartType = type;
      });
      operations.forEach((op) => {
        if (word === op.toLowerCase()) operation = op;
      });
      for (let i = 0; i < formattedColumns.length; i++) {
        const col = formattedColumns[i];
        const colWords = col.split(" ");
        const matchesAll = colWords.every((w) => words.join(" ").includes(w));
        if (dataTypes[columns[i]] === "number") {
          if (matchesAll) {
            yAxis = columns[i];
            break;
          } else {
            yAxis = columns[i];
          }
        }
      }
      for (let i = 0; i < formattedColumns.length; i++) {
        const col = formattedColumns[i];
        const colWords = col.split(" ");
        const matchesAll = colWords.every((w) => words.join(" ").includes(w));
        if (dataTypes[columns[i]] !== "number") {
          if (matchesAll) {
            xAxis = columns[i];
            break;
          }
        }
      }
      for (const [index, period] of [
        "day",
        "month",
        "quarter",
        "year",
      ].entries()) {
        if (word === period || word.includes(period)) {
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
      if (xAxis !== undefined) {
        setXAxisKey([...[], xAxis]);
      }
      if (timePeriod !== undefined) setPeriods(timePeriod);
      setAnalyzing(false);
    }, 300);
  };

  const createSuggestion = () => {
    let suggestions = [];
    const months = ["daily", "monthly", "quarterly", "yearly"];
    let yAxis = columns.filter((col) => dataTypes[col] === "number");
    let yAxis1 = yAxis[Math.floor(Math.random() * yAxis.length)];
    let yAxis2 = yAxis[Math.floor(Math.random() * yAxis.length)];
    let suggestion = `Create a bar chart with the average ${yAxis1.toLowerCase()} `;
    let instance = Object.entries(dataTypes).find(
      ([key, val]) => val === "date"
    );
    if (instance !== undefined) {
      suggestion += "on a " + months[Math.floor(Math.random() * 4)] + " basis";
      suggestions.push(suggestion);
    }
    const stringKey = Object.entries(dataTypes).find(
      ([key, val]) => val === "string"
    );
    if (stringKey !== undefined) {
      suggestion = `Visualize the relationship between the total ${yAxis2.toLowerCase()} across ${stringKey[0].toLowerCase()}`;
      suggestions.push(suggestion);
    }
    return suggestions;
  };

  const chartToImage = useCallback(async () => {
    const png = await getPng();
    if (png) {
      FileSaver.saveAs(png, `${title}.jpg`);
    }
  }, [getPng]);

  const chartToPDF = () => {
    const pdf = new jsPDF();
    let tableData = [];
    if (timePeriod && xAxisKey.length === 1) {
      timeData.forEach((column) => {
        tableData.push([
          column[xAxisKey[0]],
          new Intl.NumberFormat("en-US", {
            compactDisplay: "short",
            minimumFractionDigits: column[yAxisKey] % 1 === 0 ? 0 : 2,
          }).format(column[yAxisKey]),
        ]);
      });
    } else if (xAxisKey.length === 1) {
      formattedData.forEach((column) => {
        tableData.push([
          column[xAxisKey[0]],
          new Intl.NumberFormat("en-US", {
            compactDisplay: "short",
            minimumFractionDigits: column[yAxisKey] % 1 === 0 ? 0 : 2,
          }).format(column[yAxisKey]),
        ]);
      });
    } else {
      const totals = formattedData.reduce((totals, item) => {
        const xKey = item[xAxisKey[0]];
        const yKey = item[yAxisKey];
        if (!totals[xKey]) {
          totals[xKey] = 0;
        }
        totals[xKey] += yKey;
        return totals;
      }, {});
      formattedData.forEach((column) => {
        if (!tableData.some((row) => row.includes(column[xAxisKey[0]]))) {
          tableData.push([
            column[xAxisKey[0]],
            new Intl.NumberFormat("en-US", {
              compactDisplay: "short",
              minimumFractionDigits:
                totals[column[xAxisKey[0]]] % 1 === 0 ? 0 : 2,
            }).format(totals[column[xAxisKey[0]]]),
          ]);
        }
        tableData.push([
          column[xAxisKey[1]],
          new Intl.NumberFormat("en-US", {
            compactDisplay: "short",
            minimumFractionDigits: column[yAxisKey] % 1 === 0 ? 0 : 2,
          }).format(column[yAxisKey]),
        ]);
      });
    }
    const totalValue = formattedData.reduce((total, item) => {
      return total + (item[yAxisKey] || 0);
    }, 0);
    console.log(totalValue);
    tableData.push([
      "Total",
      new Intl.NumberFormat("en-US", {
        compactDisplay: "short",
        minimumFractionDigits: 2,
      }).format(totalValue),
    ]);
    tableData.push([
      "Average",
      new Intl.NumberFormat("en-US", {
        compactDisplay: "short",
        minimumFractionDigits: 2,
      }).format((totalValue / (tableData.length - 1)).toFixed(2)),
    ]);
    const headers = ["Column", `${operation} of ${yAxisKey}`];
    const pageWidth = pdf.internal.pageSize.width;
    const tableWidth = pageWidth * 0.4;

    pdf.autoTable({
      head: [headers],
      body: tableData,
      startY: 20,
      margin: { left: (pageWidth - tableWidth) / 2 },
      theme: "grid",
      tableWidth: "wrap",
      didParseCell: (data) => {
        data.cell.styles.halign = "right";
        data.cell.styles.cellPadding = {
          top: 1.5,
          bottom: 1.5,
          left: 5,
          right: 2,
        };
        if (formattedData.some((row) => row[xAxisKey[0]] === data.row.raw[0])) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [200, 200, 230];
        }
        if (data.row.index >= tableData.length - 2) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [216, 221, 230];
        }
        if (data.column.index === headers.length - 1) {
          const cellValue = data.row.raw[1];
          if (!cellValue.toString().includes(".")) {
            data.cell.styles.cellPadding.right = 7;
          }
        }
      },
    });
    const pdfBlob = pdf.output("blob");
    FileSaver.saveAs(pdfBlob, `${title}.pdf`);
  };

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
            className={`relative w-70 ${
              createWithAI
                ? suggestion
                  ? "items-start h-9"
                  : "items-start h-19"
                : "h-9 items-center cursor-pointer"
            } flex justify-center rounded-md  duration-300`}
            onClick={() => {
              if (!createWithAI) {
                setCreateWithAI(true);
                setSuggestion(true);
                createWithAIRef.current.focus();
              }
            }}
          >
            <textarea
              name="prompt"
              className={`h-full w-full relative resize-none text-start px-3 py-2 flex items-center align-top gap-2 text-sm text-white font-medium rounded-md outline-none overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 duration-300 animate-slideDown ${
                createWithAI
                  ? "from-violet-700 to-indigo-700 outline-1 outline-slate-400"
                  : "cursor-pointer rounded-md"
              } [animation-fill-mode:backwards] caret-white placeholder:text-slate-300`}
              value={createWithAI ? prompt : ""}
              ref={createWithAIRef}
              placeholder={createWithAI && "Write your prompt..."}
              onChange={(e) => {
                const val = e.target.value;
                setPrompt(val);
                if (val !== "") setSuggestion(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  analyzePrompt(prompt);
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
                setSuggestion(false);
                setPrompt("");
                setAnalyzing(false);
                createWithAIRef.current.blur();
              }}
              className={`absolute top-1 right-1 w-4 h-4 p-1 flex items-center justify-center rounded-full bg-white ${
                createWithAI ? "z-99 opacity-80" : "-z-99 opacity-0"
              }`}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
            {/* <button
              className="h-full w-full z-99 absolute top-10 px-3 py-2 flex justify-center gap-2 text-sm text-white font-medium rounded-md outline-none bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 duration-300 animate-slideDown [animation-fill-mode:backwards] caret-white cursor-pointer"
              onClick={() =>
                filterSuggestion(timePeriod ? timeData : formattedData)
              }
            >
              Or Search / Filter
            </button> */}
            {createWithAI && suggestion && (
              <div className="absolute top-10 bg-black z-99 flex flex-col gap-1 outline outline-2 outline-black rounded-md overflow-hidden">
                <p className="px-3 py-1 z-99 text-white text-sm font-medium animate-slideIn flex items-center gap-1 [animation-fill-mode:backwards]">
                  <FontAwesomeIcon icon={faLightbulb} />
                  Suggestions
                </p>
                {createSuggestion().map((suggestion, index) => {
                  return (
                    <div
                      key={index}
                      className="px-3 py-2 bg-[#2b364b] hover:bg-black duration-150  text-white cursor-pointer text-sm z-99 font-medium animate-slideIn [animation-fill-mode:backwards]"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => {
                        setPrompt(suggestion);
                        setSuggestion(false);
                        analyzePrompt(suggestion);
                      }}
                    >
                      {suggestion}
                    </div>
                  );
                })}
              </div>
            )}
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
              className="px-3 py-2 flex items-center gap-2 z-99 text-sm rounded-md bg-slate-700 hover:bg-slate-800 text-white font-medium duration-200 animate-slideDown [animation-fill-mode:backwards]"
              style={{ animationDelay: "0.3s" }}
              onClick={() => chartToPDF()}
            >
              <FontAwesomeIcon icon={faChartLine} />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      <div className="relative max-h-9 px-6 flex items-center gap-4 mb-4 font-medium">
        <label htmlFor="xAxis">X-Axis: </label>
        <div className="relative max-h-9 flex">
          {chartType === "Bar" ? (
            <div
              className={`relative z-50 bg-white  hover:h-full overflow-clip flex flex-col gap-1 px-2 py-0.5 border-4 border-slate-200 rounded-md cursor-pointer transition-height duration-200`}
              id="xAxis"
              onMouseEnter={() => setXAxisMenu(true)}
              onMouseLeave={() => setXAxisMenu(false)}
              style={{
                height: xAxisMenu
                  ? "100%"
                  : `${
                      xAxisKey.length * 24 + (xAxisKey.length - 1) * 4 + 12
                    }px`,
              }}
            >
              {xAxisKey.map((key) => {
                if (dataTypes[key] !== "number")
                  return (
                    <label
                      key={key}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="form-checkbox rounded text-blue-600 focus:ring-blue-500 focus:ring-2"
                        checked={xAxisKey.includes(key)}
                        onChange={() => {
                          if (xAxisKey.includes(key)) {
                            setXAxisKey(xAxisKey.filter((k) => k !== key));
                          } else setXAxisKey([...xAxisKey, key]);
                        }}
                      />
                      <span className="text-slate-800">{key}</span>
                    </label>
                  );
              })}
              {Object.keys(data[0] || {}).map((key) => {
                if (dataTypes[key] !== "number" && !xAxisKey.includes(key))
                  return (
                    <label
                      key={key}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="form-checkbox rounded text-blue-600 focus:ring-blue-500 focus:ring-2"
                        checked={xAxisKey.includes(key)}
                        onChange={() => {
                          if (xAxisKey.includes(key)) {
                            setXAxisKey(xAxisKey.filter((k) => k !== key));
                          } else setXAxisKey([...xAxisKey, key]);
                        }}
                      />
                      <span className="text-slate-800">{key}</span>
                    </label>
                  );
              })}
            </div>
          ) : (
            <select
              className="relative flex border-4 border-slate-200 rounded-md cursor-pointer"
              id="xAxis"
              onChange={(e) => setXAxisKey([...[], e.target.value])}
              value={xAxisKey[0]}
            >
              {Object.keys(data[0] || {}).map((key) => {
                if (dataTypes[key] !== "number")
                  return (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  );
              })}
            </select>
          )}
          {timePeriod && (
            <select
              className={`relative ${
                xAxisKey.length > 1 &&
                dataTypes[xAxisKey[1]] === "date" &&
                "top-7"
              } flex border-4 border-slate-200 rounded-md cursor-pointer`}
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
          CustomTooltip={CustomTooltip}
        />
      )}

      {chartType === "Pie" && (
        <PiesChart
          data={data}
          timePeriod={timePeriod}
          timeData={timeData}
          formattedData={formattedData}
          xAxisKey={xAxisKey}
          yAxisKey={yAxisKey}
          operation={operation}
          total={total}
          average={average}
          chartRef={ref}
          CustomTooltip={CustomTooltip}
        />
      )}
    </div>
  );
};

export default Chart;
