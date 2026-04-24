import type { Metadata } from "next";
import "./globals.css";
import { FacebookPixel } from "./components/FacebookPixel";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Dra. Rayanna Almeida | Cirurgia Pediátrica",
  description: "Especialista em cirurgia pediátrica com mais de 20 anos de experiência em Salvador.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <Script id="gtm-head" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TBSLMWNL');`}
        </Script>
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TBSLMWNL"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <FacebookPixel />
        {children}
      </body>
    </html>
  );
}
