import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { loadBrand } from "@/domain/brand/loader";
// 開発フェーズでは tests/data の JSON を SSOT (真実の単一ソース) として使用します
import brandData from "@/tests/data/brandModel.json";
import { BrandModel } from "@/domain/brand/model";

const inter = Inter({ subsets: ["latin"] });

/**
 * Next.js Metadata API への統合
 * domain/brand/loader.ts でテスト済みの SEO ロジックをそのまま適用します。
 */
export async function generateMetadata(): Promise<Metadata> {
  const brandViewModel = loadBrand(brandData as BrandModel);
  return brandViewModel.metadata;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brandViewModel = loadBrand(brandData as BrandModel);

  return (
    <html lang="ja">
      <body className={inter.className}>
        {/* ヘッダー: ViewModel からサイト名とロゴを取得。
          将来的に Firestore の値が変われば、ここも自動的に更新されます。
        */}
        <header className="w-full bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={brandViewModel.logo.main}
                alt={brandViewModel.siteName}
                className="h-8 w-auto object-contain"
              // 万が一画像が読み込めない場合のフォールバックは、CSS または onError で対応検討
              />
              <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:inline">
                {brandViewModel.siteName}
              </span>
            </div>

            <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="#" className="hover:text-blue-600 transition-colors">機能</a>
              <a href="#" className="hover:text-blue-600 transition-colors">料金</a>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-shadow shadow-sm">
                無料ではじめる
              </button>
            </nav>
          </div>
        </header>

        <main className="min-h-screen bg-slate-50">
          {children}
        </main>

        <footer className="bg-white border-t py-12">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <img src={brandViewModel.logo.square} alt="" className="h-6 w-6 opacity-50" />
              <p className="text-slate-400 text-sm">
                © {new Date().getFullYear()} {brandViewModel.siteName}. All rights reserved.
              </p>
            </div>
            <div className="flex gap-6 text-slate-400 text-sm">
              <a href="#" className="hover:text-slate-600">プライバシーポリシー</a>
              <a href="#" className="hover:text-slate-600">利用規約</a>
              <a href={`mailto:${brandData.contact.email}`} className="hover:text-slate-600">お問い合わせ</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}