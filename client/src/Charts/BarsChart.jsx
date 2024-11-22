import React, { useEffect, useState } from "react";
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
  LabelList,
} from "recharts";
import { createTrend } from "trendline";

const BarsChart = ({
  data,
  timePeriod,
  timeData,
  formattedData,
  dataTypes,
  xAxisKey,
  yAxisKey,
  operation,
  total,
  average,
  chartRef,
  CustomTooltip,
}) => {
  const colors = [
    "#003f5c",
    "#ffa600",
    "#2f4b7c",
    "#ff7c43",
    "#665191",
    "#f95d6a",
    "#a05195",
    "#d45087",
    "#003f5c",
    "#2f4b7c",
    "#a05195",
    "#665191",
  ];

  let widths = {};
  let totalItems = 0;

  const countEntriesByXAxis = (data, xAxisKey) => {
    const indices = {};
    data.forEach((item, index) => {
      const key = item[xAxisKey];
      if (!(key in indices)) {
        indices[key] = { startIndex: index, endIndex: index };
      } else {
        indices[key].endIndex = index;
      }
    });
    return indices;
  };
  // if (xAxisKey.length > 1) {
  //   widths = countEntriesByXAxis(formattedData, xAxisKey[0]);
  // }

  const getColorByXAxisValue = (xAxisValue) => {
    const xAxisValues = [
      ...new Set([...formattedData].map((item) => item[xAxisKey[0]])),
    ];
    const colorMap = new Map(
      xAxisValues.map((value, index) => [value, colors[index % colors.length]])
    );
    return colorMap.get(xAxisValue) || "#000000";
  };

  const CustomTick = ({ x, y, payload }) => {
    const width = widths[payload.value] || 100;

    return (
      <g transform={`translate(${x + width / 2 - 50},${y})`}>
        <text
          x={0}
          y={10}
          dy={16}
          textAnchor="middle"
          fill="#333"
          style={{ fontSize: "14px", fontWeight: "bold" }}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <ResponsiveContainer
      className="p-2 relative"
      width="100%"
      height={450}
      ref={chartRef}
    >
      <ComposedChart
        data={timePeriod && xAxisKey.length === 1 ? timeData : formattedData}
        margin={{
          top: 20,
          right: 29,
          left: 25,
          bottom: xAxisKey.length === 1 ? 20 : 30,
        }}
      >
        <CartesianGrid strokeDasharray="4 4" />
        <XAxis
          xAxisId={0}
          dataKey={xAxisKey.length > 1 ? xAxisKey[1] : xAxisKey[0]}
          className="font-medium relative text-sm"
          angle={-45}
          textAnchor="end"
          height={60}
        >
          <Label
            value={`${xAxisKey[0]} ${
              xAxisKey[1] !== undefined ? "- " + xAxisKey[1] : ""
            }`}
            offset={xAxisKey.length === 1 ? 5 : 40}
            position={"bottom"}
            className="text-black text-lg"
          />
        </XAxis>
        {xAxisKey.length > 1 && (
          <XAxis
            xAxisId={1}
            dataKey={xAxisKey[0]}
            className="w-full font-medium text-base"
            textAnchor="end"
            height={30}
            axisLine={false}
            tickLine={false}
            orientation={"bottom"}
            // tick={xAxisKey.length > 1 && <CustomTick />}
            allowDuplicatedCategory={false}
          />
        )}
        <YAxis
          className="font-medium"
          tickFormatter={(value) =>
            new Intl.NumberFormat("en-US", {
              notation: parseInt(value) >= 10000 ? "compact" : "standard",
              compactDisplay: "short",
            }).format(value)
          }
          tickCount={6}
        >
          <Label
            value={yAxisKey}
            angle={-90}
            offset={15}
            position={"left"}
            className="text-black text-lg"
          />
        </YAxis>
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey={yAxisKey}>
          {formattedData.map((entry, index) => {
            let color = "";
            if (xAxisKey.length > 1) {
              color = getColorByXAxisValue(entry[xAxisKey[0]]);
            }
            return (
              <Cell
                key={`cell-${index}`}
                fill={
                  xAxisKey.length === 1 ? colors[index % colors.length] : color
                }
              />
            );
          })}
        </Bar>
      </ComposedChart>
      {(operation === "Total" || operation === "Average") && (
        <div className="absolute px-2 py-1 top-7 right-9 bg-white border border-slate-400 font-medium">{`${operation}: ${
          operation === "Total"
            ? new Intl.NumberFormat("en-US", {
                compactDisplay: "short",
                minimumFractionDigits: 2,
              }).format(total)
            : new Intl.NumberFormat("en-US", {
                compactDisplay: "short",
                minimumFractionDigits: 2,
              }).format(average)
        }`}</div>
      )}
    </ResponsiveContainer>
  );
};

export default BarsChart;
