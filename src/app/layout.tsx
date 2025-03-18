import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { headers } from "next/headers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Source_Code_Pro } from "next/font/google";
const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: `Sample site`,
  description:
    "Sample site with zilnames and rainbowkit",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookie = await (await headers()).get("cookie");
  return (
    <html lang="en">
      <body className={`antialiased bg-slate-200 ${sourceCodePro.className}`}>
        <Providers>
          <div className="min-h-screen container mx-auto flex flex-col gap-4">
            <div className="p-4">
              <Header />
            </div>
            <main className="flex-1 px-4">
              {children}
            </main>
            <div className="p-4">
              <Footer />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}