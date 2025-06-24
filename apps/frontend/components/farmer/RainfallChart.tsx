"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function RainfallChart({ data }: { data: { month: string; rainfall: number }[] }) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft' }} />
          <Tooltip 
            formatter={(value) => [`${value} mm`, 'Rainfall']}
            labelFormatter={(month) => `Month: ${month}`}
          />
          <Bar dataKey="rainfall" fill="#3B82F6" name="Rainfall" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}