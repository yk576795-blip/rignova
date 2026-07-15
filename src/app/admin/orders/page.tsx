"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Search, ChevronDown, Package, Filter } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice, formatDate } from "@/lib/utils";

interface OrderItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
  image: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  user: { id: string; name: string; email: string };
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  address: { fullName: string; city: string; state: string };
  items: OrderItem[];
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const STATUS_VARIANT: Record<
  string,
  "default" | "success" | "destructive" | "secondary" | "outline"
> = {
  DELIVERED: "success",
  CANCELLED: "destructive",
  REFUNDED: "destructive",
  PENDING: "secondary",
  CONFIRMED: "default",
  PROCESSING: "default",
  SHIPPED: "default",
  OUT_FOR_DELIVERY: "default",
};

const PAYMENT_VARIANT: Record<
  string,
  "default" | "success" | "destructive" | "secondary"
> = {
  CAPTURED: "success",
  FAILED: "destructive",
  REFUNDED: "destructive",
  PENDING: "secondary",
  AUTHORIZED: "default",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      });
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders ?? []);
      setPagination(data.pagination ?? { total: 0, page: 1, limit: 20, pages: 0 });
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    setUpdatingStatus(orderId);
    try {
      const body: Record<string, string> = { status };
      if (trackingInput) body.trackingNumber = trackingInput;
      const res = await fetch(`/api/admin/orders?id=${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success("Order status updated");
      fetchOrders();
      if (detailOrder?.id === orderId) {
        setDetailOrder((prev) => prev ? { ...prev, status } : null);
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const columns: Column<Order>[] = [
    {
      key: "orderNumber",
      label: "Order",
      render: (row) => (
        <div>
          <button
            onClick={() => {
              setDetailOrder(row);
              setTrackingInput("");
            }}
            className="text-sm font-mono font-semibold text-cyan hover:underline"
          >
            {row.orderNumber}
          </button>
          <p className="text-xs text-muted">{formatDate(row.createdAt)}</p>
        </div>
      ),
    },
    {
      key: "user",
      label: "Customer",
      render: (row) => (
        <div>
          <p className="text-sm font-medium">{row.user.name}</p>
          <p className="text-xs text-muted truncate max-w-[160px]">{row.user.email}</p>
        </div>
      ),
    },
    {
      key: "items",
      label: "Items",
      render: (row) => (
        <span className="text-sm">
          {row.items.reduce((s, i) => s + i.quantity, 0)} item
          {row.items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
        </span>
      ),
    },
    {
      key: "total",
      label: "Total",
      render: (row) => (
        <span className="text-sm font-semibold">{formatPrice(row.total)}</span>
      ),
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (row) => (
        <Badge variant={PAYMENT_VARIANT[row.paymentStatus] ?? "secondary"}>
          {row.paymentStatus}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANT[row.status] ?? "secondary"}>
            {row.status.replace(/_/g, " ")}
          </Badge>
        </div>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "w-40",
      render: (row) => (
        <Select
          value={row.status}
          onValueChange={(v) => handleStatusUpdate(row.id, v)}
          disabled={updatingStatus === row.id}
        >
          <SelectTrigger className="h-8 text-xs w-36">
            <SelectValue />
            <ChevronDown className="h-3 w-3" />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description={`${pagination.total} orders total`}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchInput);
            setPage(1);
          }}
          className="flex gap-2 flex-1"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <Input
              placeholder="Search by order number or customer..."
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="shrink-0">
            <Filter className="h-4 w-4" />
            Search
          </Button>
        </form>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v === "_all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44 h-11">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Statuses</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        emptyMessage="No orders found."
        pagination={{
          page: pagination.page,
          pages: pagination.pages,
          total: pagination.total,
          onPageChange: setPage,
        }}
      />

      {/* Order Detail Dialog */}
      <Dialog open={!!detailOrder} onOpenChange={(open) => !open && setDetailOrder(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono">{detailOrder?.orderNumber}</DialogTitle>
          </DialogHeader>

          {detailOrder && (
            <div className="space-y-5 mt-2">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted mb-1">Customer</p>
                  <p className="font-medium">{detailOrder.user.name}</p>
                  <p className="text-muted text-xs">{detailOrder.user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Shipping To</p>
                  <p className="font-medium">{detailOrder.address.fullName}</p>
                  <p className="text-muted text-xs">
                    {detailOrder.address.city}, {detailOrder.address.state}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Order Date</p>
                  <p className="font-medium">{formatDate(detailOrder.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Payment</p>
                  <Badge variant={PAYMENT_VARIANT[detailOrder.paymentStatus] ?? "secondary"}>
                    {detailOrder.paymentStatus}
                  </Badge>
                  {detailOrder.paymentMethod && (
                    <p className="text-xs text-muted mt-1">{detailOrder.paymentMethod}</p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                  Items
                </p>
                <div className="space-y-3">
                  {detailOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg overflow-hidden bg-surface-elevated shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-5 w-5 text-muted" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted">{item.sku} × {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold shrink-0">{formatPrice(item.total)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="rounded-lg border border-white/8 bg-surface-elevated p-4 space-y-2 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span>{formatPrice(detailOrder.subtotal)}</span>
                </div>
                {detailOrder.discount > 0 && (
                  <div className="flex justify-between text-green">
                    <span>Discount</span>
                    <span>−{formatPrice(detailOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted">
                  <span>Shipping</span>
                  <span>{detailOrder.shipping === 0 ? "Free" : formatPrice(detailOrder.shipping)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Tax</span>
                  <span>{formatPrice(detailOrder.tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-foreground border-t border-white/8 pt-2">
                  <span>Total</span>
                  <span>{formatPrice(detailOrder.total)}</span>
                </div>
              </div>

              {/* Status Update */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Update Order
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted mb-1.5">Status</p>
                    <Select
                      value={detailOrder.status}
                      onValueChange={(v) => handleStatusUpdate(detailOrder.id, v)}
                      disabled={updatingStatus === detailOrder.id}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1.5">Tracking Number</p>
                    <div className="flex gap-2">
                      <Input
                        value={trackingInput}
                        onChange={(e) => setTrackingInput(e.target.value)}
                        placeholder="Enter tracking ID"
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="shrink-0"
                        onClick={() =>
                          fetch(`/api/admin/orders?id=${detailOrder.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ trackingNumber: trackingInput }),
                          }).then(() => {
                            toast.success("Tracking updated");
                            fetchOrders();
                          })
                        }
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
