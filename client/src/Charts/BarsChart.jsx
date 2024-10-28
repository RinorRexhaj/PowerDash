import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Label,
  Tooltip,
  Bar,
  ReferenceLine,
  Cell,
} from "recharts";
import { createTrend } from "trendline";

const BarsChart = ({
  data,
  timePeriod,
  timeData,
  formattedData,
  xAxisKey,
  yAxisKey,
  trendLine,
  dataTypes,
  chartRef,
  groupings,
  periods,
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

  const trendData = () => {
    const data = timePeriod ? [...timeData] : [...formattedData];
    const xKey = [...data].map((data) => data[xAxisKey]);
    const yKey = [...data].map((data) => data[yAxisKey]);
    let xMax, xMin;
    const dataType = dataTypes[xAxisKey];
    const yMax = Math.max(...yKey);
    const yMin = Math.min(...yKey);
    if (dataType === "number" || dataType === "date") {
      xMax = Math.max(...xKey);
      xMin = Math.min(...xKey);
      // if (dataType === "date") {
      //   xMax = groupings[periods](xMax);
      //   xMin = groupings[periods](xMin);
      // }
    } else if (dataType === "string") {
      xMax = xKey.reduce((max, c) => (c > max ? c : max));
      xMin = xKey.reduce((min, c) => (c < min ? c : min));
    }
    const trend = createTrend(data, xAxisKey, yAxisKey);

    const segment = [
      {
        x: xMin,
        y: Math.abs(trend.calcY(xMin)),
      },
      {
        x: xMax,
        y: Math.abs(trend.calcY(xMax)),
      },
    ];
    return segment;
  };

  return (
    <ResponsiveContainer className="p-2 relative" width="100%" height={450}>
      <ComposedChart
        data={timePeriod ? timeData : formattedData}
        margin={{ top: 20, right: 30, left: 25, bottom: 20 }}
        ref={chartRef}
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
            value={yAxisKey}
            angle={-90}
            offset={15}
            position={"left"}
            className="text-black text-lg"
          />
        </YAxis>
        <Tooltip />
        <Bar dataKey={yAxisKey}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
        {trendLine && (
          <ReferenceLine
            className={`${!trendLine ? "animate-fade" : "animate-fadeOut"}`}
            stroke="black"
            strokeWidth={7}
            strokeDasharray="7 7"
            segment={trendData()}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default BarsChart;
