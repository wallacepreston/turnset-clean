// Shopify Product Types
export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  featuredImage?: {
    url: string;
    altText?: string;
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  title: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  availableForSale: boolean;
}

// Shopify GraphQL Response Types
export interface ShopifyProductNode {
  id: string;
  title: string;
  handle: string;
  description: string;
  featuredImage?: {
    url: string;
    altText?: string | null;
  } | null;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: {
          amount: string;
          currencyCode: string;
        };
        availableForSale: boolean;
      };
    }>;
  };
}

export interface ShopifyProductsResponse {
  data: {
    products: {
      edges: Array<{
        node: ShopifyProductNode;
      }>;
    };
  };
}

export interface ShopifyProductResponse {
  data: {
    product: ShopifyProductNode | null;
  };
}

// Sanity CMS Types
export interface HomepageContent {
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaText?: string;
  heroCtaLink?: string;
  testimonials?: Array<{
    name?: string;
    quote?: string;
    role?: string;
    avatar?: any; // Sanity image reference
  }>;
}

export interface PageContent {
  title?: string;
  slug?: {
    current?: string;
  };
  content?: any; // Rich text/portable text
}

// Shopify Cart Types
export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
  lines: {
    edges: Array<{
      node: CartLine;
    }>;
  };
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      title: string;
      handle: string;
      featuredImage?: {
        url: string;
        altText?: string;
      };
    };
    price: {
      amount: string;
      currencyCode: string;
    };
  };
}

