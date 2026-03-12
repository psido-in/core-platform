import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Psido — Go Digital. Stay Local. Grow Fast.",
  description: "Psido helps local shops in Bangalore get a website, app, and smart marketing in 48 hours. Grow Together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
