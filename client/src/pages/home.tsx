import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Gamepad2, Target, Trophy } from "lucide-react";
import Header from "@/components/header";
import UrlInputSection from "@/components/url-input-section";
import VideoPlayerSection from "@/components/video-player-section";
import VideoHistorySection from "@/components/video-history-section";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertVideoHistory } from "@shared/schema";
import { Link } from "wouter";

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
        
        {/* Game Launcher Section */}
        <Card className="mb-8 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <Gamepad2 className="w-6 h-6 mr-2" />
              3D FPS Arena
            </CardTitle>
            <CardDescription className="text-red-600">
              Experience intense first-person shooter action with realistic 3D graphics and physics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center space-x-3">
                <Target className="w-8 h-8 text-red-500" />
                <div>
                  <h4 className="font-semibold text-gray-900">Realistic Combat</h4>
                  <p className="text-sm text-gray-600">3D physics-based shooting mechanics</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <div>
                  <h4 className="font-semibold text-gray-900">Score System</h4>
                  <p className="text-sm text-gray-600">Compete for high scores and rankings</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Gamepad2 className="w-8 h-8 text-blue-500" />
                <div>
                  <h4 className="font-semibold text-gray-900">Smooth Controls</h4>
                  <p className="text-sm text-gray-600">WASD movement + mouse look</p>
                </div>
              </div>
            </div>
            
            <Link href="/fps-game">
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-semibold">
                <Gamepad2 className="w-5 h-5 mr-2" />
                Play FPS Arena
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <VideoHistorySection onVideoSelect={handleVideoSelect} />
      </main>

      <Footer />
    </div>
  );
}
