export interface Money {
  amount: string;
  currencyCode: string;
}

export interface ProductImage {
  url: string;
  altText: string | null;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: string;
  inventoryQuantity: number | null;
  sku: string | null;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  productType: string;
  vendor: string;
  status: string;
  totalInventory: number;
  createdAt: string;
  updatedAt: string;
  featuredImage: ProductImage | null;
  variants: {
    nodes: ProductVariant[];
  };
  priceRangeV2: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
}

export interface Order {
  id: string;
  name: string;
  createdAt: string;
  displayFinancialStatus: string;
  displayFulfillmentStatus: string;
  totalPriceSet: { shopMoney: Money };
  subtotalPriceSet: { shopMoney: Money };
  totalShippingPriceSet: { shopMoney: Money };
  totalTaxSet: { shopMoney: Money };
  customer: {
    id: string;
    displayName: string;
    email: string;
  } | null;
  lineItems: {
    nodes: {
      title: string;
      quantity: number;
      originalTotalSet: { shopMoney: Money };
    }[];
  };
}

export interface Customer {
  id: string;
  displayName: string;
  email: string;
  phone: string | null;
  numberOfOrders: string;
  amountSpent: Money;
  createdAt: string;
  updatedAt: string;
  defaultAddress: {
    city: string | null;
    province: string | null;
    country: string | null;
  } | null;
}

export interface InventoryItem {
  id: string;
  variant: {
    id: string;
    title: string;
    product: {
      title: string;
    };
  };
  inventoryLevels: {
    nodes: {
      available: number;
      location: {
        name: string;
      };
    }[];
  };
}
