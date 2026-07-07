
import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/contexts/cart";
import { supabaseServer } from "@/lib/supabase/server";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "MIERA",
  description: "Luxury beauty essentials, crafted for every girl.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = supabaseServer();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name, parent_id")
    .order("name", { ascending: true });

  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${dmSans.variable} min-h-screen flex flex-col`}>
        <CartProvider>
          <Navbar categories={categories ?? []} />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
