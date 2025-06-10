import React, { useEffect, useState } from "react";
import { storageInstance } from "../storage/storageInstance";
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

type Interval = "minute" | "day" | "week" | "month";

function groupAttemptsByInterval(attempts: WordAttempt[], interval: Interval) {
  if (attempts.length === 0) return [];

  // Sort attempts by timestamp
  const sorted = [...attempts].sort((a, b) => a.timestamp - b.timestamp);

  // Helper to get bucket key and label
  function getBucketInfo(ts: number) {
    const date = new Date(ts);
    switch (interval) {
      case "minute":
        // YYYY-MM-DD HH:MM
        return {
          key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`,
          label: `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`,
        };
      case "day":
        // YYYY-MM-DD
        return {
          key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
          label: `${date.getMonth() + 1}/${date.getDate()}`,
        };
      case "week": {
        // YYYY-WW
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        // Calculate week number
        const days = Math.floor((date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000));
        const week = Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);
        return {
          key: `${date.getFullYear()}-W${week}`,
          label: `W${week}`,
        };
      }
      case "month":
        // YYYY-MM
        return {
          key: `${date.getFullYear()}-${date.getMonth()}`,
          label: `${date.getFullYear()}/${date.getMonth() + 1}`,
        };
      default:
        return { key: "", label: "" };
    }
  }

  // Group by interval
  const buckets: { [bucket: string]: { total: number; wrong: number; label: string; firstTs: number } } = {};
  sorted.forEach((a) => {
    const { key, label } = getBucketInfo(a.timestamp);
    if (!buckets[key]) buckets[key] = { total: 0, wrong: 0, label, firstTs: a.timestamp };
    buckets[key].total += 1;
    if (!a.isCorrect) buckets[key].wrong += 1;
    // For sorting: keep earliest timestamp in bucket
    if (a.timestamp < buckets[key].firstTs) buckets[key].firstTs = a.timestamp;
  });

  // Convert to array of { label, percent, total, wrong }
  const result = Object.entries(buckets).map(([key, { total, wrong, label, firstTs }]) => ({
    key,
    label,
    percent: total > 0 ? (wrong / total) * 100 : 0,
    total,
    wrong,
    firstTs,
  }));

  // Sort by first timestamp in bucket
  result.sort((a, b) => a.firstTs - b.firstTs);

  return result;
}

export default function WrongAttemptsPlot() {
  const [interval, setInterval] = useState<Interval>("minute");
  const [data, setData] = useState<
    { key: string; label: string; percent: number; total: number; wrong: number; firstTs: number }[]
  >([]);

  useEffect(() => {
    async function fetchData() {
      const attempts = await storageInstance.getAllAttempts();
      setData(groupAttemptsByInterval(attempts, interval));
    }
    fetchData();
  }, [interval]);

  if (data.length === 0) {
    return <div>No attempt data available.</div>;
  }

  return (
    <div style={{ width: "100%", maxWidth: 600, margin: "0 auto" }}>
      <h3>Wrong Attempts Percentage per {interval.charAt(0).toUpperCase() + interval.slice(1)}</h3>
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 13, marginRight: 8 }}>Interval:</span>
        {(["minute", "day", "week", "month"] as Interval[]).map((intv) => (
          <button
            key={intv}
            onClick={() => setInterval(intv)}
            style={{
              marginRight: 6,
              padding: "3px 10px",
              borderRadius: 4,
              border: intv === interval ? "2px solid #e74c3c" : "1px solid #ccc",
              background: intv === interval ? "#fbeaea" : "#fff",
              color: intv === interval ? "#e74c3c" : "#333",
              fontWeight: intv === interval ? "bold" : "normal",
              cursor: "pointer",
            }}
          >
            {intv.charAt(0).toUpperCase() + intv.slice(1)}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
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
        Each point shows the percentage of wrong attempts for that {interval}.
      </div>
    </div>
  );
}

export {}
