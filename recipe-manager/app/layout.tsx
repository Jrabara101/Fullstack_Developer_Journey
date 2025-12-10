import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recipe Manager - High Protein Meal Planner",
  description: "Manage your recipes, track nutrition, and achieve your fitness goals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

