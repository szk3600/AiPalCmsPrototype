AiPal CMS Prototype: 設計・開発ガイドライン

本プロジェクトは、ドメイン駆動設計 (DDD) とデータドリブンな開発サイクルを採用した Next.js アプリケーションです。AIアシスタントはこのガイドラインに従ってコードを生成してください。

1. 基本アーキテクチャ

「Model -> Loader -> ViewModel -> View」のフローを基本とします。

Model (domain/*/model.ts): データ構造の定義（Firestoreのスキーマと一致）。

Loader (domain/*/loader.ts): Model を ViewModel へ変換する純粋関数。

ViewModel (domain/*/view_model.ts): UIが表示のために必要とする情報の定義。

View (app/ or components/): Reactコンポーネント。ロジックを持たず ViewModel を表示する。

2. ディレクトリ構成と責務

app/: ルーティングと各ページの View。

domain/: ビジネスロジックと型定義。Next.js や外部ライブラリに依存させないクリーンな領域。

components/: 複数のページで再利用されるUIパーツ。

lib/: Firebaseクライアントやユーティリティ関数。

tests/data/: 真実の単一ソース (SSOT)。開発の基準となる JSON データ群。

3. UI/UX 実装ルール (Tailwind CSS)

レスポンシブ配置: カード状の要素は w-full max-w-md mx-auto を基本とし、大きな画面で間抜けな左寄りにならないように中央寄せを徹底する。

スタイル上書き: 既存の強力なスタイルを上書きする必要がある場合は、クラス名! (例: pl-4!) の重要度フラグ記法を使用する。

配置: レイアウトが複雑になる場合は absolute による微調整を避け、Flexbox (flex, gap, items-center) による物理的な分離を優先する。

4. データドリブン・イテレーション

実装を変更する前に、必ず tests/data/*.json を最新の仕様に更新する。

AIは、常に tests/data 内の JSON 構造を正解としてコードを生成すること。

UIの検証は Firebase App Hosting のプレビューURLで行い、そのフィードバックを次のイテレーションに活かす。

5. 禁止事項

alert() や confirm() などのブラウザ標準ダイアログは使用しない。

コンポーネント内に巨大なロジックを直接書かない（loader や hooks に逃がす）。

APIキーや秘密情報を src 内にハードコードしない。