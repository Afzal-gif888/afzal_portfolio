import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://your-domain.com"), // User will update this later
  title: {
    default: "Afzal's Portfolio",
    template: "%s | Afzal",
  },
  description: "Professional portfolio of Afzal, a Software Engineer passionate about clean code and modern architecture.",
  keywords: ["Software Engineer", "Web Development", "React", "Next.js", "TypeScript", "Portfolio"],
  authors: [{ name: "Afzal" }],
  creator: "Afzal",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://your-domain.com", // User will update this later
    title: "Afzal's Portfolio",
    description: "Professional portfolio of Afzal, a Software Engineer passionate about clean code and modern architecture.",
    siteName: "Afzal Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Afzal's Portfolio",
    description: "Professional portfolio of Afzal, a Software Engineer passionate about clean code and modern architecture.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
