import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getBrand } from "@/domain/brand/loader";

const inter = Inter({ subsets: ["latin"] });

/**
 * サイト全体のメタデータ生成
 * RootLayout に置くのは Next.js の標準仕様ですが、
 * ロジックは loader 側に閉じ込めてあるため、呼び出しは最小限にしています。
 */
export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand('brandModel');
  return brand?.metadata || { title: "AiPal CMS" };
}

/**
 * RootLayout (Server Component)
 * ------------------------------------------------------------
 * 役割: ページの器（HTML構造）の定義に専念。
 * 中身のデータ（Header/Footer/Children）はそれぞれのコンポーネントが自律的に解決します。
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="scroll-smooth">
      <body className={`${inter.className} antialiased bg-white text-slate-900`}>
        <div className="flex flex-col min-h-screen">
          {/* Header は内部でデータをフェッチし、表示まで完結する単一ファイルです */}
          <Header />
          
          <main className="flex-grow">
            {children}
          </main>
          
          <Footer />
        </div>
      </body>
    </html>
  );
}