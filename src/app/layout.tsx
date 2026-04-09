import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "UX Benchmark Tool",
  description: "Herramienta centralizada de benchmarks competitivos para equipos de UX",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${roboto.variable} h-full antialiased`}>
      <body className="min-h-full" style={{ backgroundColor: 'var(--bg-layout)' }}>{children}</body>
    </html>
  );
}
