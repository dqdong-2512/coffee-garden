import type { Metadata } from "next";
import { HomePage } from "@/ui/home/home-page";

export const metadata: Metadata = {
  title: "Coffee Garden | Cà phê, bữa sáng và khoảng xanh",
  description:
    "Gọi món tại bàn và tận hưởng cà phê, bữa sáng trong không gian xanh của Coffee Garden.",
};

export default function Page() {
  return <HomePage />;
}
