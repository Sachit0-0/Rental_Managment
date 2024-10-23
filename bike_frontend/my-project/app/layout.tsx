"use client"; 
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/ui/navbar";
import { AuthProvider } from "./context/AuthContext";
import { ReactQueryDevtools } from 'react-query/devtools';
import { QueryClient, QueryClientProvider } from "react-query";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
