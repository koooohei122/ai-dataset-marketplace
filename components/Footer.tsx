import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50 dark:bg-gray-900 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">AI Dataset Marketplace</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI開発者、研究者、企業向けのデータセット販売・購入プラットフォーム
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">リンク</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/datasets" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">
                  データセット一覧
                </Link>
              </li>
              <li>
                <Link href="/upload" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">
                  データセットを販売
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">サポート</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">
                  ヘルプ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">
                  プライバシーポリシー
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">開発者</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/koooohei122/ai-dataset-marketplace"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 AI Dataset Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

