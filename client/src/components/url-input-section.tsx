import { useState } from "react";
import { Search, Link, X, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateAndParseYouTubeUrl } from "@/lib/youtube";

interface UrlInputSectionProps {
  onVideoSearch: (videoData: { videoId: string; url: string }) => void;
}

export default function UrlInputSection({ onVideoSearch }: UrlInputSectionProps) {
  const [url, setUrl] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSearch = () => {
    setValidationMessage("");
    setSuccessMessage("");
    setIsError(false);

    if (!url.trim()) {
      setValidationMessage("Please enter a YouTube URL");
      setIsError(true);
      return;
    }

    const videoData = validateAndParseYouTubeUrl(url);
    if (!videoData) {
      setValidationMessage("Please enter a valid YouTube URL");
      setIsError(true);
      return;
    }

    setSuccessMessage("Video found and loaded successfully!");
    onVideoSearch(videoData);
  };

  const handleClear = () => {
    setUrl("");
    setValidationMessage("");
    setSuccessMessage("");
    setIsError(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Enter YouTube URL</h2>
        <p className="text-sm text-gray-600">Paste any YouTube video URL to search and play the video</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pr-10 focus:ring-2 focus:ring-youtube-blue focus:border-transparent"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Link className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="flex space-x-3">
          <Button 
            onClick={handleSearch}
            className="flex-1 bg-youtube-red text-white hover:bg-youtube-red/90 transition-colors duration-200"
          >
            <Search className="w-4 h-4 mr-2" />
            Search & Play
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleClear}
            className="px-6"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {validationMessage && isError && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{validationMessage}</span>
          </div>
        )}

        {successMessage && !isError && (
          <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>
    </section>
  );
}
