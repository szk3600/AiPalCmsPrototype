/**
 * unknown 型のエラーから安全にメッセージを取り出すユーティリティ関数
 */
export const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    // Error オブジェクトでない場合（文字列や null など）のフォールバック
    return String(error);
};