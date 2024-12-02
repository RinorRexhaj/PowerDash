import React from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Label,
  Tooltip,
  Scatter,
  ReferenceLine,
} from "recharts";

const ScaterChart = ({ data, xAxisKey, yAxisKey, trendLine, chartRef }) => {
  return (
    <ResponsiveContainer
      className="p-2 relative"
      width="100%"
      height={450}
      ref={chartRef}
    >
      <ScatterChart
        data={data}
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
            value={yAxisKey}
            angle={-90}
            offset={15}
            position={"left"}
            className="text-black text-lg"
          />
        </YAxis>
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />

        {/* Scatter points */}
        <Scatter name="Scatter Data" data={data} fill="#8884d8" />

        {/* Optional: Add trend line */}
        {trendLine && (
          <ReferenceLine
            segment={[
              { x: data[0][xAxisKey], y: data[0][yAxisKey] },
              {
                x: data[data.length - 1][xAxisKey],
                y: data[data.length - 1][yAxisKey],
              },
            ]}
            stroke="red"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        )}
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default ScaterChart;
