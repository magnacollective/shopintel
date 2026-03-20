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

interface InventoryItem {
  productTitle: string;
  totalInventory: number;
  isLowStock: boolean;
  variants: {
    variantTitle: string;
    sku: string | null;
    quantity: number | null;
    price: string;
    isLowStock: boolean;
  }[];
}

interface InventoryTableProps {
  inventory: InventoryItem[];
  lowStockCount: number;
  threshold: number;
}

export function InventoryTable({
  inventory,
  lowStockCount,
  threshold,
}: InventoryTableProps) {
  return (
    <Card className="w-full border border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Inventory Levels</CardTitle>
          {lowStockCount > 0 && (
            <Badge variant="destructive" className="text-[10px]">
              {lowStockCount} low stock
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Low stock threshold: {threshold} units
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Product</TableHead>
                <TableHead className="text-xs">Variant</TableHead>
                <TableHead className="text-xs">SKU</TableHead>
                <TableHead className="text-xs text-right">Stock</TableHead>
                <TableHead className="text-xs text-right">Price</TableHead>
                <TableHead className="text-xs text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.flatMap((item) =>
                item.variants.map((variant, idx) => (
                  <TableRow
                    key={`${item.productTitle}-${variant.variantTitle}`}
                    className={variant.isLowStock ? "bg-red-500/10" : ""}
                  >
                    <TableCell className="text-xs font-medium">
                      {idx === 0 ? item.productTitle : ""}
                    </TableCell>
                    <TableCell className="text-xs">
                      {variant.variantTitle !== "Default Title"
                        ? variant.variantTitle
                        : "-"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {variant.sku || "-"}
                    </TableCell>
                    <TableCell className="text-xs text-right font-medium">
                      {variant.quantity ?? 0}
                    </TableCell>
                    <TableCell className="text-xs text-right">
                      ${variant.price}
                    </TableCell>
                    <TableCell className="text-center">
                      {variant.isLowStock ? (
                        <Badge variant="destructive" className="text-[10px]">
                          Low
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          OK
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
