import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ShopProvider } from "@/contexts/ShopContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Valmoré Collective - Modern Bireyler İçin Küratörlü Moda",
  description: "Valmoré Collective'te stilini tanımlayan zamansız parçaları keşfet. Premium giyim ve aksesuarlar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <LanguageProvider>
          <AuthProvider>
            <ShopProvider>
              <Header />
              <CartDrawer />
              <main className="flex-grow">{children}</main>
              <Footer />
            </ShopProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
