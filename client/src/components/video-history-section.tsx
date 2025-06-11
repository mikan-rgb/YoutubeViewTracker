import { useQuery, useMutation } from "@tanstack/react-query";
import { Play, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { VideoHistory } from "@shared/schema";

interface VideoHistorySectionProps {
  onVideoSelect: (videoData: { videoId: string; url: string }) => void;
}

export default function VideoHistorySection({ onVideoSelect }: VideoHistorySectionProps) {
  const { data: history = [], isLoading } = useQuery<VideoHistory[]>({
    queryKey: ['/api/video-history'],
  });

  const removeVideoMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/video-history/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/video-history'] });
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', '/api/video-history');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/video-history'] });
    },
  });

  const handleVideoSelect = (video: VideoHistory) => {
    onVideoSelect({
      videoId: video.videoId,
      url: video.url
    });
  };

  const handleRemoveVideo = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    removeVideoMutation.mutate(id);
  };

  const handleClearHistory = () => {
    clearHistoryMutation.mutate();
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (isLoading) {
    return (
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Videos</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4 p-3 animate-pulse">
              <div className="w-20 h-12 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Videos</h2>
      
      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Play className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No videos in history yet</p>
          <p className="text-sm">Search and play videos to see them here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((video) => (
            <div
              key={video.id}
              className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200"
              onClick={() => handleVideoSelect(video)}
            >
              <div className="w-20 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                {video.thumbnail ? (
                  <img 
                    src={video.thumbnail} 
                    alt="Video thumbnail"
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12L15 7H5L10 12Z"></path></svg></div>';
                      }
                    }}
                  />
                ) : (
                  <Play className="w-6 h-6 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {video.title || `Video ${video.videoId}`}
                </h4>
                <p className="text-sm text-gray-600 truncate">
                  {video.channelName || 'YouTube'} • {formatTimeAgo(video.timestamp)}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                {video.duration && (
                  <span className="text-xs text-gray-500">{video.duration}</span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                  onClick={(e) => handleRemoveVideo(e, video.id)}
                  disabled={removeVideoMutation.isPending}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
            onClick={handleClearHistory}
            disabled={clearHistoryMutation.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear History
          </Button>
        </div>
      )}
    </section>
  );
}
