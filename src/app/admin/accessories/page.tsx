"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Eye, Edit, Trash2, Mouse, Keyboard, Headphones, Monitor, Camera, TrendingUp } from "lucide-react";
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

type Accessory = {
  id: string;
  name: string;
  brand: { name: string };
  category: { name: string };
  price: number;
  compareAtPrice?: number;
  condition: "NEW" | "REFURBISHED" | "USED_EXCELLENT";
  stock: number;
  isActive: boolean;
  hasRgb: boolean;
  specs: Array<{ group: string; key: string; value: string }>;
  images: Array<{ url: string; alt?: string }>;
  warrantyMonths: number;
  createdAt: string;
};

type AccessoryStats = {
  totalAccessories: number;
  rgbAccessories: number;
  averagePrice: number;
  mostPopularCategory: string;
  lowStockCount: number;
  newThisWeek: number;
};

const categoryIcons = {
  "Gaming Keyboards": Keyboard,
  "Gaming Mice": Mouse,
  "Gaming Headsets": Headphones,
  "Monitors": Monitor,
  "Webcams": Camera,
  "Speakers": Headphones,
  "Mousepads": Mouse,
  "Microphones": Camera,
};

export default function AccessoriesAdminPage() {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [stats, setStats] = useState<AccessoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accessoriesRes, statsRes, categoriesRes, brandsRes] = await Promise.all([
        fetch("/api/admin/accessories"),
        fetch("/api/admin/accessories/stats"),
        fetch("/api/admin/categories?type=accessories"),
        fetch("/api/admin/brands?category=accessories"),
      ]);

      const [accessoriesData, statsData, categoriesData, brandsData] = await Promise.all([
        accessoriesRes.ok ? accessoriesRes.json() : [],
        statsRes.ok ? statsRes.json() : null,
        categoriesRes.ok ? categoriesRes.json() : [],
        brandsRes.ok ? brandsRes.json() : [],
      ]);

      setAccessories(accessoriesData);
      setStats(statsData);
      setCategories(categoriesData);
      setBrands(brandsData);
    } catch (error) {
      toast.error("Failed to load accessories data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAccessories = accessories.filter((accessory) => {
    const matchesSearch = accessory.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      accessory.brand.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || accessory.category.name === selectedCategory;
    const matchesBrand = selectedBrand === "all" || accessory.brand.name === selectedBrand;
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const handleDeleteAccessory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this accessory?")) return;
    
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      
      toast.success("Accessory deleted");
      loadData();
    } catch (error) {
      toast.error("Failed to delete accessory");
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
      
      toast.success(isActive ? "Accessory deactivated" : "Accessory activated");
      loadData();
    } catch (error) {
      toast.error("Failed to update accessory");
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
        title="Accessories Management"
        description="Manage gaming accessories including keyboards, mice, headsets, monitors, and more"
        action={
          <div className="flex items-center gap-3">
            <Link href="/admin/products/new?category=accessories">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Add Accessory
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
              <CardTitle className="text-sm font-medium text-muted">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAccessories}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted">RGB Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">{stats.rgbAccessories}</div>
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
              <CardTitle className="text-sm font-medium text-muted">Top Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-semibold truncate" title={stats.mostPopularCategory}>
                {stats.mostPopularCategory}
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
              <CardTitle className="text-sm font-medium text-muted">New This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.newThisWeek}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search accessories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
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

      {/* Accessories Table */}
      <div className="rounded-xl border border-white/8 bg-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Features</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccessories.map((accessory) => {
              const Icon = categoryIcons[accessory.category.name as keyof typeof categoryIcons] || Mouse;
              return (
                <TableRow key={accessory.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated">
                        <Icon className="h-4 w-4 text-muted" />
                      </div>
                      <div>
                        <p className="font-medium">{accessory.name}</p>
                        <p className="text-xs text-muted">{accessory.brand.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{accessory.category.name}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold">₹{accessory.price.toLocaleString()}</p>
                      {accessory.compareAtPrice && (
                        <p className="text-xs text-muted line-through">
                          ₹{accessory.compareAtPrice.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1">
                      {accessory.hasRgb && (
                        <Badge variant="secondary" className="text-purple-400">
                          RGB
                        </Badge>
                      )}
                      {accessory.specs.find(s => s.key === "Wireless") && (
                        <Badge variant="outline" className="text-blue-400">
                          Wireless
                        </Badge>
                      )}
                      {accessory.specs.find(s => s.key === "Mechanical") && (
                        <Badge variant="outline" className="text-green-400">
                          Mechanical
                        </Badge>
                      )}
                      {accessory.specs.find(s => s.key === "Gaming Grade") && (
                        <Badge variant="outline" className="text-orange-400">
                          Gaming
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "text-sm",
                      accessory.stock === 0 ? "text-red-500" :
                      accessory.stock <= 5 ? "text-yellow-500" : "text-green-500"
                    )}>
                      {accessory.stock} units
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={accessory.isActive ? "default" : "secondary"}>
                        {accessory.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {accessory.condition !== "NEW" && (
                        <Badge variant="outline">{accessory.condition}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/shop/${accessory.name.toLowerCase().replace(/\s+/g, "-")}`} target="_blank">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/products/${accessory.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleToggleActive(accessory.id, accessory.isActive)}
                      >
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteAccessory(accessory.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filteredAccessories.length === 0 && (
        <div className="text-center py-12">
          <Mouse className="h-12 w-12 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No accessories found</h3>
          <p className="text-muted mb-4">
            {searchQuery || selectedCategory !== "all" || selectedBrand !== "all"
              ? "Try adjusting your search or filters"
              : "Start by adding gaming accessories to your inventory"
            }
          </p>
          {!searchQuery && selectedCategory === "all" && selectedBrand === "all" && (
            <Link href="/admin/products/new?category=accessories">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Accessory
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Category Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated">
              <Keyboard className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold">Keyboards</h3>
              <p className="text-sm text-muted">Mechanical & membrane</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated">
              <Mouse className="h-4 w-4 text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold">Mice</h3>
              <p className="text-sm text-muted">Gaming & productivity</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated">
              <Headphones className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">Audio</h3>
              <p className="text-sm text-muted">Headsets & speakers</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated">
              <Monitor className="h-4 w-4 text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold">Displays</h3>
              <p className="text-sm text-muted">Gaming monitors</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Bundle Creator</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted mb-3">
              Create keyboard + mouse + headset bundles
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Create Bundle
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">RGB Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted mb-3">
              Manage RGB-compatible product combinations
            </p>
            <Button variant="outline" size="sm" className="w-full">
              RGB Manager
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Compatibility Check</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted mb-3">
              Verify accessory compatibility with systems
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Check Compatibility
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}