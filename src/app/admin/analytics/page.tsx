"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PageHeader } from "@/components/admin/page-header";
import { StatsCard } from "@/components/admin/stats-card";
import { TrendingUp, ShoppingCart, Package, Users } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface StatsData {
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalUsers: number;
    thisMonthRevenue: number;
    revenueGrowth: number;
    thisMonthOrders: number;
  };
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
  ordersByStatus: { status: string; count: number }[];
  topProducts: { name: string; totalSold: number }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 animate-pulse rounded-xl bg-surface" />
          <div className="h-72 animate-pulse rounded-xl bg-surface" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Store performance overview"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Revenue This Month"
          value={formatPrice(data.stats.thisMonthRevenue)}
          icon={TrendingUp}
          change={data.stats.revenueGrowth}
          changeLabel="vs last month"
        />
        <StatsCard
          label="Orders This Month"
          value={data.stats.thisMonthOrders}
          icon={ShoppingCart}
          iconColor="text-blue"
          iconBg="bg-blue/10"
        />
        <StatsCard
          label="Total Products"
          value={data.stats.totalProducts}
          icon={Package}
          iconColor="text-green"
          iconBg="bg-green/10"
        />
        <StatsCard
          label="Total Customers"
          value={data.stats.totalUsers}
          icon={Users}
          iconColor="text-purple-400"
          iconBg="bg-purple-400/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue + Orders chart */}
        <div className="rounded-xl border border-white/8 bg-surface p-5">
          <h2 className="font-display text-base font-semibold mb-4">
            Revenue & Orders — Last 6 Months
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.monthlyRevenue}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#1a2234", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }}
                formatter={(v, name) => [name === "revenue" ? formatPrice(Number(v)) : v, name === "revenue" ? "Revenue" : "Orders"]}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
              <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#00e5ff" strokeWidth={2} fill="url(#rev)" name="revenue" />
              <Area yAxisId="right" type="monotone" dataKey="orders" stroke="#5b8cff" strokeWidth={2} fill="transparent" name="orders" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="rounded-xl border border-white/8 bg-surface p-5">
          <h2 className="font-display text-base font-semibold mb-4">
            Top Products by Units Sold
          </h2>
          {data.topProducts.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted text-sm">
              No sales data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                <Tooltip
                  contentStyle={{ background: "#1a2234", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }}
                />
                <Bar dataKey="totalSold" fill="#00e5ff" radius={[0, 4, 4, 0]} name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders by status */}
        <div className="rounded-xl border border-white/8 bg-surface p-5">
          <h2 className="font-display text-base font-semibold mb-4">
            Orders by Status
          </h2>
          {data.ordersByStatus.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted text-sm">No orders yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.ordersByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="status" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v: string) => v.replace(/_/g, " ")} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1a2234", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }}
                  formatter={(v) => [Number(v), "Orders"]}
                  labelFormatter={(l) => String(l).replace(/_/g, " ")}
                />
                <Bar dataKey="count" fill="#5b8cff" radius={[4, 4, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
