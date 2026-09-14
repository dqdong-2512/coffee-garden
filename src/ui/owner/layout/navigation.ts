import {
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  CreditCard,
  Receipt,
  TrendingUp,
  Coffee,
  Tags,
  Sprout,
  Package,
  Armchair,
  Users,
  Building2,
  ChartNoAxesCombined,
  ChartPie,
  Sunrise,
  FileText,
  Settings,
} from "lucide-react";
export const navigation = [
  {
    group: "",
    items: [{ title: "Dashboard", slug: "dashboard", icon: LayoutDashboard }],
  },
  {
    group: "Sales",
    items: [
      { title: "Orders", slug: "orders", icon: ShoppingBag },
      { title: "Revenue", slug: "revenue", icon: Wallet },
      { title: "Payments", slug: "payments", icon: CreditCard },
    ],
  },
  {
    group: "Finance",
    items: [
      { title: "Expenses", slug: "expenses", icon: Receipt },
      { title: "Profit", slug: "profit", icon: TrendingUp },
    ],
  },
  {
    group: "Menu",
    items: [
      { title: "Products", slug: "products", icon: Coffee },
      { title: "Categories", slug: "categories", icon: Tags },
    ],
  },
  {
    group: "Inventory",
    items: [
      { title: "Ingredients", slug: "inventory", icon: Sprout },
      { title: "Stock", slug: "stock", icon: Package },
    ],
  },
  {
    group: "Management",
    items: [
      { title: "Tables", slug: "tables", icon: Armchair },
      { title: "Staff", slug: "staff", icon: Users },
      { title: "Branches", slug: "branches", icon: Building2 },
    ],
  },
  {
    group: "Analytics",
    items: [
      {
        title: "Sales Analytics",
        slug: "sales-analytics",
        icon: ChartNoAxesCombined,
      },
      { title: "Product Analytics", slug: "product-analytics", icon: ChartPie },
      {
        title: "Breakfast Analytics",
        slug: "breakfast-analytics",
        icon: Sunrise,
      },
      { title: "Reports", slug: "reports", icon: FileText },
    ],
  },
  {
    group: "Settings",
    items: [{ title: "Settings", slug: "settings", icon: Settings }],
  },
];
