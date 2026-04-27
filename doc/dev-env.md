ノートPC環境構築ガイド

GitHubリポジトリ（AiPalCmsPrototype）を別のPC（ノートPCなど）にクローンし、開発環境を再現するための手順です。

1. 事前準備

以下のツールがインストールされていることを確認してください。

Node.js: (LTS推奨) node -v で確認

Git: git --version で確認

VS Code: 推奨エディタ

💡 便利ツール: code コマンドの有効化

ターミナルから code . と入力するだけでプロジェクトを開けるように設定します。

macOS の場合:

VS Code を開き、Cmd + Shift + P を押してコマンドパレットを表示。

「shell command」と入力。

「Shell Command: Install 'code' command in PATH」 を選択して実行。

Windows の場合:

通常、インストール時に「PATHへの追加」にチェックを入れていれば有効になっています。

効かない場合は、再インストール時に「PATHへの追加」をチェックするか、手動で環境変数に追加します。

2. リポジトリのクローン

ターミナルを開き、プロジェクトを配置したいディレクトリで以下を実行します。

git clone [https://github.com/szk3600/AiPalCmsPrototype.git](https://github.com/szk3600/AiPalCmsPrototype.git)
cd AiPalCmsPrototype


3. 依存関係のインストール

プロジェクトに必要なライブラリをインストールします。

npm install


4. 環境変数（.env.local）の復元

最重要ステップです。 .env.local はセキュリティ上GitHubに含まれていないため、メインPCから手動でコピーするか、再作成する必要があります。

プロジェクトのルートに .env.local ファイルを作成。

メインPCの .env.local の内容（FirebaseのAPIキーなど）を貼り付けます。

NEXT_PUBLIC_FIREBASE_API_KEY=xxx...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx...
# ...その他のキー


5. 開発サーバーの起動

以下のコマンドでローカルサーバーを立ち上げます。

npm run dev


http://localhost:3000 にアクセスして動作を確認してください。

💡 複数PCでの運用ルール（同期のコツ）

作業開始前は必ず Pull:
メインPCで変更を加えた後は、ノートPC側で必ず最新の状態を取り込みます。

git pull origin main


作業終了後は必ず Push:
たとえ作業が途中でも、コミットして Push しておけば別のPCですぐに再開できます。

git add .
git commit -m "WIP: 〇〇の実装中"
git push origin main


ライブラリを追加した場合:
どちらかのPCで npm install して新しいライブラリを入れた場合、別のPCで pull した後にも npm install を実行して、ローカルの node_modules を最新にする必要があります。

テストデータの活用:
tests/data/*.json を更新して Push すれば、どのPCでも同じデータ状態で UI 開発が続けられます。