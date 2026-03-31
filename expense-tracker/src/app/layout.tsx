import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { ThemeProvider } from "@/contexts/ThemeContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ExpenseTracker - Personal Finance Management",
  description: "Track your personal expenses and manage your finances with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-gray-50 dark:bg-slate-900 transition-colors duration-300`}>
        <ThemeProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
            <Header />
            <div className="flex">
              <Navigation />
              <main className="flex-1 p-4 lg:p-8 lg:ml-0 animate-fade-in">
                <div className="max-w-7xl mx-auto">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
