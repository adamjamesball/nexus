import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import Link from "next/link";
import { Zap, Brain } from "lucide-react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Nexus - AI-Powered Sustainability Intelligence",
  description: "The world's first self-improving AI platform for sustainability consultants and corporate teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="bg-card border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              <Link href="/dashboard" className="font-semibold">
                <span className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-gradient-to-br from-blue-600 to-green-600 rounded flex items-center justify-center">
                    <Zap className="h-4 w-4 text-white" />
                  </span>
                  <span>Nexus</span>
                </span>
              </Link>
              <nav className="flex items-center space-x-6 text-sm">
                <Link href="/dashboard" className="hover:underline">Dashboard</Link>
                <Link href="/brain" className="hover:underline flex items-center space-x-1">
                  <Brain className="h-3 w-3" />
                  <span>Brain</span>
                </Link>
                <Link href="http://localhost:4100" className="hover:underline flex items-center space-x-1" target="_blank" rel="noopener noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  <span>Docs</span>
                </Link>
                <Link href="/dashboard/evals" className="hover:underline flex items-center space-x-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/><path d="m19 12-2 2"/></svg>
                  <span>Evals</span>
                </Link>
              </nav>
            </div>
          </header>
          {children}
          <Toaster />
        </ThemeProvider>
        {process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCKS === 'true' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.register('/mockServiceWorker.js');
                }
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}
