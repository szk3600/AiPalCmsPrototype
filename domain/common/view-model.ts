/**
 * [Common Domain] ListViewModel
 * ------------------------------------------------------------
 * 役割: どんなデータ（カテゴリー、プレイリスト、記事等）であっても、
 * リスト表示に必要な最小限の共通項目を定義します。
 */
export interface ListViewModel {
  id: string;
  title: string;
  description: string;
  keywords?: string[];
  imagePath?: string;   //  解決済みの URL (View はこれをそのまま img src に入れる)
  url: string;          // 遷移先のローカルパス (例: /categories/ai-basics)
  
  /**
   * バッジ情報
   * 責務の分離: ViewModel は表示する「テキスト」のみを保持します。
   * 色やスタイル（バリアント）は View 層のコンポーネントが判定します。
   */
  badge?: {
    text: string;
  };
}