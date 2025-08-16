"use client";

import { useState, useMemo } from "react";
import { z } from "zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingBag,
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  AlertCircle,
  Loader2,
  Eye,
  DollarSign,
  TrendingUp,
  Activity,
  FolderOpen,
  PackageOpen,
} from "lucide-react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { SiteHeader } from "@/components/sidebar/site-header";
import { ImageUpload } from "@/components/image-upload";
import { Switch } from "@/components/ui/switch";

// Types
type Category = {
  id: number;
  title: string;
  description: string;
  image: string;
  badge?: string | null;
  href?: string | null;
  count: number;
  createdAt: Date;
  updatedAt: Date;
};

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string | null;
  stock: number | null;
  isActive: boolean | null;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: number;
    title: string;
  } | null;
};

// Validation schemas
const categorySchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z
    .string()
    .min(5, "Description too short")
    .max(500, "Description too long"),
  image: z.string().url("Invalid image URL"),
  badge: z.string().max(50, "Badge too long").optional(),
  href: z.string().max(200, "URL too long").optional(),
});

const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  description: z
    .string()
    .min(10, "Description too short")
    .max(1000, "Description too long"),
  price: z.number().min(0, "Price must be positive"),
  image: z.string().url("Invalid image URL").optional(),
  categoryId: z.number().min(1, "Category is required"),
  stock: z.number().min(0, "Stock must be non-negative").default(0),
  isActive: z.boolean().default(true),
});

export default function CategoriesProductsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<
    number | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);

  const queryClient = useQueryClient();

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    title: "",
    description: "",
    image: "",
    badge: "",
    href: "",
  });

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: 0,
    image: "",
    categoryId: 0,
    stock: 0,
    isActive: true,
  });

  // Queries
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery(orpc.categories.list.queryOptions({}));

  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery(
    orpc.products.list.queryOptions({
      input: {
        page: currentPage,
        limit: 10,
        categoryId: selectedCategoryFilter || undefined,
        search: searchTerm || undefined,
      },
    })
  );

  // Mutations
  const createCategoryMutation = useMutation(
    orpc.categories.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.categories.list.key({}),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.products.list.key(),
        });
        setCategoryDialogOpen(false);
        resetCategoryForm();
        setErrors([]);
      },
      onError: (error: any) => {
        setErrors([error.message || "Failed to create category"]);
      },
    })
  );

  const updateCategoryMutation = useMutation(
    orpc.categories.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.categories.list.key({}),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.products.list.key(),
        });
        setCategoryDialogOpen(false);
        setEditingCategory(null);
        resetCategoryForm();
        setErrors([]);
      },
      onError: (error: any) => {
        setErrors([error.message || "Failed to update category"]);
      },
    })
  );

  const deleteCategoryMutation = useMutation(
    orpc.categories.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.categories.list.key({}),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.products.list.key(),
        });
      },
      onError: (error: any) => {
        setErrors([error.message || "Failed to delete category"]);
      },
    })
  );

  const createProductMutation = useMutation(
    orpc.products.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.products.list.key(),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.categories.list.key({}),
        });
        setProductDialogOpen(false);
        resetProductForm();
        setErrors([]);
      },
      onError: (error: any) => {
        setErrors([error.message || "Failed to create product"]);
      },
    })
  );

  const updateProductMutation = useMutation(
    orpc.products.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.products.list.key(),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.categories.list.key({}),
        });
        setProductDialogOpen(false);
        setEditingProduct(null);
        resetProductForm();
        setErrors([]);
      },
      onError: (error: any) => {
        setErrors([error.message || "Failed to update product"]);
      },
    })
  );

  const deleteProductMutation = useMutation(
    orpc.products.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.products.list.key(),
        });
        queryClient.invalidateQueries({
          queryKey: orpc.categories.list.key({}),
        });
      },
      onError: (error: any) => {
        setErrors([error.message || "Failed to delete product"]);
      },
    })
  );

  // Helper functions
  const resetCategoryForm = () => {
    setCategoryForm({
      title: "",
      description: "",
      image: "",
      badge: "",
      href: "",
    });
  };

  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: 0,
      image: "",
      categoryId: 0,
      stock: 0,
      isActive: true,
    });
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      title: category.title,
      description: category.description,
      image: category.image,
      badge: category.badge || "",
      href: category.href || "",
    });
    setCategoryDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image || "",
      categoryId: product.categoryId,
      stock: product.stock || 0,
      isActive: product.isActive ?? true,
    });
    setProductDialogOpen(true);
  };

  const handleCategorySubmit = () => {
    try {
      const validatedData = categorySchema.parse(categoryForm);

      if (editingCategory) {
        updateCategoryMutation.mutate({
          id: editingCategory.id,
          ...validatedData,
        });
      } else {
        createCategoryMutation.mutate(validatedData);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.issues.map((e) => e.message));
      }
    }
  };

  const handleProductSubmit = () => {
    try {
      const validatedData = productSchema.parse(productForm);

      if (editingProduct) {
        updateProductMutation.mutate({
          id: editingProduct.id,
          ...validatedData,
        });
      } else {
        createProductMutation.mutate(validatedData);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.issues.map((e) => e.message));
      }
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const totalCategories = categories?.length || 0;
    const totalProducts = productsData?.pagination.total || 0;
    const activeProducts =
      productsData?.data.filter((p) => p.isActive).length || 0;
    const totalValue =
      productsData?.data.reduce(
        (sum, p) => sum + p.price * (p.stock || 0),
        0
      ) || 0;

    return {
      totalCategories,
      totalProducts,
      activeProducts,
      totalValue: totalValue / 100,
    };
  }, [categories, productsData]);

  // Components
  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    trend = "up",
  }: {
    title: string;
    value: string | number;
    change?: string;
    icon: any;
    trend?: "up" | "down" | "neutral";
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p
                className={`text-sm flex items-center gap-1 ${
                  trend === "up"
                    ? "text-green-600"
                    : trend === "down"
                    ? "text-red-600"
                    : "text-muted-foreground"
                }`}
              >
                <TrendingUp className="size-3" />
                {change}
              </p>
            )}
          </div>
          <div className="p-3 rounded-full bg-primary/10">
            <Icon className="size-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ErrorAlert = () => {
    if (errors.length === 0) return null;

    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="font-medium mb-2">
            Please fix the following errors:
          </div>
          <ul className="space-y-1 text-sm">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    );
  };

  // Empty State Components
  const EmptyCategories = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="p-6 rounded-full bg-muted/50 mb-6">
        <FolderOpen className="size-16 text-muted-foreground" />
      </div>
      <h3 className="text-2xl font-semibold mb-2">No categories yet</h3>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        Categories help organize your products. Create your first category to
        get started with organizing your inventory.
      </p>
      <Button
        size="lg"
        onClick={() => {
          setEditingCategory(null);
          resetCategoryForm();
          setErrors([]);
          setCategoryDialogOpen(true);
        }}
      >
        <Plus className="size-4 mr-2" />
        Create Your First Category
      </Button>
    </div>
  );

  const EmptyProducts = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="p-6 rounded-full bg-muted/50 mb-6">
        <PackageOpen className="size-16 text-muted-foreground" />
      </div>
      <h3 className="text-2xl font-semibold mb-2">No products found</h3>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        {categories?.length === 0
          ? "You need to create at least one category before adding products. Categories help organize your inventory."
          : searchTerm || selectedCategoryFilter
          ? "No products match your current filters. Try adjusting your search or filter criteria."
          : "Start building your inventory by adding your first product."}
      </p>
      <div className="flex gap-3">
        {categories?.length === 0 ? (
          <Button
            size="lg"
            onClick={() => {
              setEditingCategory(null);
              resetCategoryForm();
              setErrors([]);
              setCategoryDialogOpen(true);
            }}
          >
            <Plus className="size-4 mr-2" />
            Create Category First
          </Button>
        ) : (
          <>
            {(searchTerm || selectedCategoryFilter) && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategoryFilter(null);
                }}
              >
                Clear Filters
              </Button>
            )}
            <Button
              size="lg"
              onClick={() => {
                setEditingProduct(null);
                resetProductForm();
                setErrors([]);
                setProductDialogOpen(true);
              }}
            >
              <Plus className="size-4 mr-2" />
              Add Your First Product
            </Button>
          </>
        )}
      </div>
    </div>
  );

  const EmptyOverviewCategories = () => (
    <div className="flex flex-col items-center justify-center p-8">
      <FolderOpen className="size-12 text-muted-foreground mb-3" />
      <h4 className="font-medium text-muted-foreground mb-2">No categories</h4>
      <p className="text-sm text-muted-foreground text-center mb-4">
        Create categories to organize your products
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setActiveTab("categories");
          setEditingCategory(null);
          resetCategoryForm();
          setErrors([]);
          setCategoryDialogOpen(true);
        }}
      >
        <Plus className="size-3 mr-1" />
        Add Category
      </Button>
    </div>
  );

  const EmptyOverviewProducts = () => (
    <div className="flex flex-col items-center justify-center p-8">
      <PackageOpen className="size-12 text-muted-foreground mb-3" />
      <h4 className="font-medium text-muted-foreground mb-2">No products</h4>
      <p className="text-sm text-muted-foreground text-center mb-4">
        Add products to start building your inventory
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setActiveTab("products");
          if ((categories?.length ?? 0) > 0) {
            setEditingProduct(null);
            resetProductForm();
            setErrors([]);
            setProductDialogOpen(true);
          }
        }}
        disabled={(categories?.length ?? 0) === 0}
      >
        <Plus className="size-3 mr-1" />
        {(categories?.length ?? 0) === 0
          ? "Need Categories First"
          : "Add Product"}
      </Button>
    </div>
  );

  return (
    <>
      <SiteHeader title="Categories & Products Dashboard" />
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-6 max-w-9xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Categories & Products Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your product categories and inventory
            </p>
          </div>

          <ErrorAlert />

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Activity className="size-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="flex items-center gap-2"
              >
                <ShoppingBag className="size-4" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="size-4" />
                Products
              </TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  title="Total Categories"
                  value={stats.totalCategories}
                  icon={ShoppingBag}
                />
                <StatCard
                  title="Total Products"
                  value={stats.totalProducts}
                  icon={Package}
                />
                <StatCard
                  title="Active Products"
                  value={stats.activeProducts}
                  icon={Eye}
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Categories</CardTitle>
                    <CardDescription>Latest category additions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {categoriesLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="size-6 animate-spin" />
                      </div>
                    ) : categories?.length === 0 ? (
                      <EmptyOverviewCategories />
                    ) : (
                      <div className="space-y-3">
                        {categories?.slice(0, 5).map((category) => (
                          <div
                            key={category.id}
                            className="flex items-center gap-3"
                          >
                            <img
                              src={category.image}
                              alt={category.title}
                              className="size-10 rounded object-cover"
                            />
                            <div className="flex-1">
                              <p className="font-medium">{category.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {category.count} products
                              </p>
                            </div>
                            {category.badge && (
                              <Badge variant="secondary">
                                {category.badge}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Products</CardTitle>
                    <CardDescription>Latest product additions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {productsLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="size-6 animate-spin" />
                      </div>
                    ) : productsData?.data.length === 0 ? (
                      <EmptyOverviewProducts />
                    ) : (
                      <div className="space-y-3">
                        {productsData?.data.slice(0, 5).map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-3"
                          >
                            {product.image && (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="size-10 rounded object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                ${(product.price / 100).toFixed(2)} •{" "}
                                {product.category?.title || "No Category"}
                              </p>
                            </div>
                            <Badge
                              variant={
                                product.isActive ? "default" : "secondary"
                              }
                            >
                              {product.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* CATEGORIES TAB */}
            <TabsContent value="categories" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Categories</h2>
                  <p className="text-muted-foreground">
                    Manage your product categories
                  </p>
                </div>
                <Dialog
                  open={categoryDialogOpen}
                  onOpenChange={setCategoryDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setEditingCategory(null);
                        resetCategoryForm();
                        setErrors([]);
                      }}
                    >
                      <Plus className="size-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingCategory ? "Edit Category" : "Add Category"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingCategory
                          ? "Update the category details below."
                          : "Create a new category for your products."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={categoryForm.title}
                          onChange={(e) =>
                            setCategoryForm({
                              ...categoryForm,
                              title: e.target.value,
                            })
                          }
                          placeholder="Category title"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={categoryForm.description}
                          onChange={(e) =>
                            setCategoryForm({
                              ...categoryForm,
                              description: e.target.value,
                            })
                          }
                          placeholder="Category description"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="image">Image</Label>
                        <ImageUpload
                          value={categoryForm.image}
                          onChange={(url) =>
                            setCategoryForm({
                              ...categoryForm,
                              image: url,
                            })
                          }
                          onRemove={() =>
                            setCategoryForm({
                              ...categoryForm,
                              image: "",
                            })
                          }
                          folder="categories"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="badge">Badge</Label>
                        <Input
                          id="badge"
                          value={categoryForm.badge}
                          onChange={(e) =>
                            setCategoryForm({
                              ...categoryForm,
                              badge: e.target.value,
                            })
                          }
                          placeholder="New, Popular, etc."
                        />
                      </div>
                      {/* <div className="grid gap-2">
                        <Label htmlFor="href">Link (Optional)</Label>
                        <Input
                          id="href"
                          value={categoryForm.href}
                          onChange={(e) =>
                            setCategoryForm({
                              ...categoryForm,
                              href: e.target.value,
                            })
                          }
                          placeholder="/categories/electronics"
                        />
                      </div> */}
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        onClick={handleCategorySubmit}
                        disabled={
                          createCategoryMutation.isPending ||
                          updateCategoryMutation.isPending
                        }
                      >
                        {(createCategoryMutation.isPending ||
                          updateCategoryMutation.isPending) && (
                          <Loader2 className="size-4 mr-2 animate-spin" />
                        )}
                        {editingCategory ? "Update" : "Create"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-0">
                  {categoriesLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="size-8 animate-spin" />
                    </div>
                  ) : categories?.length === 0 ? (
                    <EmptyCategories />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Products</TableHead>
                          <TableHead>Badge</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories?.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img
                                  src={category.image}
                                  alt={category.title}
                                  className="size-10 rounded object-cover"
                                />
                                <div>
                                  <p className="font-medium">
                                    {category.title}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    ID: {category.id}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <p className="truncate">{category.description}</p>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{category.count}</Badge>
                            </TableCell>
                            <TableCell>
                              {category.badge && (
                                <Badge variant="secondary">
                                  {category.badge}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditCategory(category)}
                                >
                                  <Edit className="size-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    deleteCategoryMutation.mutate({
                                      id: category.id,
                                    })
                                  }
                                  disabled={deleteCategoryMutation.isPending}
                                >
                                  {deleteCategoryMutation.isPending ? (
                                    <Loader2 className="size-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="size-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* PRODUCTS TAB */}
            <TabsContent value="products" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Products</h2>
                  <p className="text-muted-foreground">
                    Manage your product inventory
                  </p>
                </div>
                <Dialog
                  open={productDialogOpen}
                  onOpenChange={setProductDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setEditingProduct(null);
                        resetProductForm();
                        setErrors([]);
                      }}
                      disabled={categories?.length === 0}
                    >
                      <Plus className="size-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] flex flex-col max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? "Edit Product" : "Add Product"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingProduct
                          ? "Update the product details below."
                          : "Fill in the details to create a new product."}
                      </DialogDescription>
                    </DialogHeader>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto pr-1 space-y-6 py-4">
                      {/* BASIC INFO */}
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                          Basic Information
                        </h4>
                        <div className="grid gap-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={productForm.name}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                name: e.target.value,
                              })
                            }
                            placeholder="Product name"
                          />
                        </div>
                        <div className="grid gap-2 mt-3">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={productForm.description}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                description: e.target.value,
                              })
                            }
                            placeholder="Product description"
                          />
                        </div>
                      </div>

                      {/* PRICING & STOCK */}
                      <div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="price">Price</Label>
                            <div className="relative">
                              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                                $
                              </span>
                              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                                USD
                              </span>
                              <Input
                                id="price"
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                min={0}
                                className="pl-8 pr-10"
                                value={(productForm.price / 100).toFixed(2)}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  if (raw.trim() === "") {
                                    setProductForm({
                                      ...productForm,
                                      price: 0,
                                    });
                                    return;
                                  }
                                  const num = Number.parseFloat(raw);
                                  const clamped = Number.isFinite(num)
                                    ? Math.max(0, num)
                                    : 0;
                                  setProductForm({
                                    ...productForm,
                                    price: Math.round(clamped * 100),
                                  });
                                }}
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                          {/* <div className="grid gap-2">
                            <Label htmlFor="stock">Stock</Label>
                            <Input
                              id="stock"
                              type="number"
                              value={productForm.stock}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  stock: parseInt(e.target.value) || 0,
                                })
                              }
                              placeholder="0"
                            />
                            {productForm.stock > 0 ? (
                              <Badge variant="default">In Stock</Badge>
                            ) : (
                              <Badge variant="destructive">Out of Stock</Badge>
                            )}
                          </div> */}
                        </div>
                      </div>

                      {/* <div className="mt-4">
                        <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                          Stock Management
                        </h4>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="enableStock">
                            Enable Stock Tracking
                          </Label>
                          <Switch
                            id="enableStock"
                            checked={productForm.stock !== null}
                            onCheckedChange={(checked) =>
                              setProductForm({
                                ...productForm,
                                stock: checked ? 0 : null,
                              })
                            }
                          />
                        </div>

                        {productForm.stock !== null && (
                          <div className="grid gap-2 mt-3">
                            <Label htmlFor="stock">Stock Quantity</Label>
                            <Input
                              id="stock"
                              type="number"
                              min={0} // ✅ HTML-level restriction
                              value={productForm.stock ?? 0}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  stock: Math.max(
                                    0,
                                    parseInt(e.target.value) || 0
                                  ), // ✅ JS-level restriction
                                })
                              }
                              placeholder="0"
                            />
                            {productForm.stock > 0 ? (
                              <Badge variant="default">In Stock</Badge>
                            ) : (
                              <Badge variant="destructive">Out of Stock</Badge>
                            )}
                          </div>
                        )}
                      </div> */}

                      {/* CATEGORY */}
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                          Category
                        </h4>
                        <Select
                          value={
                            productForm.categoryId
                              ? productForm.categoryId.toString()
                              : undefined
                          }
                          onValueChange={(value) =>
                            setProductForm({
                              ...productForm,
                              categoryId: parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem
                                key={category.id}
                                value={category.id.toString()}
                              >
                                {category.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {categories?.length === 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              setProductDialogOpen(false);
                              setActiveTab("categories");
                              setCategoryDialogOpen(true);
                            }}
                          >
                            <Plus className="size-3 mr-1" /> Create Category
                          </Button>
                        )}
                      </div>

                      {/* IMAGE UPLOAD */}
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                          Product Image
                        </h4>
                        <ImageUpload
                          value={productForm.image}
                          onChange={(url) =>
                            setProductForm({
                              ...productForm,
                              image: url,
                            })
                          }
                          onRemove={() =>
                            setProductForm({
                              ...productForm,
                              image: "",
                            })
                          }
                          folder="products"
                        />
                      </div>

                      {/* STATUS */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={productForm.isActive}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              isActive: e.target.checked,
                            })
                          }
                        />
                        <Label htmlFor="isActive">Active</Label>
                      </div>
                    </div>

                    {/* Sticky footer */}
                    <DialogFooter className="border-t pt-3 bg-background sticky bottom-0">
                      <Button
                        type="submit"
                        onClick={handleProductSubmit}
                        disabled={
                          createProductMutation.isPending ||
                          updateProductMutation.isPending
                        }
                      >
                        {(createProductMutation.isPending ||
                          updateProductMutation.isPending) && (
                          <Loader2 className="size-4 mr-2 animate-spin" />
                        )}
                        {editingProduct ? "Update Product" : "Create Product"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4 items-center">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                        <Input
                          placeholder="Search products..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select
                      value={selectedCategoryFilter?.toString() || "all"}
                      onValueChange={(value) =>
                        setSelectedCategoryFilter(
                          value === "all" ? null : parseInt(value)
                        )
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories?.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-0">
                  {productsLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="size-8 animate-spin" />
                    </div>
                  ) : productsData?.data.length === 0 ? (
                    <EmptyProducts />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productsData?.data.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {product.image && (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="size-10 rounded object-cover"
                                  />
                                )}
                                <div>
                                  <p className="font-medium">{product.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    ID: {product.id}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {product.category?.title || "No Category"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              ${(product.price / 100).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  (product.stock || 0) > 0
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {product.stock || 0}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  product.isActive ? "default" : "secondary"
                                }
                              >
                                {product.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleEditProduct({
                                      ...product,
                                      categoryId: product.category?.id ?? 0,
                                    })
                                  }
                                >
                                  <Edit className="size-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    deleteProductMutation.mutate({
                                      id: product.id,
                                    })
                                  }
                                  disabled={deleteProductMutation.isPending}
                                >
                                  {deleteProductMutation.isPending ? (
                                    <Loader2 className="size-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="size-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Pagination */}
              {productsData && productsData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * 10 + 1} to{" "}
                    {Math.min(currentPage * 10, productsData.pagination.total)}{" "}
                    of {productsData.pagination.total} products
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {productsData.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={
                        currentPage === productsData.pagination.totalPages
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}
