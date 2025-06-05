import React, { useEffect, useState } from "react";
import { historyStorage } from "../storage/storageInstance";
import { WordAttempt } from "../types/history";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Helper to group attempts by minute and compute wrong percentage
function computeWrongPercentages(attempts: WordAttempt[]) {
  if (attempts.length === 0) return [];

  // Sort attempts by timestamp
  const sorted = [...attempts].sort((a, b) => a.timestamp - b.timestamp);

  // Group by minute
  const buckets: { [minute: number]: { total: number; wrong: number } } = {};
  sorted.forEach((a) => {
    const minute = Math.floor(a.timestamp / 60000);
    if (!buckets[minute]) buckets[minute] = { total: 0, wrong: 0 };
    buckets[minute].total += 1;
    if (!a.isCorrect) buckets[minute].wrong += 1;
  });

  // Convert to array of { minute, percent }
  const result = Object.entries(buckets).map(([minute, { total, wrong }]) => ({
    minute: Number(minute),
    percent: total > 0 ? (wrong / total) * 100 : 0,
    total,
    wrong,
  }));

  // Sort by minute
  result.sort((a, b) => a.minute - b.minute);

  return result;
}

export default function WrongAttemptsPlot() {
  const [data, setData] = useState<
    { minute: number; percent: number; total: number; wrong: number }[]
  >([]);

  useEffect(() => {
    async function fetchData() {
      const attempts = await historyStorage.getAllAttempts();
      setData(computeWrongPercentages(attempts));
    }
    fetchData();
  }, []);

  if (data.length === 0) {
    return <div>No attempt data available.</div>;
  }

  // Prepare data for Recharts: label x-axis as "Start", "1m", "2m", etc.
  const minMinute = data[0].minute;
  const rechartsData = data.map((d, i) => ({
    ...d,
    label: i === 0 ? "Start" : `${i}m`,
  }));

  return (
    <div style={{ width: "100%", maxWidth: 600, margin: "0 auto" }}>
      <h3>Wrong Attempts Percentage per Minute</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={rechartsData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <Tooltip formatter={(value: any, name: string, props: any) => {
            if (name === "percent") {
              return [`${value.toFixed(1)}%`, "Wrong %"];
            }
            if (name === "wrong") {
              return [value, "Wrong"];
            }
            if (name === "total") {
              return [value, "Total"];
            }
            return [value, name];
          }} />
          <Legend />
          <Line
            type="monotone"
            dataKey="percent"
            name="Wrong %"
            stroke="#e74c3c"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
        Each point shows the percentage of wrong attempts for that minute.
      </div>
    </div>
  );
}

export {}
