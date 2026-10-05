import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";

const dropa = localFont({
  src: "./fonts/Dropa-Regular.woff2",
  variable: "--font-dropa",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ofia - Business Operating System",
  description: "Ofia is the operating system Nigerian businesses run on.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dropa.variable} antialiased bg-white text-slate-900 font-dropa`}>
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 relative">
                <div className="absolute inset-[2px] border-2 border-white/80 rounded" />
              </div>
              <span className="font-bold text-lg">Ofia</span>
            </Link>
            <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
              <Link href="/products" className="hover:text-slate-900 transition-colors">Products</Link>
              <Link href="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
              <Link href="/blog" className="hover:text-slate-900 transition-colors">Blog</Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block">Log in</Link>
              <Link href="#" className="text-sm font-semibold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">Get Started</Link>
            </div>
          </div>
        </header>

        {children}

        <footer className="border-t border-slate-100 bg-slate-50 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 to-blue-400 relative">
                <div className="absolute inset-[1.5px] border-2 border-white/80 rounded-[3px]" />
              </div>
              <span className="font-bold">Ofia</span>
            </div>
            <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} Reed Breed Technologies. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
