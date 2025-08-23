import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import ClientLayout from "./ClientLayout";
import { QueryProvider } from '@/providers/QueryProvider';
import '@/utils/console-override';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Merolagani",
  description: "Nepal's Leading Stock Market Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <QueryProvider>
            <ClientLayout>{children}</ClientLayout>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 