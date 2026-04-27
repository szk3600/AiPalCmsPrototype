Firebase プロジェクト構築ガイド

App Hosting を利用した Next.js プロジェクトのための、最新の Firebase セットアップ手順です。

1. Firebase プロジェクトの作成

Firebase Console にアクセス。

[プロジェクトを追加] をクリックし、プロジェクト名（例：aipal-cms-prototype）を入力。

Google アナリティクスはお好みで設定（プロトタイプなら OFF でも可）。

2. Web アプリの登録（APIキーの取得）

App Hosting で動かす場合も、フロントエンドから Firebase サービス（Firestore等）にアクセスするために「Web アプリ」としての登録が必要です。

プロジェクトの概要画面で [Web] アイコン（</>） をクリック。

アプリのニックネームを入力。

「このアプリの Firebase Hosting も設定します」はチェック不要です。

※ App Hosting を使うため、従来の Hosting 設定はスキップして構いません。

登録後に表示される firebaseConfig の値をコピーし、ローカルの .env.local に貼り付けます。

3. App Hosting のセットアップ

ここが最新のデプロイ方式です。

Firebase コンソールの左メニューから [ビルド] > [App Hosting] を選択。

[開始する] をクリック。

GitHub リポジトリ（szk3600/AiPalCmsPrototype）を連携。

デプロイ設定（ルートディレクトリやブランチなど）を確認。

Next.js の場合、App Hosting が自動的にビルド設定を検知します。

[デプロイ] を実行。

4. 必要なサービスの有効化

プロジェクトの要件に合わせて、以下のサービスを「開始」してください。

Firestore Database: データドリブン開発の核となるデータベース。

Cloud Storage: カテゴリーアイコンなどの画像保存先。

Authentication: ユーザー認証が必要な場合。

💡 App Hosting に関する注意点

SSR (Server Side Rendering) 対応:
App Hosting は自動的に Cloud Run をバックエンドで構築し、Next.js の SSR や API Routes をサポートします。従来の Hosting よりも Next.js との相性が抜群に良いです。

環境変数の管理:
.env.local はローカル用ですが、App Hosting 上（本番環境）で必要な環境変数は、Firebase コンソールの App Hosting 設定 > 環境変数 から別途登録する必要があります。

