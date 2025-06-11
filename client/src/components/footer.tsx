import { Info, Download } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center text-sm text-gray-600 space-y-2">
          <p>Media & Gaming Hub - YouTube Player & FPS Game</p>
          <div className="flex items-center justify-center space-x-4">
            <span className="flex items-center">
              <Info className="w-4 h-4 mr-1" />
              No API Required
            </span>
            <span className="flex items-center">
              <Download className="w-4 h-4 mr-1" />
              オフライン版ダウンロード可能
            </span>
          </div>
          <p className="text-xs text-gray-500">
            YouTubeの埋め込み機能とHTML5 Canvasを使用
          </p>
        </div>
      </div>
    </footer>
  );
}
