"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  DollarSign,
  Package,
  Clock,
  Truck,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type TradeInStatus =
  | "SUBMITTED"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "PICKUP_SCHEDULED"
  | "RECEIVED"
  | "PAID";

type TradeInCondition =
  | "NEW"
  | "REFURBISHED"
  | "USED_EXCELLENT"
  | "USED_GOOD"
  | "USED_FAIR";

type TradeInRequest = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  gpuModel: string;
  gpuBrand: string;
  purchaseYear: number | null;
  condition: TradeInCondition;
  description: string;
  estimatedValue: number;
  finalOfferValue: number | null;
  status: TradeInStatus;
  submissionDate: string;
  photos: Array<{ url: string; description: string }>;
  adminNotes: string | null;
  rejectionReason: string | null;
};

type TradeInStats = {
  totalRequests: number;
  pendingReview: number;
  approvedRequests: number;
  averageValue: number;
  completedThisMonth: number;
  totalPaidOut: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<TradeInStatus, string> = {
  SUBMITTED: "text-blue-400",
  PENDING_REVIEW: "text-yellow-400",
  APPROVED: "text-green-400",
  REJECTED: "text-red-400",
  PICKUP_SCHEDULED: "text-purple-400",
  RECEIVED: "text-cyan-400",
  PAID: "text-green-500",
};

const STATUS_LABELS: Record<TradeInStatus, string> = {
  SUBMITTED: "Submitted",
  PENDING_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PICKUP_SCHEDULED: "Pickup Scheduled",
  RECEIVED: "Received",
  PAID: "Paid",
};

const CONDITION_LABELS: Record<TradeInCondition, string> = {
  NEW: "New",
  REFURBISHED: "Refurbished",
  USED_EXCELLENT: "Excellent",
  USED_GOOD: "Good",
  USED_FAIR: "Fair",
};

const CONDITION_COLORS: Record<TradeInCondition, string> = {
  NEW: "text-green-500",
  REFURBISHED: "text-blue-400",
  USED_EXCELLENT: "text-green-400",
  USED_GOOD: "text-yellow-400",
  USED_FAIR: "text-orange-400",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SellGPUAdminPage() {
  const [requests, setRequests] = useState<TradeInRequest[]>([]);
  const [stats, setStats] = useState<TradeInStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCondition, setSelectedCondition] = useState<string>("all");
  const [viewRequest, setViewRequest] = useState<TradeInRequest | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqRes, statsRes] = await Promise.all([
        fetch("/api/admin/trade-in-requests"),
        fetch("/api/admin/trade-in-requests/stats"),
      ]);
      const [reqData, statsData] = await Promise.all([
        reqRes.ok ? reqRes.json() : [],
        statsRes.ok ? statsRes.json() : null,
      ]);
      setRequests(reqData);
      setStats(statsData);
    } catch {
      toast.error("Failed to load trade-in data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRequests = requests.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      r.customerName.toLowerCase().includes(q) ||
      r.gpuModel.toLowerCase().includes(q) ||
      r.customerEmail.toLowerCase().includes(q) ||
      r.gpuBrand.toLowerCase().includes(q);
    const matchStatus = selectedStatus === "all" || r.status === selectedStatus;
    const matchCondition =
      selectedCondition === "all" || r.condition === selectedCondition;
    return matchSearch && matchStatus && matchCondition;
  });

  const updateStatus = async (
    id: string,
    status: TradeInStatus,
    extra?: { finalOfferValue?: number; adminNotes?: string; rejectionReason?: string }
  ) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/trade-in-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extra }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success(`Status updated to ${STATUS_LABELS[status]}`);
      loadData();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = (request: TradeInRequest) => {
    const raw = window.prompt(
      `Enter final offer value for ${request.gpuModel} (estimated: ₹${request.estimatedValue.toLocaleString()}):`,
      String(request.estimatedValue)
    );
    if (!raw) return;
    const offerValue = parseFloat(raw);
    if (isNaN(offerValue) || offerValue <= 0) {
      toast.error("Enter a valid offer amount");
      return;
    }
    const notes = window.prompt("Add admin notes (optional):") ?? undefined;
    updateStatus(request.id, "APPROVED", { finalOfferValue: offerValue, adminNotes: notes });
  };

  const handleReject = (request: TradeInRequest) => {
    const reason = window.prompt("Enter rejection reason:");
    if (!reason) return;
    updateStatus(request.id, "REJECTED", { rejectionReason: reason });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this trade-in request permanently?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/trade-in-requests/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Request deleted");
      loadData();
    } catch {
      toast.error("Failed to delete request");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded bg-surface" />
        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-xl bg-surface" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="GPU Trade-in Management"
        description="Review and process customer GPU trade-in requests"
        action={
          <Button size="sm" variant="secondary">
            <DollarSign className="h-4 w-4 mr-2" />
            Pricing Guide
          </Button>
        }
      />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Total", value: stats.totalRequests, color: "" },
            { label: "Pending Review", value: stats.pendingReview, color: "text-yellow-400" },
            { label: "Approved", value: stats.approvedRequests, color: "text-green-400" },
            { label: "Avg Value", value: `₹${stats.averageValue.toLocaleString()}`, color: "" },
            { label: "This Month", value: stats.completedThisMonth, color: "text-blue-400" },
            { label: "Total Paid Out", value: `₹${stats.totalPaidOut.toLocaleString()}`, color: "text-purple-400" },
          ].map((s) => (
            <Card key={s.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted">{s.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search by customer, GPU model, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="h-4 w-4 mr-1" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {(Object.keys(STATUS_LABELS) as TradeInStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedCondition} onValueChange={setSelectedCondition}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conditions</SelectItem>
            {(Object.keys(CONDITION_LABELS) as TradeInCondition[]).map((c) => (
              <SelectItem key={c} value={c}>{CONDITION_LABELS[c]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/8 bg-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>GPU</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Values</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{r.customerName}</p>
                    <p className="text-xs text-muted">{r.customerEmail}</p>
                    <p className="text-xs text-muted">{r.customerPhone}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{r.gpuModel}</p>
                    <p className="text-xs text-muted">
                      {r.gpuBrand}
                      {r.purchaseYear ? ` · ${r.purchaseYear}` : ""}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={CONDITION_COLORS[r.condition]}
                  >
                    {CONDITION_LABELS[r.condition]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <p className="text-sm">Est: ₹{r.estimatedValue.toLocaleString()}</p>
                  {r.finalOfferValue && (
                    <p className="text-sm font-semibold text-green-400">
                      Offer: ₹{r.finalOfferValue.toLocaleString()}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={STATUS_COLORS[r.status]}
                  >
                    {STATUS_LABELS[r.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted">
                    {new Date(r.submissionDate).toLocaleDateString("en-IN")}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* View */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewRequest(r)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {/* Approve / Reject — only when pending */}
                    {(r.status === "SUBMITTED" || r.status === "PENDING_REVIEW") && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={actionLoading === r.id}
                          onClick={() => handleApprove(r)}
                          className="text-green-400 hover:text-green-300"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={actionLoading === r.id}
                          onClick={() => handleReject(r)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {/* Advance status for approved requests */}
                    {r.status === "APPROVED" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={actionLoading === r.id}
                        onClick={() => updateStatus(r.id, "PICKUP_SCHEDULED")}
                        className="text-purple-400 hover:text-purple-300"
                        title="Mark as Pickup Scheduled"
                      >
                        <Truck className="h-4 w-4" />
                      </Button>
                    )}
                    {r.status === "PICKUP_SCHEDULED" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={actionLoading === r.id}
                        onClick={() => updateStatus(r.id, "RECEIVED")}
                        className="text-cyan-400 hover:text-cyan-300"
                        title="Mark as Received"
                      >
                        <Package className="h-4 w-4" />
                      </Button>
                    )}
                    {r.status === "RECEIVED" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={actionLoading === r.id}
                        onClick={() => updateStatus(r.id, "PAID")}
                        className="text-green-400 hover:text-green-300"
                        title="Mark as Paid"
                      >
                        <BadgeCheck className="h-4 w-4" />
                      </Button>
                    )}

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={actionLoading === r.id}
                      onClick={() => handleDelete(r.id)}
                      className="text-muted hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredRequests.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No trade-in requests found</h3>
          <p className="text-muted">
            {searchQuery || selectedStatus !== "all" || selectedCondition !== "all"
              ? "Try adjusting your filters"
              : "Customer GPU trade-in submissions will appear here"}
          </p>
        </div>
      )}

      {/* Status flow reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Trade-in Process Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {(
              [
                ["SUBMITTED", "blue"],
                ["PENDING_REVIEW", "yellow"],
                ["APPROVED", "green"],
                ["PICKUP_SCHEDULED", "purple"],
                ["RECEIVED", "cyan"],
                ["PAID", "emerald"],
              ] as const
            ).map(([s, color], i, arr) => (
              <span key={s} className="flex items-center gap-2">
                <span className={`flex items-center gap-1`}>
                  <span
                    className={`h-2.5 w-2.5 rounded-full bg-${color}-500 shrink-0`}
                  />
                  <span className="text-xs">{STATUS_LABELS[s as TradeInStatus]}</span>
                </span>
                {i < arr.length - 1 && (
                  <span className="text-muted">→</span>
                )}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!viewRequest} onOpenChange={() => setViewRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Trade-in Request Details</DialogTitle>
            <DialogDescription>
              Review the full submission from this customer
            </DialogDescription>
          </DialogHeader>
          {viewRequest && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="font-semibold text-muted uppercase text-xs tracking-wide">Customer</p>
                  <p><span className="text-muted">Name:</span> {viewRequest.customerName}</p>
                  <p><span className="text-muted">Email:</span> {viewRequest.customerEmail}</p>
                  <p><span className="text-muted">Phone:</span> {viewRequest.customerPhone}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-muted uppercase text-xs tracking-wide">GPU</p>
                  <p><span className="text-muted">Model:</span> {viewRequest.gpuModel}</p>
                  <p><span className="text-muted">Brand:</span> {viewRequest.gpuBrand}</p>
                  {viewRequest.purchaseYear && (
                    <p><span className="text-muted">Year:</span> {viewRequest.purchaseYear}</p>
                  )}
                  <p>
                    <span className="text-muted">Condition:</span>{" "}
                    <span className={CONDITION_COLORS[viewRequest.condition]}>
                      {CONDITION_LABELS[viewRequest.condition]}
                    </span>
                  </p>
                </div>
              </div>

              {viewRequest.description && (
                <div>
                  <p className="font-semibold text-muted uppercase text-xs tracking-wide mb-1">Description</p>
                  <p className="rounded-lg bg-surface-elevated p-3">{viewRequest.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-muted uppercase text-xs tracking-wide mb-1">Pricing</p>
                  <p>Est: ₹{viewRequest.estimatedValue.toLocaleString()}</p>
                  {viewRequest.finalOfferValue && (
                    <p className="text-green-400 font-semibold">
                      Offer: ₹{viewRequest.finalOfferValue.toLocaleString()}
                    </p>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-muted uppercase text-xs tracking-wide mb-1">Status</p>
                  <Badge variant="outline" className={STATUS_COLORS[viewRequest.status]}>
                    {STATUS_LABELS[viewRequest.status]}
                  </Badge>
                </div>
              </div>

              {viewRequest.photos.length > 0 && (
                <div>
                  <p className="font-semibold text-muted uppercase text-xs tracking-wide mb-2">
                    Photos ({viewRequest.photos.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {viewRequest.photos.map((photo, i) => (
                      <img
                        key={i}
                        src={photo.url}
                        alt={photo.description || `Photo ${i + 1}`}
                        className="h-24 w-full rounded-lg object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}

              {viewRequest.adminNotes && (
                <div>
                  <p className="font-semibold text-muted uppercase text-xs tracking-wide mb-1">Admin Notes</p>
                  <p className="rounded-lg bg-surface-elevated p-3">{viewRequest.adminNotes}</p>
                </div>
              )}

              {viewRequest.rejectionReason && (
                <div>
                  <p className="font-semibold text-red-400 uppercase text-xs tracking-wide mb-1">Rejection Reason</p>
                  <p className="rounded-lg bg-destructive/10 p-3 text-red-300">
                    {viewRequest.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
