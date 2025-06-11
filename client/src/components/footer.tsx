import { Info } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center text-sm text-gray-600">
          <p>YouTube Video Player Tool - No API Required</p>
          <p className="mt-2 flex items-center justify-center">
            <Info className="w-4 h-4 mr-1" />
            This tool uses YouTube's embed functionality for video playback
          </p>
        </div>
      </div>
    </footer>
  );
}
