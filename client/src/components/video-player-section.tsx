import { useState, useEffect } from "react";
import { Eye, Clock, Calendar, ThumbsUp, Share, Download, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

interface VideoPlayerSectionProps {
  videoId: string | null;
  isLoading?: boolean;
}

export default function VideoPlayerSection({ videoId, isLoading = false }: VideoPlayerSectionProps) {
  const [embedUrl, setEmbedUrl] = useState<string>("");

  useEffect(() => {
    if (videoId) {
      setEmbedUrl(getYouTubeEmbedUrl(videoId));
    }
  }, [videoId]);

  if (!videoId) {
    return null;
  }

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div className="aspect-video bg-black relative">
        {isLoading ? (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-sm">Loading video...</p>
            </div>
          </div>
        ) : (
          <iframe
            src={embedUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          />
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Video Player
            </h3>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>Video loaded</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Duration varies</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Just now</span>
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <Button variant="ghost" size="sm" className="p-2 text-gray-500 hover:text-youtube-red hover:bg-gray-100 rounded-full">
              <ThumbsUp className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 text-gray-500 hover:text-youtube-red hover:bg-gray-100 rounded-full">
              <Share className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 text-gray-500 hover:text-youtube-red hover:bg-gray-100 rounded-full">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 bg-gradient-to-br from-youtube-red to-red-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">YouTube Channel</h4>
            <p className="text-sm text-gray-600">Video content</p>
          </div>
          <Button className="px-4 py-2 bg-youtube-red text-white text-sm font-medium rounded-full hover:bg-youtube-red/90 transition-colors duration-200">
            Subscribe
          </Button>
        </div>
      </div>
    </section>
  );
}
