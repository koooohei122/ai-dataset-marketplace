import Link from "next/link"

const categories = [
  { slug: "image", label: "画像データ", color: "blue" },
  { slug: "text", label: "テキストデータ", color: "green" },
  { slug: "audio", label: "音声データ", color: "purple" },
]

const benefits = [
  {
    icon: "🔍",
    title: "豊富なデータセット",
    description: "画像・テキスト・音声など、用途別に探しやすく整理されています。",
  },
  {
    icon: "💰",
    title: "柔軟な価格設定",
    description: "無料/有料の両方に対応し、目的に合わせて購入・販売できます。",
  },
  {
    icon: "🤖",
    title: "AI開発向け最適化",
    description: "AI開発ですぐ活用できる形式と情報でデータセットを提供します。",
  },
]

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">

      <section className="mb-8">
        <div className="mx-auto max-w-3xl rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100 text-sm md:text-base">
          ✅ 本ページは実ページです（最終更新: 2026-04-29）。「準備中」ではありません。
        </div>
      </section>
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">AIデータセットマーケットプレイス</h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
          AI開発者・研究者・企業向けに、データセットの検索・購入・販売を一つの画面で行えるマーケットプレイスです。
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/datasets"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold"
          >
            データセットを探す
          </Link>
          <Link
            href="/upload"
            className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg font-semibold"
          >
            データセットを販売
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {benefits.map((benefit) => (
          <article key={benefit.title} className="text-center p-6 border rounded-lg">
            <div className="text-4xl mb-4">{benefit.icon}</div>
            <h2 className="text-xl font-semibold mb-2">{benefit.title}</h2>
            <p className="text-gray-600 dark:text-gray-400">{benefit.description}</p>
          </article>
        ))}
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-bold mb-4">カテゴリから探す</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/datasets?category=${category.slug}`}
              className={`px-6 py-3 rounded-lg hover:opacity-90 ${
                category.color === "blue"
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  : category.color === "green"
                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                    : "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
              }`}
            >
              {category.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
