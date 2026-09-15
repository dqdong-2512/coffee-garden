export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface CatalogProduct {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string | null;
}

export interface CustomerCatalog {
  branch: { id: string; name: string };
  table: { id: string; code: string; name: string };
  categories: CatalogCategory[];
  products: CatalogProduct[];
}
