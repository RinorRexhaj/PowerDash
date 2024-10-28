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
} from "recharts";
import env from "react-dotenv";

const Chart = ({ data }) => {
  const [dataTypes, setDataTypes] = useState(null);
  const [formattedData, setFormattedData] = useState([]);
  const xAxisKey = Object.keys(data[0])[1];
  const barDataKey = Object.keys(data[0])[5];

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
      <BarChart width={830} height={350} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} className="font-medium" />
        <YAxis className="font-medium" />
        <Tooltip />
        <Bar dataKey={barDataKey}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </div>
  );
};

export default Chart;
