import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const Chart = ({ data }) => {
  const xAxisKey = Object.keys(data[0])[0];
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

  data = data.map((item) => {
    const amount = parseFloat(item.Amount.replace(/[$,]/g, ""));

    const deliveryDate = new Date(item["Delivery Date"]);

    return {
      ...item,
      Amount: amount,
      "Delivery Date": isNaN(deliveryDate.getTime())
        ? item["Delivery Date"]
        : deliveryDate,
    };
  });

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
