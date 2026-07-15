"use client";

import { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { StatsCard } from "@/components/admin/stats-card";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";

interface StatsData {
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalUsers: number;
    totalBrands: number;
    totalCategories: number;
    thisMonthRevenue: number;
    lastMonthRevenue: number;
    revenueGrowth: number;
    thisMonthOrders: number;
  };
  recentOrders: {
    id: string;
    orderNumber: string;
    user: { name: string; email: string };
    status: string;
    paymentStatus: string;
    total: number;
    itemCount: number;
    createdAt: string;
  }[];
  topProducts: {
    productId: string;
    name: string;
    slug: string;
    image: string | null;
    totalSold: number;
  }[];
  lowStockProducts: {
    id: string;
    name: string;
    sku: string;
    stock: number;
  }[];
  ordersByStatus: { status: string; count: number }[];
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#3b82f6",
  PROCESSING: "#8b5cf6",
  SHIPPED: "#06b6d4",
  OUT_FOR_DELIVERY: "#00e5ff",
  DELIVERED: "#00ff88",
  CANCELLED: "#ef4444",
  REFUNDED: "#94a3b8",
};

const PIE_COLORS = ["#00e5ff", "#5b8cff", "#00ff88", "#f59e0b", "#ef4444", "#8b5cf6"];

function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, "default" | "success" | "destructive" | "secondary" | "outline"> = {
    DELIVERED: "success",
    CANCELLED: "destructive",
    REFUNDED: "destructive",
    PENDING: "secondary",
    CONFIRMED: "default",
    PROCESSING: "default",
    SHIPPED: "default",
    OUT_FOR_DELIVERY: "default",
  };
  return (
    <Badge variant={variantMap[status] ?? "secondary"}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Overview of your store" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-xl bg-surface" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" />
        <div className="rounded-xl border border-white/8 bg-surface p-8 text-center text-muted">
          Failed to load dashboard data. Make sure your database is connected.
        </div>
      </div>
    );
  }

  const { stats, recentOrders, topProducts, lowStockProducts, ordersByStatus, monthlyRevenue } =
    data;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={`Welcome back. Here's what's happening with your store.`}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Revenue"
          value={formatPrice(stats.thisMonthRevenue)}
          icon={TrendingUp}
          change={stats.revenueGrowth}
          changeLabel="vs last month"
          iconColor="text-cyan"
          iconBg="bg-cyan/10"
        />
        <StatsCard
          label="Orders This Month"
          value={stats.thisMonthOrders}
          icon={ShoppingCart}
          iconColor="text-blue"
          iconBg="bg-blue/10"
        />
        <StatsCard
          label="Total Products"
          value={stats.totalProducts}
          icon={Package}
          iconColor="text-green"
          iconBg="bg-green/10"
        />
        <StatsCard
          label="Total Customers"
          value={stats.totalUsers}
          icon={Users}
          iconColor="text-purple-400"
          iconBg="bg-purple-400/10"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-xl border border-white/8 bg-surface p-5">
          <h2 className="font-display text-base font-semibold mb-4">
            Revenue — Last 6 Months
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a2234",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 12,
                }}
                formatter={(v) => [formatPrice(Number(v)), "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#00e5ff"
                strokeWidth={2}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Status Pie */}
        <div className="rounded-xl border border-white/8 bg-surface p-5">
          <h2 className="font-display text-base font-semibold mb-4">
            Orders by Status
          </h2>
          {ordersByStatus.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted text-sm">
              No orders yet
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    strokeWidth={0}
                  >
                    {ordersByStatus.map((entry, i) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status] ?? PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#1a2234",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      color: "#fff",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1.5">
                {ordersByStatus.slice(0, 4).map((s, i) => (
                  <div key={s.status} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          background:
                            STATUS_COLORS[s.status] ?? PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                      <span className="text-muted">{s.status.replace(/_/g, " ")}</span>
                    </div>
                    <span className="font-medium">{s.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 rounded-xl border border-white/8 bg-surface">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <h2 className="font-display text-base font-semibold">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-xs text-cyan hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="px-5 py-10 text-center text-muted text-sm">No orders yet</div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-surface-elevated transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{order.orderNumber}</p>
                    <p className="text-xs text-muted truncate">{order.user.name}</p>
                    <p className="text-xs text-muted">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                    <StatusBadge status={order.status} />
                    <span className="text-sm font-semibold">{formatPrice(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Top Products */}
          <div className="rounded-xl border border-white/8 bg-surface">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <h2 className="font-display text-base font-semibold">Top Products</h2>
              <Link
                href="/admin/products"
                className="flex items-center gap-1 text-xs text-cyan hover:underline"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {topProducts.length === 0 ? (
              <div className="px-5 py-8 text-center text-muted text-sm">No data yet</div>
            ) : (
              <div className="divide-y divide-white/5">
                {topProducts.map((p, i) => (
                  <div key={p.productId} className="flex items-center gap-3 px-5 py-3">
                    <span className="text-xs font-bold text-muted w-4">{i + 1}</span>
                    <div className="h-8 w-8 rounded-lg bg-surface-elevated flex items-center justify-center shrink-0 overflow-hidden">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-4 w-4 text-muted" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted">{p.totalSold} sold</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock */}
          {lowStockProducts.length > 0 && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-destructive/20">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <h2 className="font-display text-base font-semibold text-destructive">
                  Low Stock
                </h2>
              </div>
              <div className="divide-y divide-white/5">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted">{p.sku}</p>
                    </div>
                    <Badge variant="destructive" className="shrink-0 ml-2">
                      {p.stock} left
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
