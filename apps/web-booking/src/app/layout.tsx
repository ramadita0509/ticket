import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "El Wafa Travel — Cari & pesan penerbangan",
  description:
    "Spesialis tiket group pesawat Middle East. Didukung Travelport TripServices.",
  icons: {
    icon: "/el-wafa-logo.png",
    apple: "/el-wafa-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${display.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
