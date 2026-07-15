"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Eye, Edit, Trash2, Monitor, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import Link from "next/link";
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
import { cn } from "@/lib/utils";

type UsedGPU = {
  id: string;
  name: string;
  brand: { name: string };
  price: number;
  compareAtPrice?: number;
  condition: "USED_EXCELLENT" | "USED_GOOD" | "USED_FAIR";
  stock: number;
  isActive: boolean;
  specs: Array<{ group: string; key: string; value: string }>;
  benchmarks: Array<{ game: string; resolution: string; fps: number }>;
  usedGpuDetails?: {
    stressTestScore?: number;
    miningHistory?: boolean;
    overclockHistory?: boolean;
    thermalPads?: boolean;
    warrantyRemaining?: number;
  };
  createdAt: string;
};

type UsedGPUStats = {
  totalUsedGpus: number;
  averageCondition: string;
  averagePrice: number;
  bestPerformer: string;
  lowStockCount: number;
  recentListings: number;
};

const conditionColors = {
  USED_EXCELLENT: "text-green-500",
  USED_GOOD: "text-yellow-500", 
  USED_FAIR: "text-orange-500",
};

const conditionLabels = {
  USED_EXCELLENT: "Excellent",
  USED_GOOD: "Good",
  USED_FAIR: "Fair",
};

export default function UsedGPUsAdminPage() {
  const [gpus, setGpus] = useState<UsedGPU[]>([]);
  const [stats, setStats] = useState<UsedGPUStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [gpusRes, statsRes, brandsRes] = await Promise.all([
        fetch("/api/admin/used-gpus"),
        fetch("/api/admin/used-gpus/stats"),
        fetch("/api/admin/brands?category=graphics-cards"),
      ]);

      const [gpusData, statsData, brandsData] = await Promise.all([
        gpusRes.ok ? gpusRes.json() : [],
        statsRes.ok ? statsRes.json() : null,
        brandsRes.ok ? brandsRes.json() : [],
      ]);

      setGpus(gpusData);
      setStats(statsData);
      setBrands(brandsData);
    } catch (error) {
      toast.error("Failed to load used GPU data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGPUs = gpus.filter((gpu) => {
    const matchesSearch = gpu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gpu.brand.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCondition = selectedCondition === "all" || gpu.condition === selectedCondition;
    const matchesBrand = selectedBrand === "all" || gpu.brand.name === selectedBrand;
    return matchesSearch && matchesCondition && matchesBrand;
  });

  const handleDeleteGPU = async (id: string) => {
    if (!confirm("Are you sure you want to delete this GPU listing?")) return;
    
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      
      toast.success("GPU listing deleted");
      loadData();
    } catch (error) {
      toast.error("Failed to delete GPU listing");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      
      if (!res.ok) throw new Error("Update failed");
      
      toast.success(isActive ? "GPU listing deactivated" : "GPU listing activated");
      loadData();
    } catch (error) {
      toast.error("Failed to update GPU listing");
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
        title="Used GPUs Management"
        description="Manage used graphics card inventory, pricing, and condition assessments"
        action={
          <div className="flex items-center gap-3">
            <Link href="/admin/products/new?category=used-gpus">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Add Used GPU
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted">Total Listed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsedGpus}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted">Avg Condition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.averageCondition}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted">Avg Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.averagePrice.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted">Best Performer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-semibold truncate" title={stats.bestPerformer}>
                {stats.bestPerformer}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted">Low Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{stats.lowStockCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.recentListings}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search used GPUs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedCondition} onValueChange={setSelectedCondition}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4" />
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conditions</SelectItem>
            <SelectItem value="USED_EXCELLENT">Excellent</SelectItem>
            <SelectItem value="USED_GOOD">Good</SelectItem>
            <SelectItem value="USED_FAIR">Fair</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.name}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* GPUs Table */}
      <div className="rounded-xl border border-white/8 bg-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>GPU Model</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGPUs.map((gpu) => (
              <TableRow key={gpu.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated">
                      <Monitor className="h-4 w-4 text-muted" />
                    </div>
                    <div>
                      <p className="font-medium">{gpu.name}</p>
                      <p className="text-xs text-muted">{gpu.brand.name}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge 
                      variant="outline" 
                      className={conditionColors[gpu.condition]}
                    >
                      {conditionLabels[gpu.condition]}
                    </Badge>
                    {gpu.usedGpuDetails?.stressTestScore && (
                      <p className="text-xs text-muted">
                        Test: {gpu.usedGpuDetails.stressTestScore}%
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-semibold">₹{gpu.price.toLocaleString()}</p>
                    {gpu.compareAtPrice && (
                      <p className="text-xs text-muted line-through">
                        ₹{gpu.compareAtPrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {gpu.benchmarks.slice(0, 2).map((benchmark, idx) => (
                      <p key={idx} className="text-xs text-muted">
                        {benchmark.game}: {benchmark.fps}fps @{benchmark.resolution}
                      </p>
                    ))}
                    {gpu.benchmarks.length > 2 && (
                      <p className="text-xs text-muted">+{gpu.benchmarks.length - 2} more</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "text-sm",
                    gpu.stock === 0 ? "text-red-500" :
                    gpu.stock <= 2 ? "text-yellow-500" : "text-green-500"
                  )}>
                    {gpu.stock} units
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant={gpu.isActive ? "default" : "secondary"}>
                      {gpu.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {gpu.usedGpuDetails?.miningHistory && (
                      <Badge variant="outline" className="text-orange-500">
                        Ex-Mining
                      </Badge>
                    )}
                    {gpu.usedGpuDetails?.warrantyRemaining && (
                      <Badge variant="outline" className="text-blue-500">
                        {gpu.usedGpuDetails.warrantyRemaining}m warranty
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/shop/${gpu.name.toLowerCase().replace(/\s+/g, "-")}`} target="_blank">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/products/${gpu.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleToggleActive(gpu.id, gpu.isActive)}
                    >
                      {gpu.isActive ? (
                        <TrendingDown className="h-4 w-4" />
                      ) : (
                        <TrendingUp className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteGPU(gpu.id)}
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

      {filteredGPUs.length === 0 && (
        <div className="text-center py-12">
          <Monitor className="h-12 w-12 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No used GPUs found</h3>
          <p className="text-muted mb-4">
            {searchQuery || selectedCondition !== "all" || selectedBrand !== "all"
              ? "Try adjusting your search or filters"
              : "Start by adding used GPU listings to your inventory"
            }
          </p>
          {!searchQuery && selectedCondition === "all" && selectedBrand === "all" && (
            <Link href="/admin/products/new?category=used-gpus">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Used GPU
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Price Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted mb-3">
              Analyze market prices for better pricing decisions
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Run Price Analysis
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Condition Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted mb-3">
              Tools for evaluating GPU condition and performance
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Assessment Tools
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Bulk Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted mb-3">
              Update prices, conditions, or status in bulk
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Bulk Update
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}