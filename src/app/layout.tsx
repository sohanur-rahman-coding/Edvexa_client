import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Edvexa | Order & Inventory Management Platform",
  description:
    "Enterprise-grade e-commerce order and inventory management platform featuring atomic race-condition safety, zero overselling, and idempotency.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
        <AuthProvider>
          <CartProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: "#ffffff",
                  color: "#0f172a",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
                  fontWeight: 500,
                },
              }}
            />
            <Navbar />
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
