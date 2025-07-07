/**
 * キャラクター検索フォームコンポーネント
 * @returns 検索フォーム
 */
export default function SearchForm({ currentQuery }: { currentQuery?: string }) {
  return (
    <div className="mb-8">
      <form method="get" action="/" className="flex gap-2">
        <input
          type="text"
          name="q"
          placeholder="キャラクター名で検索..."
          defaultValue={currentQuery}
          className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          検索
        </button>
        {currentQuery && (
          <a
            href="/"
            className="px-4 py-2 bg-background-light text-foreground border border-border rounded-lg hover:bg-background-lighter transition-colors"
          >
            クリア
          </a>
        )}
      </form>
    </div>
  );
}