import type { Metadata } from "next";
import "./globals.css";
import { FacebookPixel } from "./components/FacebookPixel";

export const metadata: Metadata = {
  title: "Dra. Rayanna Almeida | Cirurgia Pediátrica",
  description: "Especialista em cirurgia pediátrica com mais de 20 anos de experiência em Salvador e Feira de Santana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <FacebookPixel />
        {children}
      </body>
    </html>
  );
}
