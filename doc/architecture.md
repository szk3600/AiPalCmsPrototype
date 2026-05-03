プロジェクト・アーキテクチャ・スナップショット (2026/04/27)

本ドキュメントは、リファクタリングを通じて確立された、データ駆動型・自律型コンポーネント設計の「現在の正解」を記録したものです。

1. コア・デザインパターン

① セルフロード方式 (Self-loading Components)

上位の Page は構造（レイアウト）と ID の管理に専念し、具体的なデータ取得と表示は下位コンポーネント（Domain View）が自律的に行います。

利点: Page コンポーネントからロジックと複雑な型依存が消え、極めてクリーンになります。

実装: CategoryListView は自律的に ID リストを取得し、各アイテムの詳細は getCategoryListItem で個別にフェッチします。

② 汎用リスト・プロトタイピング (Generic ListView)

ドメイン（カテゴリー、プレイリスト等）を問わず、リスト表示に必要な共通項目を定義した ListViewModel を活用します。

定義: domain/common/view-model.ts

汎用View: GenericListView.tsx は、どんなドメインのデータでも ListViewModel 形式であれば美しくカード表示します。

責務の分離: imagePath はオプショナルであり、badge は表示するテキストのみを保持します。色やスタイルは View 層の責務とし、ドメイン層（ViewModel）には含めません。

③ 共通レイアウトフレーム (Layout Standard)

Tailwind CSS の重複を避け、デザインの一貫性を保つための「器」を共通化しています。

PageFrame: ページ全体の背景と最小高。

HeroSection: ページ上部のタイトルと説明文。文言はマスターデータから取得（Data-driven）。

MainFrame: コンテンツの最大幅と余白を制御。

2. データの流れ (Data Flow)

Storage/JSON (Model): 真実の単一ソース (SSOT)。tests/data/_cms/ 配下に配置。

Infrastructure (ContentStorage):

react.cache によるリクエスト単位のメモ化。

同一リクエスト内での重複ファイルアクセスを物理的に 1 回に制限。

Domain Loader (loader.ts):

ViewModel の定義を Loader とセットで管理（Self-loading のための知識集約）。

ページメタデータ (getCategoryPageInfo)、IDリスト、汎用リスト形式、詳細形式の取得メソッドを提供。

Domain View (CategoryListView / CategoryView):

Loader を呼び出し、自律的にデータをロード。

GenericListView 等の共通コンポーネントにデータを流し込む。

3. ファイル構造と命名規則

階層 / ファイル

命名規則

役割・責務

Domain View

PascalCase.tsx

CategoryView.tsx 等。自律的にデータをロードして表示。

Logic/Loader

kebab-case.ts

loader.ts。取得場所の把握と ViewModel への変換。

Model/Type

kebab-case.ts

model.ts。生のデータ構造の定義。

Common Type

kebab-case.ts

view-model.ts。ListViewModel 等、共通インターフェース。

Generic View

PascalCase.tsx

GenericListView.tsx。ドメインを知らない純粋UI。

Page Layout

PascalCase.tsx

Layouts.tsx。Tailwind 重複排除のための共通フレーム。

4. 開発ガイドライン

データファースト: 機能を実装する前に、必ず tests/data/*.json を更新して「仕様」を確定させる。

引き算の設計: ViewModel に将来使うかもしれない「色」や「バリアント」を仮定で含めない。未定のものは定義しない。

キャッシュの信頼: コンポーネントごとに getCategory を呼ぶことを恐れない。ContentStorage レベルで最適化されているため、View の自律性を優先する。