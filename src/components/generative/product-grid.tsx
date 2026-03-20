"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/shopify/types";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const formatPrice = (amount: string, currency: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
      parseFloat(amount)
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden border border-border/50">
          {product.featuredImage && (
            <div className="aspect-square bg-muted relative overflow-hidden">
              <img
                src={product.featuredImage.url}
                alt={product.featuredImage.altText || product.title}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-medium text-sm truncate">{product.title}</h3>
                {product.vendor && (
                  <p className="text-xs text-muted-foreground">{product.vendor}</p>
                )}
              </div>
              <Badge
                variant={product.status === "ACTIVE" ? "default" : "secondary"}
                className="text-[10px] shrink-0"
              >
                {product.status}
              </Badge>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-semibold text-sm">
                {formatPrice(
                  product.priceRangeV2.minVariantPrice.amount,
                  product.priceRangeV2.minVariantPrice.currencyCode
                )}
                {product.priceRangeV2.minVariantPrice.amount !==
                  product.priceRangeV2.maxVariantPrice.amount && (
                  <>
                    {" - "}
                    {formatPrice(
                      product.priceRangeV2.maxVariantPrice.amount,
                      product.priceRangeV2.maxVariantPrice.currencyCode
                    )}
                  </>
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                {product.totalInventory} in stock
              </span>
            </div>
            {product.variants.nodes.length > 1 && (
              <p className="text-xs text-muted-foreground mt-1">
                {product.variants.nodes.length} variants
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
