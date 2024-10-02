import React, { useEffect, useState } from "react";
import OpenAI from "openai/index.mjs";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  ResponsiveContainer,
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
  //         apiKey: import.meta.env.VITE_OPEN_AI_KEY,
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

  const formatData = () => {
    setFormattedData(
      data.map((row) => {
        return {
          ...row,
          Amount: parseFloat(row.Amount.replace(/[^0-9.-]+/g, "")),
          "Delivery Date": isNaN(new Date(row["Delivery Date"]).getTime())
            ? row["Delivery Date"]
            : new Date(row["Delivery Date"]),
        };
      })
    );
  };

  useEffect(() => {
    formatData();
  }, []);

  return (
    <ResponsiveContainer className="p-2 relative" width="100%" height={450}>
      <BarChart
        data={formattedData}
        margin={{ top: 20, right: 30, left: 25, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="4 4" />
        <XAxis
          dataKey={xAxisKey}
          className="font-medium relative text-sm"
          angle={-45}
          textAnchor="end"
          height={60}
        >
          <Label
            value={xAxisKey}
            offset={5}
            position={"bottom"}
            className="text-black text-lg"
          />
        </XAxis>
        <YAxis className="font-medium">
          <Label
            value={barDataKey}
            angle={-90}
            offset={15}
            position={"left"}
            className="text-black text-lg"
          />
        </YAxis>
        <Tooltip />
        <Bar dataKey={barDataKey}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default Chart;
