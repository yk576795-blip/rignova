"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Eye, Edit, Trash2, CheckCircle, XCircle, Clock, DollarSign, Package, Star } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type TradeInRequest = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  gpuModel: string;
  gpuBrand: string;
  purchaseYear: number;
  condition: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
  description: string;
  estimatedValue: number;
  finalOfferValue?: number;
  status: "SUBMITTED" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "PICKUP_SCHEDULED" | "RECEIVED" | "PAID";
  submissionDate: string;
  photos: Array<{ url: string; description: string }>;
  adminNotes?: string;
  rejectionReason?: string;
};

type TradeInStats = {
  totalRequests: number;
  pendingReview: number;
  approvedRequests: number;
  averageValue: number;
  completedThisMonth: number;
  totalPaidOut: number;
};

const statusColors = {
  SUBMITTED: "text-blue-500",
  PENDING_REVIEW: "text-yellow-500",
  APPROVED: "text-green-500",
  REJECTED: "text-red-500",
  PICKUP_SCHEDULED: "text-purple-500",
  RECEIVED: "text-cyan-500",
  PAID: "text-green-600",
};

const statusLabels = {
  SUBMITTED: "Submitted",
  PENDING_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PICKUP_SCHEDULED: "Pickup Scheduled",
  RECEIVED: "Received",
  PAID: "Paid",
};

const conditionColors = {
  EXCELLENT: "text-green-500",
  GOOD: "text-yellow-500",
  FAIR: "text-orange-500",
  POOR: "text-red-500",
};

export default function SellGPUAdminPage() {
  const [requests, setRequests] = useState<TradeInRequest[]>([]);
  const [stats, setStats] = useState<TradeInStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<TradeInRequest | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [requestsRes, statsRes] = await Promise.all([
        fetch("/api/admin/trade-in-requests"),
        fetch("/api/admin/trade-in-requests/stats"),
      ]);

      const [requestsData, statsData] = await Promise.all([
        requestsRes.ok ? requestsRes.json() : [],
        statsRes.ok ? statsRes.json() : null,
      ]);

      setRequests(requestsData);
      setStats(statsData);
    } catch (error) {
      toast.error("Failed to load trade-in data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch = request.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.gpuModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || request.status === selectedStatus;
    const matchesCondition = selectedCondition === "all" || request.condition === selectedCondition;
    return matchesSearch && matchesStatus && matchesCondition;
  });

  const handleUpdateStatus = async (id: string, newStatus: TradeInRequest['status'], offerValue?: number, notes?: string) => {
    try {
      const res = await fetch(`/api/admin/trade-in-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus, 
          finalOfferValue: offerValue,
          adminNotes: notes 
        }),
      });
      
      if (!res.ok) throw new Error("Update failed");
      
      toast.success("Request status updated");
      loadData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleApprove = (request: TradeInRequest) => {
    const offerValue = prompt(`Enter offer value for ${request.gpuModel}:`, request.estimatedValue.toString());
    if (offerValue) {
      const notes = prompt("Add notes (optional):");
      handleUpdateStatus(request.id, "APPROVED", parseFloat(offerValue), notes || undefined);
    }
  };

  const handleReject = (request: TradeInRequest) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      handleUpdateStatus(request.id, "REJECTED", undefined, reason);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trade-in request?")) return;
    
    try {
      const res = await fetch(`/api/admin/trade-in-requests/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      
      toast.success("Request deleted");
      loadData();
    } catch (error) {
      toast.error("Failed to delete request");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded bg-surface" />
        <div className="h-96 animate-pulse rounded-xl bg-surface" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="GPU Trade-in Management"
        description="Review and manage customer GPU trade-in requests and offers"
        action={
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline">
              <DollarSign className="h-4 w-4" />
              Pricing Guide
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.pendingReview}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.approvedRequests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted">Avg Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.averageValue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.completedThisMonth}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted">Total Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">₹{stats.totalPaidOut.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
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
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="SUBMITTED">Submitted</SelectItem>
            <SelectItem value="PENDING_REVIEW">Under Review</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="PICKUP_SCHEDULED">Pickup Scheduled</SelectItem>
            <SelectItem value="RECEIVED">Received</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedCondition} onValueChange={setSelectedCondition}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conditions</SelectItem>
            <SelectItem value="EXCELLENT">Excellent</SelectItem>
            <SelectItem value="GOOD">Good</SelectItem>
            <SelectItem value="FAIR">Fair</SelectItem>
            <SelectItem value="POOR">Poor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests Table */}
      <div className="rounded-xl border border-white/8 bg-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>GPU Details</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Values</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{request.customerName}</p>
                    <p className="text-xs text-muted">{request.customerEmail}</p>
                    <p className="text-xs text-muted">{request.customerPhone}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{request.gpuModel}</p>
                    <p className="text-xs text-muted">{request.gpuBrand} • {request.purchaseYear}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={conditionColors[request.condition]}
                  >
                    {request.condition}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm">Est: ₹{request.estimatedValue.toLocaleString()}</p>
                    {request.finalOfferValue && (
                      <p className="text-sm font-semibold text-green-500">
                        Offer: ₹{request.finalOfferValue.toLocaleString()}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={request.status === "PAID" ? "default" : "outline"}
                    className={statusColors[request.status]}
                  >
                    {statusLabels[request.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted">
                    {new Date(request.submissionDate).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Trade-in Request Details</DialogTitle>
                          <DialogDescription>
                            Review customer GPU trade-in submission
                          </DialogDescription>
                        </DialogHeader>
                        {selectedRequest && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">Customer Info</h4>
                                <p><strong>Name:</strong> {selectedRequest.customerName}</p>
                                <p><strong>Email:</strong> {selectedRequest.customerEmail}</p>
                                <p><strong>Phone:</strong> {selectedRequest.customerPhone}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">GPU Details</h4>
                                <p><strong>Model:</strong> {selectedRequest.gpuModel}</p>
                                <p><strong>Brand:</strong> {selectedRequest.gpuBrand}</p>
                                <p><strong>Purchase Year:</strong> {selectedRequest.purchaseYear}</p>
                                <p><strong>Condition:</strong> {selectedRequest.condition}</p>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">Description</h4>
                              <p className="text-sm bg-surface-elevated p-3 rounded-lg">
                                {selectedRequest.description}
                              </p>
                            </div>

                            {selectedRequest.photos.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2">Photos ({selectedRequest.photos.length})</h4>
                                <div className="grid grid-cols-3 gap-2">
                                  {selectedRequest.photos.map((photo, idx) => (
                                    <img
                                      key={idx}
                                      src={photo.url}
                                      alt={photo.description}
                                      className="w-full h-24 object-cover rounded-lg"
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {selectedRequest.adminNotes && (
                              <div>
                                <h4 className="font-semibold mb-2">Admin Notes</h4>
                                <p className="text-sm bg-surface-elevated p-3 rounded-lg">
                                  {selectedRequest.adminNotes}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    {request.status === "SUBMITTED" || request.status === "PENDING_REVIEW" ? (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleApprove(request)}
                          className="text-green-500 hover:text-green-400"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleReject(request)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(request.id)}
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

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No trade-in requests found</h3>
          <p className="text-muted mb-4">
            {searchQuery || selectedStatus !== "all" || selectedCondition !== "all"
              ? "Try adjusting your search or filters"
              : "Customer GPU trade-in requests will appear here"
            }
          </p>
        </div>
      )}

      {/* Quick Actions & Tools */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pricing Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted mb-3">
              Current market values for popular GPU models
            </p>
            <Button variant="outline" size="sm" className="w-full">
              View Guide
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Bulk Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted mb-3">
              Process multiple requests at once
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Bulk Process
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pickup Scheduler</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted mb-3">
              Schedule GPU pickup appointments
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Schedule Pickups
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted mb-3">
              Generate trade-in analytics and reports
            </p>
            <Button variant="outline" size="sm" className="w-full">
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Status Flow Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Trade-in Process Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Submitted</span>
            </div>
            <div className="flex-1 h-px bg-border mx-2"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Under Review</span>
            </div>
            <div className="flex-1 h-px bg-border mx-2"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Approved</span>
            </div>
            <div className="flex-1 h-px bg-border mx-2"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>Pickup</span>
            </div>
            <div className="flex-1 h-px bg-border mx-2"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              <span>Received</span>
            </div>
            <div className="flex-1 h-px bg-border mx-2"></div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span>Paid</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}