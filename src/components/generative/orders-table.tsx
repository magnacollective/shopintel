"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Order } from "@/lib/shopify/types";

interface OrdersTableProps {
  orders: Order[];
}

const statusColor = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("paid") || s.includes("fulfilled")) return "default";
  if (s.includes("pending") || s.includes("partial")) return "secondary";
  if (s.includes("refund") || s.includes("void")) return "destructive";
  return "outline";
};

export function OrdersTable({ orders }: OrdersTableProps) {
  const formatCurrency = (amount: string, currency: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
      parseFloat(amount)
    );

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <Card className="w-full border border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Orders ({orders.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Order</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Customer</TableHead>
                <TableHead className="text-xs">Payment</TableHead>
                <TableHead className="text-xs">Fulfillment</TableHead>
                <TableHead className="text-xs text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="text-xs font-medium">
                    {order.name}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell className="text-xs">
                    {order.customer?.displayName || "Guest"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={statusColor(order.displayFinancialStatus)}
                      className="text-[10px]"
                    >
                      {order.displayFinancialStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={statusColor(order.displayFulfillmentStatus)}
                      className="text-[10px]"
                    >
                      {order.displayFulfillmentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-right font-medium">
                    {formatCurrency(
                      order.totalPriceSet.shopMoney.amount,
                      order.totalPriceSet.shopMoney.currencyCode
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
