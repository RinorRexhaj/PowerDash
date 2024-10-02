import React, { useEffect, useState } from "react";
import OpenAI from "openai/index.mjs";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  ScatterChart,
  Scatter,
  Pie,
  PieChart,
} from "recharts";
import env from "react-dotenv";

const Chart = ({ data }) => {
  const [chartType, setChartType] = useState("Bar");
  const [xAxisKey, setXAxisKey] = useState("");
  const [yAxisKey, setYAxisKey] = useState("");

  useEffect(() => {
    if (data && data.length > 0) {
      initializeKeys(data);
    }
  }, [data]);

  const initializeKeys = (data) => {
    const keys = Object.keys(data[0]);
    if (keys.length >= 2) {
      setXAxisKey(keys[0]);
      setYAxisKey(keys[1]);
    }
  };
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

  // const formatData = () => {
  //   setFormattedData(
  //     data.map((row) => {
  //       return {
  //         ...row,
  //         Amount: parseFloat(row.Amount.replace(/[^0-9.-]+/g, "")),
  //         "Delivery Date": isNaN(new Date(row["Delivery Date"]).getTime())
  //           ? row["Delivery Date"]
  //           : new Date(row["Delivery Date"]),
  //       };
  //     })
  //   );
  // };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <label>Choose Chart Type: </label>
        <select
          onChange={(e) => setChartType(e.target.value)}
          value={chartType}
        >
          <option value="Bar">Bar Chart</option>
          <option value="Pie">Pie Chart</option>
          <option value="Scatter">Scatter Chart</option>
        </select>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <label>X-Axis: </label>
        <select onChange={(e) => setXAxisKey(e.target.value)} value={xAxisKey}>
          {Object.keys(data[0] || {}).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>

        {chartType !== "Pie" && (
          <>
            <label>Y-Axis: </label>
            <select
              onChange={(e) => setYAxisKey(e.target.value)}
              value={yAxisKey}
            >
              {Object.keys(data[0] || {}).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {chartType === "Bar" && (
        <BarChart width={830} height={350} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisKey} className="font-medium" />
          <YAxis dataKey={yAxisKey} className="font-medium" />
          <Tooltip />
          <Bar dataKey={yAxisKey}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Bar>
        </BarChart>
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
