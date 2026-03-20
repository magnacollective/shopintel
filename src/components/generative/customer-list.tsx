"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Customer } from "@/lib/shopify/types";

interface CustomerListProps {
  customers: Customer[];
}

export function CustomerList({ customers }: CustomerListProps) {
  const formatCurrency = (amount: string, currency: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
      parseFloat(amount)
    );

  return (
    <Card className="w-full border border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Customers ({customers.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">
                    {customer.displayName}
                  </p>
                  {parseInt(customer.numberOfOrders) >= 5 && (
                    <Badge variant="secondary" className="text-[10px]">
                      Loyal
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {customer.email}
                </p>
                {customer.defaultAddress && (
                  <p className="text-xs text-muted-foreground">
                    {[
                      customer.defaultAddress.city,
                      customer.defaultAddress.province,
                      customer.defaultAddress.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-sm font-semibold">
                  {formatCurrency(
                    customer.amountSpent.amount,
                    customer.amountSpent.currencyCode
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {customer.numberOfOrders} order
                  {customer.numberOfOrders !== "1" ? "s" : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
