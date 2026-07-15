"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Eye, Edit, Trash2, Monitor, Cpu, HardDrive, MemoryStick, Zap, Box } from "lucide-react";
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

// Component type icons mapping
const componentIcons = {
  "Graphics Cards": Monitor,
  "Processors": Cpu,
  "Motherboards": Box,
  "Memory": MemoryStick,
  "Storage": HardDrive,
  "Power Supplies": Zap,
  "Cases": Box,
};

type PCComponent = {
  id: string;
  name: string;
  brand: { name: string };
  category: { name: string };
  price: number;
  condition: string;
  stock: number;
  hasRgb: boolean;
  isActive: boolean;
  specs: Array<{ group: string; key: string; value: string }>;
};

type SavedBuild = {
  id: string;
  name: string;
  description?: string;
  totalPrice: number;
  user: { name: string; email: string };
  items: Array<{
    component: {
      name: string;
      category: { name: string };
      price: number;
    };
    quantity: number;
  }>;
  createdAt: string;
};

type ComponentStats = {
  totalComponents: number;
  activeComponents: number;
  outOfStock: number;
  totalBuilds: number;
  avgBuildPrice: number;
  popularComponent: string;
};

export default function PCBuilderAdminPage() {
  const [activeTab, setActiveTab] = useState<"components" | "builds" | "compatibility">("components");
  const [components, setComponents] = useState<PCComponent[]>([]);
  const [builds, setBuilds] = useState<SavedBuild[]>([]);
  const [stats, setStats] = useState<ComponentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [componentsRes, buildsRes, categoriesRes, statsRes] = await Promise.all([
        fetch("/api/admin/pc-builder/components"),
        fetch("/api/admin/pc-builder/builds"),
        fetch("/api/admin/categories?type=pc-components"),
        fetch("/api/admin/pc-builder/stats"),
      ]);

      const [componentsData, buildsData, categoriesData, statsData] = await Promise.all([
        componentsRes.ok ? componentsRes.json() : [],
        buildsRes.ok ? buildsRes.json() : [],
        categoriesRes.ok ? categoriesRes.json() : [],
        statsRes.ok ? statsRes.json() : null,
      ]);

      setComponents(componentsData);
      setBuilds(buildsData);
      setCategories(categoriesData);
      setStats(statsData);
    } catch (error) {
      toast.error("Failed to load PC builder data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredComponents = components.filter((component) => {
    const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.brand.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || component.category.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteComponent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this component?")) return;
    
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      
      toast.success("Component deleted");
      loadData();
    } catch (error) {
      toast.error("Failed to delete component");
    }
  };

  const handleDeleteBuild = async (id: string) => {
    if (!confirm("Are you sure you want to delete this saved build?")) return;
    
    try {
      const res = await fetch(`/api/admin/pc-builder/builds/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      
      toast.success("Build deleted");
      loadData();
    } catch (error) {
      toast.error("Failed to delete build");
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
        title="PC Builder Management"
        description="Manage PC components, view saved builds, and configure compatibility rules"
        action={
          <div className="flex items-center gap-3">
            <Link href="/admin/products/new?category=pc-components">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Add Component
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
              <CardTitle className="text-sm font-medium text-muted">Total Components</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalComponents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.activeComponents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted">Out of Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.outOfStock}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted">Saved Builds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBuilds}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted">Avg Build Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.avgBuildPrice.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted">Most Popular</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-semibold truncate" title={stats.popularComponent}>
                {stats.popularComponent}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/8">
        {[
          { id: "components", label: "Components" },
          { id: "builds", label: "Saved Builds" },
          { id: "compatibility", label: "Compatibility Rules" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
              activeTab === tab.id
                ? "border-cyan text-cyan"
                : "border-transparent text-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Components Tab */}
      {activeTab === "components" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                placeholder="Search components..."
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
          </div>

          {/* Components Table */}
          <div className="rounded-xl border border-white/8 bg-surface overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComponents.map((component) => {
                  const Icon = componentIcons[component.category.name as keyof typeof componentIcons] || Box;
                  return (
                    <TableRow key={component.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-elevated">
                            <Icon className="h-4 w-4 text-muted" />
                          </div>
                          <div>
                            <p className="font-medium">{component.name}</p>
                            <p className="text-xs text-muted">{component.brand.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{component.category.name}</Badge>
                      </TableCell>
                      <TableCell>₹{component.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "text-sm",
                          component.stock === 0 ? "text-red-500" :
                          component.stock <= 5 ? "text-yellow-500" : "text-green-500"
                        )}>
                          {component.stock} units
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={component.isActive ? "default" : "secondary"}>
                            {component.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {component.hasRgb && <Badge variant="outline">RGB</Badge>}
                          {component.condition !== "NEW" && (
                            <Badge variant="secondary">{component.condition}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/shop/${component.name.toLowerCase().replace(/\s+/g, "-")}`} target="_blank">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/products/${component.id}`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteComponent(component.id)}
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

          {filteredComponents.length === 0 && (
            <div className="text-center py-12">
              <Box className="h-12 w-12 text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No components found</h3>
              <p className="text-muted mb-4">
                {searchQuery || selectedCategory !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Start by adding PC components to your inventory"
                }
              </p>
              {!searchQuery && selectedCategory === "all" && (
                <Link href="/admin/products/new?category=pc-components">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Component
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* Saved Builds Tab */}
      {activeTab === "builds" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-white/8 bg-surface overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Build Name</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Components</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {builds.map((build) => (
                  <TableRow key={build.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{build.name}</p>
                        {build.description && (
                          <p className="text-xs text-muted truncate max-w-48">{build.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{build.user.name}</p>
                        <p className="text-xs text-muted">{build.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {build.items.slice(0, 3).map((item, idx) => (
                          <p key={idx} className="text-xs text-muted">
                            {item.component.category.name}: {item.component.name}
                          </p>
                        ))}
                        {build.items.length > 3 && (
                          <p className="text-xs text-muted">+{build.items.length - 3} more</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>₹{build.totalPrice.toLocaleString()}</TableCell>
                    <TableCell>{new Date(build.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteBuild(build.id)}
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

          {builds.length === 0 && (
            <div className="text-center py-12">
              <Box className="h-12 w-12 text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No saved builds yet</h3>
              <p className="text-muted">Customer saved builds will appear here</p>
            </div>
          )}
        </div>
      )}

      {/* Compatibility Rules Tab */}
      {activeTab === "compatibility" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compatibility Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border border-white/8 bg-surface-elevated p-4">
                  <h3 className="font-semibold mb-2">Socket Compatibility</h3>
                  <p className="text-sm text-muted mb-3">
                    Manages CPU and motherboard socket compatibility
                  </p>
                  <Button variant="outline" size="sm">Configure Socket Rules</Button>
                </div>
                
                <div className="rounded-lg border border-white/8 bg-surface-elevated p-4">
                  <h3 className="font-semibold mb-2">RAM Compatibility</h3>
                  <p className="text-sm text-muted mb-3">
                    Manages DDR4/DDR5 and speed compatibility
                  </p>
                  <Button variant="outline" size="sm">Configure RAM Rules</Button>
                </div>
                
                <div className="rounded-lg border border-white/8 bg-surface-elevated p-4">
                  <h3 className="font-semibold mb-2">Power Requirements</h3>
                  <p className="text-sm text-muted mb-3">
                    Ensures PSU wattage meets component requirements
                  </p>
                  <Button variant="outline" size="sm">Configure Power Rules</Button>
                </div>
                
                <div className="rounded-lg border border-white/8 bg-surface-elevated p-4">
                  <h3 className="font-semibold mb-2">Case Size Compatibility</h3>
                  <p className="text-sm text-muted mb-3">
                    Manages motherboard and case form factor compatibility
                  </p>
                  <Button variant="outline" size="sm">Configure Size Rules</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}