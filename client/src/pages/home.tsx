import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/header";
import UrlInputSection from "@/components/url-input-section";
import VideoPlayerSection from "@/components/video-player-section";
import VideoHistorySection from "@/components/video-history-section";
import Footer from "@/components/footer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertVideoHistory } from "@shared/schema";

export default function Home() {
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  const addToHistoryMutation = useMutation({
    mutationFn: async (videoData: InsertVideoHistory) => {
      await apiRequest('POST', '/api/video-history', videoData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/video-history'] });
    },
  });

  const handleVideoSearch = (videoData: { videoId: string; url: string }) => {
    setIsVideoLoading(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      setCurrentVideoId(videoData.videoId);
      setIsVideoLoading(false);
      
      // Add to history
      addToHistoryMutation.mutate({
        videoId: videoData.videoId,
        url: videoData.url,
        title: null,
        channelName: null,
        duration: null,
        thumbnail: `https://img.youtube.com/vi/${videoData.videoId}/maxresdefault.jpg`
      });

      // Scroll to video
      setTimeout(() => {
        const videoSection = document.querySelector('#video-player-section');
        if (videoSection) {
          videoSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }, 1000);
  };

  const handleVideoSelect = (videoData: { videoId: string; url: string }) => {
    setCurrentVideoId(videoData.videoId);
    
    // Scroll to video
    setTimeout(() => {
      const videoSection = document.querySelector('#video-player-section');
      if (videoSection) {
        videoSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <UrlInputSection onVideoSearch={handleVideoSearch} />
        
        <div id="video-player-section">
          <VideoPlayerSection 
            videoId={currentVideoId} 
            isLoading={isVideoLoading}
          />
        </div>
        
        <VideoHistorySection onVideoSelect={handleVideoSelect} />
      </main>

      <Footer />
    </div>
  );
}
