import React from "react";
import { Cell, Tooltip, PieChart, Pie, ResponsiveContainer } from "recharts";

const PiesChart = ({
  timePeriod,
  timeData,
  formattedData,
  xAxisKey,
  yAxisKey,
  chartRef,
  operation,
  total,
  average,
  CustomTooltip,
}) => {
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
  const cellData = timePeriod ? [...timeData] : [...formattedData];
  return (
    <ResponsiveContainer
      className="w-full p-2 relative flex gap-1"
      width="100%"
      height={450}
      ref={chartRef}
    >
      <PieChart width={500} height={400} className=" max-w-230">
        <Pie
          data={timePeriod ? timeData : formattedData}
          dataKey={yAxisKey}
          nameKey={xAxisKey}
          cx="50%"
          cy="50%"
          outerRadius={150}
          label={(data) =>
            `${data[xAxisKey[0]]}: ${new Intl.NumberFormat("en-US", {
              compactDisplay: "short",
            }).format(data[yAxisKey])}`
          }
        >
          {cellData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
      <div className="max-h-100 flex flex-col flex-wrap gap-5">
        {cellData.map((d, index) => {
          const color = colors[index + 1];
          if (d.total <= 0) return;
          return (
            <div
              key={index}
              className="animate-slideDown [animation-fill-mode:backwards]"
              style={{ animationDelay: `${index * 0.05 + 0.4}s` }}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`min-w-5 h-2 text-sm`}
                  style={{
                    backgroundColor: color,
                  }}
                ></div>
                <p>
                  <b>{d[xAxisKey[0]]}:</b>
                </p>
              </div>
              <p className="font-medium text-sm">{d[yAxisKey]}</p>
            </div>
          );
        })}
        <div className="absolute px-2 py-1 right-15 bottom-8 bg-white border border-slate-400 font-medium">{`${operation}: ${
          operation === "Total" ? total : average
        }`}</div>
      </div>
    </ResponsiveContainer>
  );
};

export default PiesChart;
