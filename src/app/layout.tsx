import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Coffee Garden", template: "%s | Coffee Garden" },
  description:
    "Coffee Garden owner workspace — coffee, breakfast, and a better everyday.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
