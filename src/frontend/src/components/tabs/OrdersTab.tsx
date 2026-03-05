import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DieMaintenance, Order } from "../../backend.d";
import { OrderStatus } from "../../backend.d";
import { formatDate, getOrderStatusColor } from "../../utils/mes";
import { SubTabBar } from "../ui/SubTabBar";

interface OrdersTabProps {
  orders: Order[];
  overdueDies: DieMaintenance[];
  isLoading: boolean;
  filterBadge?: string;
}

const SUB_TABS = ["Order Execution", "Plan vs Actual", "Die Utilization"];

type StatusFilter = "All" | "open" | "inProgress" | "completed" | "delayed";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="mes-card p-2 text-xs shadow-lg">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} style={{ color: p.fill }}>
            {p.name}:{" "}
            {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function ExpandableOrderRow({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const pct = (order.completedMT / Math.max(order.totalMT, 1)) * 100;

  return (
    <>
      <TableRow
        className="border-border hover:bg-muted/20 cursor-pointer"
        onClick={() => setExpanded((p) => !p)}
      >
        <TableCell className="text-xs">
          <span className="text-muted-foreground">
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
        </TableCell>
        <TableCell className="text-xs font-mono font-semibold text-chart-2">
          {order.workOrderNo}
        </TableCell>
        <TableCell className="text-xs text-foreground truncate max-w-[120px]">
          {order.customerName}
        </TableCell>
        <TableCell className="text-xs font-mono">{order.alloyGrade}</TableCell>
        <TableCell className="text-xs font-mono">{order.dieNo}</TableCell>
        <TableCell className="text-xs font-mono text-right">
          {order.totalMT.toFixed(1)}
        </TableCell>
        <TableCell className="min-w-[120px]">
          <div className="flex items-center gap-2">
            <Progress value={pct} className="h-1.5 flex-1" />
            <span className="text-xs font-mono text-muted-foreground w-10 text-right">
              {pct.toFixed(0)}%
            </span>
          </div>
        </TableCell>
        <TableCell>
          <Badge
            variant="outline"
            className={`text-[10px] ${getOrderStatusColor(order.status)}`}
          >
            {order.status}
          </Badge>
        </TableCell>
        <TableCell className="text-xs font-mono text-muted-foreground">
          {formatDate(order.dueDate)}
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow className="border-border">
          <TableCell colSpan={9} className="p-0">
            <div className="px-6 py-4 bg-blue-50 border-t border-border/40">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                    Alloy Grade
                  </div>
                  <div className="text-xs font-mono text-chart-2">
                    {order.alloyGrade}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                    Die No
                  </div>
                  <div className="text-xs font-mono text-foreground">
                    {order.dieNo}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                    Plant
                  </div>
                  <div className="text-xs font-mono text-foreground">
                    {order.plantId || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                    Due Date
                  </div>
                  <div className="text-xs font-mono text-foreground">
                    {formatDate(order.dueDate)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                    Total MT
                  </div>
                  <div className="text-xs font-mono text-chart-1 font-bold">
                    {order.totalMT.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                    Completed MT
                  </div>
                  <div className="text-xs font-mono text-chart-3 font-bold">
                    {order.completedMT.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                    Remaining MT
                  </div>
                  <div className="text-xs font-mono text-yellow-400 font-bold">
                    {(order.totalMT - order.completedMT).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                    Customer
                  </div>
                  <div className="text-xs text-foreground">
                    {order.customerName}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                  Completion Progress
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={pct} className="h-3 flex-1" />
                  <span
                    className={`text-sm font-mono font-bold ${pct >= 100 ? "text-chart-3" : pct >= 50 ? "text-chart-2" : "text-yellow-400"}`}
                  >
                    {pct.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export function OrdersTab({
  orders,
  overdueDies,
  isLoading,
  filterBadge,
}: OrdersTabProps) {
  const [subTab, setSubTab] = useState(SUB_TABS[0]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  if (isLoading) {
    return (
      <div>
        <SubTabBar tabs={SUB_TABS} active={SUB_TABS[0]} onChange={() => {}} />
        <div className="p-4 space-y-4">
          <Skeleton className="h-24 bg-muted" />
          <Skeleton className="h-64 bg-muted" />
        </div>
      </div>
    );
  }

  const openOrders = orders.filter((o) => o.status === OrderStatus.open);
  const inProgressOrders = orders.filter(
    (o) => o.status === OrderStatus.inProgress,
  );
  const completedToday = orders.filter(
    (o) => o.status === OrderStatus.completed,
  );
  const delayedOrders = orders.filter((o) => o.status === OrderStatus.delayed);
  const onTimeDeliveryPct =
    orders.length > 0
      ? ((orders.length - delayedOrders.length) / orders.length) * 100
      : 0;
  const planAchievementPct =
    orders.length > 0
      ? (orders.reduce(
          (s, o) => s + o.completedMT / Math.max(o.totalMT, 1),
          0,
        ) /
          orders.length) *
        100
      : 0;

  const filteredOrders =
    statusFilter === "All"
      ? orders
      : orders.filter((o) => {
          if (statusFilter === "open") return o.status === OrderStatus.open;
          if (statusFilter === "inProgress")
            return o.status === OrderStatus.inProgress;
          if (statusFilter === "completed")
            return o.status === OrderStatus.completed;
          if (statusFilter === "delayed")
            return o.status === OrderStatus.delayed;
          return true;
        });

  const pendingData = [...inProgressOrders, ...openOrders]
    .slice(0, 10)
    .map((o) => ({
      name: o.workOrderNo,
      pending: o.totalMT - o.completedMT,
      completed: o.completedMT,
    }));

  // Order aging mock data
  const now = BigInt(Date.now()) * 1000000n;
  const day7 = 7n * 24n * 3600n * 1000000000n;
  const day14 = 14n * 24n * 3600n * 1000000000n;
  const ageLt7 = orders.filter((o) => now - o.dueDate < day7).length;
  const age7to14 = orders.filter(
    (o) => now - o.dueDate >= day7 && now - o.dueDate < day14,
  ).length;
  const ageGt14 = orders.filter((o) => now - o.dueDate >= day14).length;

  return (
    <div>
      <SubTabBar tabs={SUB_TABS} active={subTab} onChange={setSubTab} />
      {filterBadge && (
        <div
          className="flex items-center gap-3 px-4 py-2 border-b border-border/40"
          style={{ background: "#f8fafc" }}
        >
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Filter:
          </span>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded border"
            style={{
              background: "#eff6ff",
              color: "#1d4ed8",
              borderColor: "#bfdbfe",
            }}
          >
            {filterBadge}
          </span>
        </div>
      )}
      <div className="p-4 space-y-4">
        {/* Order Execution */}
        {subTab === "Order Execution" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="mes-card p-3 text-center">
                <div className="font-mono text-2xl font-bold text-chart-2">
                  {openOrders.length + inProgressOrders.length}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                  Open Orders
                </div>
              </div>
              <div className="mes-card p-3 text-center">
                <div className="font-mono text-2xl font-bold text-chart-3">
                  {completedToday.length}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                  Completed Today
                </div>
              </div>
              <div className="mes-card p-3 text-center">
                <div
                  className={`font-mono text-2xl font-bold ${delayedOrders.length > 0 ? "text-red-400" : "text-chart-3"}`}
                >
                  {delayedOrders.length}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                  Delayed Orders
                </div>
              </div>
              <div className="mes-card p-3 text-center">
                <div
                  className={`font-mono text-2xl font-bold ${onTimeDeliveryPct >= 95 ? "text-chart-3" : onTimeDeliveryPct >= 85 ? "text-yellow-400" : "text-red-400"}`}
                >
                  {onTimeDeliveryPct.toFixed(1)}%
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                  On-Time Delivery
                </div>
              </div>
            </div>

            <Card className="bg-card border-border">
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-sm">Orders Table</CardTitle>
                  <div className="flex items-center gap-3">
                    <Select
                      value={statusFilter}
                      onValueChange={(v) => setStatusFilter(v as StatusFilter)}
                    >
                      <SelectTrigger className="h-7 text-xs bg-secondary border-border w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="All" className="text-xs">
                          All Status
                        </SelectItem>
                        <SelectItem value="open" className="text-xs">
                          Open
                        </SelectItem>
                        <SelectItem value="inProgress" className="text-xs">
                          In Progress
                        </SelectItem>
                        <SelectItem value="completed" className="text-xs">
                          Completed
                        </SelectItem>
                        <SelectItem value="delayed" className="text-xs">
                          Delayed
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-muted-foreground">
                      Plan Achievement:{" "}
                      <span className="font-mono text-chart-1 font-semibold">
                        {planAchievementPct.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={planAchievementPct}
                      className="w-24 h-1.5"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-xs text-muted-foreground h-8 w-8" />
                        <TableHead className="text-xs text-muted-foreground h-8">
                          Work Order
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground h-8">
                          Customer
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground h-8">
                          Alloy
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground h-8">
                          Die
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground h-8 text-right">
                          Total MT
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground h-8">
                          Progress
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground h-8">
                          Status
                        </TableHead>
                        <TableHead className="text-xs text-muted-foreground h-8">
                          Due Date
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="text-center text-muted-foreground text-xs py-8"
                          >
                            No orders found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredOrders.map((order) => (
                          <ExpandableOrderRow key={order.id} order={order} />
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Plan vs Actual */}
        {subTab === "Plan vs Actual" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
              <div className="mes-card p-3 text-center">
                <div
                  className={`font-mono text-2xl font-bold ${planAchievementPct >= 90 ? "text-chart-3" : planAchievementPct >= 75 ? "text-yellow-400" : "text-red-400"}`}
                >
                  {planAchievementPct.toFixed(1)}%
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                  Plan Achievement
                </div>
              </div>
              <div className="mes-card p-3 text-center">
                <div className="font-mono text-2xl font-bold text-chart-2">
                  {orders
                    .reduce((s, o) => s + (o.totalMT - o.completedMT), 0)
                    .toFixed(1)}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                  Pending MT
                </div>
              </div>
              <div className="mes-card p-3 text-center">
                <div
                  className={`font-mono text-2xl font-bold ${delayedOrders.length > 0 ? "text-red-400" : "text-chart-3"}`}
                >
                  {delayedOrders.length}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                  Delayed Orders
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">
                    Pending MT by Work Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  {pendingData.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-muted-foreground text-xs">
                      No open orders
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={pendingData}
                        margin={{ top: 0, right: 8, left: -20, bottom: 30 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="oklch(0.28 0.015 240)"
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 9, fill: "oklch(0.55 0.01 240)" }}
                          angle={-30}
                          textAnchor="end"
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "oklch(0.55 0.01 240)" }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="completed"
                          name="Completed MT"
                          stackId="a"
                          fill="#10b981"
                        />
                        <Bar
                          dataKey="pending"
                          name="Pending MT"
                          stackId="a"
                          fill="#d97706"
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Order Aging */}
              <Card className="bg-card border-border">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">Order Aging Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {[
                      {
                        label: "< 7 Days",
                        count: ageLt7,
                        color: "text-chart-3",
                        bar: "#10b981",
                      },
                      {
                        label: "7–14 Days",
                        count: age7to14,
                        color: "text-yellow-400",
                        bar: "#d97706",
                      },
                      {
                        label: "> 14 Days",
                        count: ageGt14,
                        color: "text-red-400",
                        bar: "#ef4444",
                      },
                    ].map((bucket) => (
                      <div key={bucket.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium">{bucket.label}</span>
                          <span
                            className={`font-mono font-bold ${bucket.color}`}
                          >
                            {bucket.count} orders
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width:
                                orders.length > 0
                                  ? `${(bucket.count / orders.length) * 100}%`
                                  : "0%",
                              backgroundColor: bucket.bar,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/40">
                    <div className="text-[10px] text-muted-foreground">
                      Plan Achievement Progress
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress
                        value={planAchievementPct}
                        className="h-2 flex-1"
                      />
                      <span
                        className={`font-mono text-xs font-bold ${planAchievementPct >= 90 ? "text-chart-3" : "text-yellow-400"}`}
                      >
                        {planAchievementPct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Die Utilization */}
        {subTab === "Die Utilization" && (
          <Card className="bg-card border-border">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">Die Health Status</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-xs text-muted-foreground h-8">
                        Die No
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Shots Completed
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Shot Life
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8 text-right">
                        Change Freq
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8">
                        Shot Life %
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground h-8">
                        Maint Due
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overdueDies.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-xs text-muted-foreground text-center py-4"
                        >
                          All dies within service life
                        </TableCell>
                      </TableRow>
                    ) : (
                      overdueDies.map((die) => {
                        const pct =
                          die.shotLife > 0
                            ? (Number(die.shotsCompleted) /
                                Number(die.shotLife)) *
                              100
                            : 0;
                        return (
                          <TableRow
                            key={die.dieNo}
                            className="border-border hover:bg-muted/20"
                          >
                            <TableCell className="text-xs font-mono font-semibold">
                              {die.dieNo}
                            </TableCell>
                            <TableCell className="text-xs font-mono text-right">
                              {die.shotsCompleted.toString()}
                            </TableCell>
                            <TableCell className="text-xs font-mono text-right">
                              {die.shotLife.toString()}
                            </TableCell>
                            <TableCell className="text-xs font-mono text-right text-muted-foreground">
                              {die.changeFrequency?.toString() ?? "—"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 min-w-[100px]">
                                <Progress
                                  value={pct}
                                  className="h-1.5 flex-1"
                                />
                                <span
                                  className={`text-[10px] font-mono ${pct >= 100 ? "text-red-400" : pct >= 80 ? "text-yellow-400" : "text-chart-3"}`}
                                >
                                  {pct.toFixed(0)}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs font-mono text-red-400">
                              {formatDate(die.maintenanceDue)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
