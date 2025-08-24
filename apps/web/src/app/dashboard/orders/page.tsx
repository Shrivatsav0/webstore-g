"use client";

import { useState, useMemo, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  Search,
  Eye,
  Loader2,
  AlertCircle,
  Package,
  DollarSign,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  RefreshCw,
  ExternalLink,
  Download,
  Filter,
  X,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { SiteHeader } from "@/components/sidebar/site-header";

// Types
type Order = {
  id: number;
  lemonSqueezyOrderId: string | null;
  lemonSqueezyCheckoutId: string | null;
  userId: string | null;
  sessionId: string | null;
  mcUserId: number | null;
  customerEmail: string | null;
  customerName: string | null;
  status: string;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  checkoutUrl: string | null;
  receiptUrl: string | null;
  refunded: boolean;
  refundedAt: Date | null;
  testMode: boolean;
  deliveryStatus: string | null;
  deliveryAttempts: number | null;
  deliveredAt: Date | null;
  deliveryError: string | null;
  customFields: any;
  createdAt: Date;
  updatedAt: Date;
  mcUser: {
    id: number;
    minecraftUsername: string;
    isVerified: boolean | null;
  } | null;
};

type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  commands: string[] | null;
  createdAt: Date;
};

type OrderWithItems = Order & {
  items: OrderItem[];
};

export default function OrdersLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deliveryStatusFilter, setDeliveryStatusFilter] =
    useState<string>("all");
  const [testModeFilter, setTestModeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(
    null
  );
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Persistent stats state
  const [persistentStats, setPersistentStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    pendingDeliveries: 0,
  });

  const queryClient = useQueryClient();

  // Queries
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery(
    orpc.orders.list.queryOptions({
      input: {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        deliveryStatus:
          deliveryStatusFilter === "all" ? undefined : deliveryStatusFilter,
        testMode:
          testModeFilter === "all" ? undefined : testModeFilter === "true",
      },
    })
  );

  // Get all orders for persistent stats (without filters)
  const { data: allOrdersData } = useQuery(
    orpc.orders.list.queryOptions({
      input: {
        page: 1,
        limit: 1000, // Get a large number to calculate accurate stats
      },
    })
  );

  // Get single order query
  const { data: orderDetails, isLoading: orderDetailsLoading } = useQuery({
    ...orpc.orders.get.queryOptions({
      input: { id: selectedOrder?.id || 0 },
    }),
    enabled: !!selectedOrder?.id,
  });

  // Update persistent stats when all orders data changes
  useEffect(() => {
    if (allOrdersData?.data) {
      const data = allOrdersData.data;
      const totalOrders = allOrdersData.pagination.total;
      const completedOrders = data.filter(
        (o) => o.status === "completed"
      ).length;
      const totalRevenue = data.reduce((sum, o) => sum + o.total, 0) / 100;
      const pendingDeliveries = data.filter(
        (o) => o.deliveryStatus === "pending"
      ).length;

      setPersistentStats({
        totalOrders,
        completedOrders,
        totalRevenue,
        pendingDeliveries,
      });
    }
  }, [allOrdersData]);

  // Helper functions
  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount / 100);
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock },
      completed: { variant: "default" as const, icon: CheckCircle },
      failed: { variant: "destructive" as const, icon: XCircle },
      refunded: { variant: "outline" as const, icon: RefreshCw },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "secondary" as const,
      icon: Clock,
    };

    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="size-3" />
        {status}
      </Badge>
    );
  };

  const getDeliveryStatusBadge = (status: string | null) => {
    if (!status) return null;

    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock },
      delivered: { variant: "default" as const, icon: CheckCircle },
      failed: { variant: "destructive" as const, icon: XCircle },
      processing: { variant: "outline" as const, icon: Truck },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "secondary" as const,
      icon: Clock,
    };

    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="size-3" />
        {status}
      </Badge>
    );
  };

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order as OrderWithItems);
    setOrderDialogOpen(true);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDeliveryStatusFilter("all");
    setTestModeFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return (
      searchTerm ||
      statusFilter !== "all" ||
      deliveryStatusFilter !== "all" ||
      testModeFilter !== "all"
    );
  };

  // Components
  const StatCard = ({
    title,
    value,
    icon: Icon,
    format = "number",
    trend,
    trendValue,
    isLoading = false,
  }: {
    title: string;
    value: string | number;
    icon: any;
    format?: "number" | "currency";
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    isLoading?: boolean;
  }) => (
    <Card className="hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-2">
              {isLoading ? (
                <div className="h-8 w-20 bg-muted animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold">
                  {format === "currency" ? `$${value}` : value}
                </p>
              )}
              {trend && trendValue && (
                <div
                  className={`flex items-center gap-1 text-xs ${
                    trend === "up"
                      ? "text-green-600"
                      : trend === "down"
                      ? "text-red-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {trend === "up" ? (
                    <TrendingUp className="size-3" />
                  ) : trend === "down" ? (
                    <TrendingDown className="size-3" />
                  ) : null}
                  {trendValue}
                </div>
              )}
            </div>
          </div>
          <div
            className={`p-3 rounded-full transition-colors ${
              isLoading ? "bg-muted animate-pulse" : "bg-primary/10"
            }`}
          >
            <Icon
              className={`size-6 ${
                isLoading ? "text-muted-foreground" : "text-primary"
              }`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyOrders = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="p-6 rounded-full bg-muted/50 mb-6">
        <ShoppingCart className="size-16 text-muted-foreground" />
      </div>
      <h3 className="text-2xl font-semibold mb-2">No orders found</h3>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        {hasActiveFilters()
          ? "No orders match your current filters. Try adjusting your search or filter criteria."
          : "No orders have been placed yet. Orders will appear here once customers start making purchases."}
      </p>
      {hasActiveFilters() && (
        <Button variant="outline" onClick={clearAllFilters}>
          <X className="size-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      <SiteHeader title="Orders Logs" />
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-6 max-w-9xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Orders Logs
            </h1>
            <p className="text-muted-foreground">
              View and manage all customer orders and deliveries
            </p>
          </div>

          {/* Statistics - Now persistent */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              title="Total Orders"
              value={persistentStats.totalOrders}
              icon={ShoppingCart}
              isLoading={!allOrdersData}
            />
            <StatCard
              title="Completed Orders"
              value={persistentStats.completedOrders}
              icon={CheckCircle}
              isLoading={!allOrdersData}
            />
            <StatCard
              title="Total Revenue"
              value={persistentStats.totalRevenue}
              icon={DollarSign}
              format="currency"
              isLoading={!allOrdersData}
            />
            <StatCard
              title="Pending Deliveries"
              value={persistentStats.pendingDeliveries}
              icon={Truck}
              isLoading={!allOrdersData}
            />
          </div>

          {/* Enhanced Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Search and Filter Toggle */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                    <Input
                      placeholder="Search by order ID, customer name, email, or Minecraft username..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setFiltersExpanded(!filtersExpanded)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="size-4" />
                    Filters
                    {hasActiveFilters() && (
                      <Badge variant="secondary" className="ml-1">
                        {[
                          statusFilter !== "all" ? 1 : 0,
                          deliveryStatusFilter !== "all" ? 1 : 0,
                          testModeFilter !== "all" ? 1 : 0,
                        ].reduce((a, b) => a + b, 0)}
                      </Badge>
                    )}
                  </Button>
                  {hasActiveFilters() && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Expandable Filters */}
                {filtersExpanded && (
                  <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Order Status
                      </Label>
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Order Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Delivery Status
                      </Label>
                      <Select
                        value={deliveryStatusFilter}
                        onValueChange={setDeliveryStatusFilter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Delivery Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Delivery</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Mode</Label>
                      <Select
                        value={testModeFilter}
                        onValueChange={setTestModeFilter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Modes</SelectItem>
                          <SelectItem value="true">Test Mode</SelectItem>
                          <SelectItem value="false">Live Mode</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Filters Display */}
          {hasActiveFilters() && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {statusFilter}
                  <X
                    className="size-3 cursor-pointer hover:text-destructive"
                    onClick={() => setStatusFilter("all")}
                  />
                </Badge>
              )}
              {deliveryStatusFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Delivery: {deliveryStatusFilter}
                  <X
                    className="size-3 cursor-pointer hover:text-destructive"
                    onClick={() => setDeliveryStatusFilter("all")}
                  />
                </Badge>
              )}
              {testModeFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Mode: {testModeFilter === "true" ? "Test" : "Live"}
                  <X
                    className="size-3 cursor-pointer hover:text-destructive"
                    onClick={() => setTestModeFilter("all")}
                  />
                </Badge>
              )}
            </div>
          )}

          {/* Orders Table */}
          <Card>
            <CardContent className="p-0">
              {ordersLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center space-y-4">
                    <Loader2 className="size-8 animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading orders...</p>
                  </div>
                </div>
              ) : ordersData?.data.length === 0 ? (
                <EmptyOrders />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Minecraft User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersData?.data.map((order) => (
                        <TableRow
                          key={order.id}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <TableCell>
                            <div className="font-mono text-sm">
                              #{order.id}
                              {order.lemonSqueezyOrderId && (
                                <div className="text-xs text-muted-foreground">
                                  LS: {order.lemonSqueezyOrderId}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {order.customerName || "Unknown"}
                              </p>
                              <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {order.customerEmail || "No email"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {order.mcUser ? (
                              <div className="flex items-center gap-2">
                                <User className="size-4" />
                                <div>
                                  <p className="font-medium">
                                    {order.mcUser.minecraftUsername}
                                  </p>
                                  {order.mcUser.isVerified && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                No MC user
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {formatCurrency(order.total, order.currency)}
                              </p>
                              {order.refunded && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Refunded
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={order.testMode ? "secondary" : "default"}
                            >
                              {order.testMode ? "Test" : "Live"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDate(order.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewOrder(order)}
                                className="hover:bg-primary hover:text-primary-foreground transition-colors"
                              >
                                <Eye className="size-4" />
                              </Button>
                              {order.receiptUrl && (
                                <Button variant="outline" size="sm" asChild>
                                  <a
                                    href={order.receiptUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:bg-primary hover:text-primary-foreground transition-colors"
                                  >
                                    <ExternalLink className="size-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Pagination */}
          {ordersData && ordersData.pagination.totalPages > 1 && (
            <Card className="mt-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * 10 + 1} to{" "}
                    {Math.min(currentPage * 10, ordersData.pagination.total)} of{" "}
                    {ordersData.pagination.total} orders
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from(
                        {
                          length: Math.min(5, ordersData.pagination.totalPages),
                        },
                        (_, i) => {
                          const page = currentPage - 2 + i;
                          if (
                            page < 1 ||
                            page > ordersData.pagination.totalPages
                          )
                            return null;
                          return (
                            <Button
                              key={page}
                              variant={
                                page === currentPage ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          );
                        }
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={
                        currentPage === ordersData.pagination.totalPages
                      }
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(ordersData.pagination.totalPages)
                      }
                      disabled={
                        currentPage === ordersData.pagination.totalPages
                      }
                    >
                      Last
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Details Dialog - Enhanced */}
          <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="size-5" />
                  Order Details #{selectedOrder?.id}
                </DialogTitle>
                <DialogDescription>
                  Complete order information and delivery status
                </DialogDescription>
              </DialogHeader>

              {orderDetailsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center space-y-4">
                    <Loader2 className="size-6 animate-spin mx-auto" />
                    <p className="text-muted-foreground">
                      Loading order details...
                    </p>
                  </div>
                </div>
              ) : selectedOrder ? (
                <div className="space-y-6">
                  {/* Order Summary */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <ShoppingCart className="size-5" />
                          Order Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Order ID:
                          </span>
                          <span className="font-mono">#{selectedOrder.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          {getStatusBadge(selectedOrder.status)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-medium">
                            {formatCurrency(
                              selectedOrder.total,
                              selectedOrder.currency
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Created:
                          </span>
                          <span>{formatDate(selectedOrder.createdAt)}</span>
                        </div>
                        {selectedOrder.lemonSqueezyOrderId && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              LemonSqueezy ID:
                            </span>
                            <span className="font-mono text-sm">
                              {selectedOrder.lemonSqueezyOrderId}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="size-5" />
                          Customer & Delivery
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Customer:
                          </span>
                          <span>{selectedOrder.customerName || "Unknown"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="text-sm">
                            {selectedOrder.customerEmail || "No email"}
                          </span>
                        </div>
                        {selectedOrder.mcUser && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              MC Username:
                            </span>
                            <span className="font-medium">
                              {selectedOrder.mcUser.minecraftUsername}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Delivery Status:
                          </span>
                          {getDeliveryStatusBadge(selectedOrder.deliveryStatus)}
                        </div>
                        {selectedOrder.deliveryError && (
                          <div className="space-y-1">
                            <span className="text-muted-foreground text-sm">
                              Delivery Error:
                            </span>
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription className="text-sm">
                                {selectedOrder.deliveryError}
                              </AlertDescription>
                            </Alert>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Order Items */}
                  {orderDetails &&
                    orderDetails.items &&
                    orderDetails.items.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Package className="size-5" />
                            Order Items
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Product</TableHead>
                                  <TableHead>Quantity</TableHead>
                                  <TableHead>Price</TableHead>
                                  <TableHead>Total</TableHead>
                                  <TableHead>Commands</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {orderDetails.items.map((item: OrderItem) => (
                                  <TableRow key={item.id}>
                                    <TableCell>
                                      <div>
                                        <p className="font-medium">
                                          {item.productName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          Product ID: {item.productId}
                                        </p>
                                      </div>
                                    </TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>
                                      {formatCurrency(
                                        item.price,
                                        selectedOrder.currency
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {formatCurrency(
                                        item.total,
                                        selectedOrder.currency
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <div className="space-y-1 max-w-xs">
                                        {item.commands?.map(
                                          (command: string, index: number) => (
                                            <div
                                              key={index}
                                              className="text-xs font-mono bg-muted p-2 rounded break-all"
                                            >
                                              {command}
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                  {/* Delivery Actions */}
                  {selectedOrder.deliveryStatus !== "delivered" && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Truck className="size-5" />
                          Delivery Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Manual delivery status updates (if needed)
                        </p>
                        {/* Delivery action buttons would go here */}
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : null}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </>
  );
}
