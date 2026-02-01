import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import WhatsAppButton from "../features/landing/components/WhatsAppButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vidriería Niño - Especialistas en Vidrios y Enmarcaciones",
  description:
    "Venta e instalación de vidrios crudos, catedrales, 5mm, espejos, blindex y carpintería de aluminio. Servicio profesional de enmarcaciones.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        <WhatsAppButton />
      </body>
    </html>
  );
}
