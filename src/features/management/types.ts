export type ManagedCategory = {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  isActive: boolean;
  productCount: number;
};

export type ManagedProduct = {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  isAvailable: boolean;
  displayOrder: number;
};

export type ManagedTable = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  orderCount: number;
};
