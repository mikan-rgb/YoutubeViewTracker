import { Youtube } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center space-x-3">
          <Youtube className="text-youtube-red text-2xl h-6 w-6" />
          <h1 className="text-xl font-semibold text-gray-900">YouTube Video Player</h1>
        </div>
      </div>
    </header>
  );
}
