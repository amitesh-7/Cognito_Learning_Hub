import React, { memo } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card } from "../ui/Card";
import { TrendingUp } from "lucide-react";

// Custom Tooltip for better UX
const CustomTooltip = memo(({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {payload[0].payload.quizTitle}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {payload[0].payload.date}
        </p>
        <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">
          {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
});

// Memoized Line Chart
const PerformanceLineChart = memo(({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
        <p>No performance data available yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
        <XAxis
          dataKey="name"
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: "12px" }}
          domain={[0, 100]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#8b5cf6"
          strokeWidth={3}
          dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 5 }}
          activeDot={{ r: 8 }}
          fill="url(#colorScore)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
});

// Memoized Pie Chart
const PerformancePieChart = memo(({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
        <p>No distribution data available yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
});

// Main Component
const PerformanceCharts = memo(({ chartData, performanceData }) => {
  return (
    <motion.div
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Performance Over Time */}
      <Card className="p-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 shadow-xl rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Performance Over Time
          </h3>
        </div>
        <PerformanceLineChart data={chartData} />
      </Card>

      {/* Performance Distribution */}
      <Card className="p-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 shadow-xl rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Score Distribution
          </h3>
        </div>
        <PerformancePieChart data={performanceData} />
      </Card>
    </motion.div>
  );
});

PerformanceCharts.displayName = "PerformanceCharts";
PerformanceLineChart.displayName = "PerformanceLineChart";
PerformancePieChart.displayName = "PerformancePieChart";
CustomTooltip.displayName = "CustomTooltip";

export default PerformanceCharts;
