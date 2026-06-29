import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { Layout } from "@layouts/root";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Ecom Admin",
  description: "Ecommerce admin frontend — powered by the ecom-starter API",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={outfit.variable}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
