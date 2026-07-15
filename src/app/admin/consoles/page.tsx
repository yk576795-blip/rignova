"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Eye, Edit, Trash2, Gamepad2, TrendingUp, Package } from "lucide-react";
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

type Console = {
  id: string;
  name: string;
  brand: { name: string };
  price: number;
  compareAtPrice?: number;
  condition: "NEW" | "REFURBISHED" | "USED_EXCELLENT" | "USED_GOOD" | "USED_FAIR";
  stock: number;
  isActive: boolean;
  specs: Array<{ group: string; key: string; value: string }>;
  images: Array<{ url: string; alt?: string }>;
  warrantyMonths: number;
  createdAt: string;
};

type ConsoleStats = {
  totalConsoles: number;
  newConsoles: number;
  refurbishedConsoles: number;
  averagePrice: number;
  mostPopularBrand: string;
  lowStockCount: number;
};

const brandIcons = {
  "Sony": "🎮",
  "Microsoft": "🎮",
  "Nintendo": "🎮",
  "Valve": "🎮",
};

const conditionColors = {
  NEW: "text-green-500",
  REFURBISHED: "text-blue-500",
  USED_EXCELLENT: "text-green-400",
  USED_GOOD: "text-yellow-500",
  USED_FAIR: "text-orange-500",
};

const conditionLabels = {
  NEW: "New",
  REFURBISHED: "Refurbished",
  USED_EXCELLENT: "Excellent",
  USED_GOOD: "Good",
  USED_FAIR: "Fair",
};

export default function ConsolesAdminPage() {
  const [consoles, setConsoles] = useState<Console[]>([]);
  const [stats, setStats] = useState<ConsoleStats | null>(null);
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
      const [consolesRes, statsRes, brandsRes] = await Promise.all([
        fetch("/api/admin/consoles"),
        fetch("/api/admin/consoles/stats"),
        fetch("/api/admin/brands?category=consoles"),
      ]);

      const [consolesData, statsData, brandsData] = await Promise.all([
        consolesRes.ok ? consolesRes.json() : [],
        statsRes.ok ? statsRes.json() : null,
        brandsRes.ok ? brandsRes.json() : [],
      ]);

      setConsoles(consolesData);
      setStats(statsData);
      setBrands(brandsData);
    } catch (error) {
      toast.error("Failed to load console data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConsoles = consoles.filter((console) => {
    const matchesSearch = console.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      console.brand.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCondition = selectedCondition === "all" || console.condition === selectedCondition;
    const matchesBrand = selectedBrand === "all" || console.brand.name === selectedBrand;
    return matchesSearch && matchesCondition && matchesBrand;
  });

  const handleDeleteConsole = async (id: string) => {
    if (!confirm("Are you sure you want to delete this console listing?")) return;
    
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      
      toast.success("Console listing deleted");
      loadData();
    } catch (error) {
      toast.error("Failed to delete console listing");
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
      
      toast.success(isActive ? "Console listing deactivated" : "Console listing activated");
      loadData();
    } catch (error) {
      toast.error("Failed to update console listing");
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
        title="Consoles Management"
        description="Manage gaming console inventory including PlayStation, Xbox, Nintendo, and Steam Deck"
        action={
          <div className="flex items-center gap-3">
            <Link href="/admin/products/new?category=consoles">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Add Console
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
              <CardTitle className="text-sm font-medium text-muted">Total Consoles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConsoles}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted">New Units</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.newConsoles}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted">Refurbished</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.refurbishedConsoles}</div>
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
              <CardTitle className="text-sm font-medium text-muted">Top Brand</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.mostPopularBrand}</div>
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
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search consoles..."
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
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="REFURBISHED">Refurbished</SelectItem>
            <SelectItem value="USED_EXCELLENT">Used - Excellent</SelectItem>
            <SelectItem value="USED_GOOD">Used - Good</SelectItem>
            <SelectItem value="USED_FAIR">Used - Fair</SelectItem>
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

      {/* Consoles Table */}
      <div className="rounded-xl border border-white/8 bg-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Console</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Warranty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConsoles.map((console) => (
              <TableRow key={console.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated">
                      <Gamepad2 className="h-4 w-4 text-muted" />
                    </div>
                    <div>
                      <p className="font-medium">{console.name}</p>
                      {console.specs.find(s => s.key === "Storage") && (
                        <p className="text-xs text-muted">
                          {console.specs.find(s => s.key === "Storage")?.value}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {brandIcons[console.brand.name as keyof typeof brandIcons] || "🎮"}
                    </span>
                    <span className="font-medium">{console.brand.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={conditionColors[console.condition]}
                  >
                    {conditionLabels[console.condition]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-semibold">₹{console.price.toLocaleString()}</p>
                    {console.compareAtPrice && (
                      <p className="text-xs text-muted line-through">
                        ₹{console.compareAtPrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "text-sm",
                    console.stock === 0 ? "text-red-500" :
                    console.stock <= 5 ? "text-yellow-500" : "text-green-500"
                  )}>
                    {console.stock} units
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted">
                    {console.warrantyMonths} months
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={console.isActive ? "default" : "secondary"}>
                    {console.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/shop/${console.name.toLowerCase().replace(/\s+/g, "-")}`} target="_blank">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/products/${console.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleToggleActive(console.id, console.isActive)}
                    >
                      <TrendingUp className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteConsole(console.id)}
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

      {filteredConsoles.length === 0 && (
        <div className="text-center py-12">
          <Gamepad2 className="h-12 w-12 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No consoles found</h3>
          <p className="text-muted mb-4">
            {searchQuery || selectedCondition !== "all" || selectedBrand !== "all"
              ? "Try adjusting your search or filters"
              : "Start by adding gaming consoles to your inventory"
            }
          </p>
          {!searchQuery && selectedCondition === "all" && selectedBrand === "all" && (
            <Link href="/admin/products/new?category=consoles">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Console
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Popular Console Models */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎮</div>
            <div>
              <h3 className="font-semibold">PlayStation 5</h3>
              <p className="text-sm text-muted">Sony's latest console</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎮</div>
            <div>
              <h3 className="font-semibold">Xbox Series X</h3>
              <p className="text-sm text-muted">Microsoft's flagship</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎮</div>
            <div>
              <h3 className="font-semibold">Nintendo Switch</h3>
              <p className="text-sm text-muted">Portable gaming</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎮</div>
            <div>
              <h3 className="font-semibold">Steam Deck</h3>
              <p className="text-sm text-muted">Handheld PC gaming</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Bundle Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted mb-3">
              Create console + controller + game bundles
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Create Bundle
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Trade-in Program</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted mb-3">
              Manage console trade-in values and conditions
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Manage Trade-ins
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pre-orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted mb-3">
              Set up pre-orders for upcoming console releases
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Setup Pre-order
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}