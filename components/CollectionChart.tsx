"use client";

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { day: "Mon", amount: 400 },
  { day: "Tue", amount: 200 },
  { day: "Wed", amount: 250 },
  { day: "Thu", amount: 500 },
  { day: "Fri", amount: 550 },
  { day: "Sat", amount: 180 },
  { day: "Sun", amount: 350 },
];

export default function CollectionChart() {
  return (
    <div className="bg-white p-6 rounded-xl border">
      <h3 className="font-semibold mb-4">Collection Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="day" />
          <Tooltip />
          <Bar dataKey="amount" fill="#22c55e" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}