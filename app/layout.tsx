import type { Metadata } from "next";
import { Kanit, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SplashScreen } from "@/components/ui/splash-screen";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin", "thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NAIWAH - ระบบจัดการคลังอุปกรณ์",
  description: "ระบบจัดการคลังอุปกรณ์และทรัพย์สิน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${kanit.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <SplashScreen />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
