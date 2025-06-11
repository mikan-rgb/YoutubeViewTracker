import { Youtube, Gamepad2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import AppDownloader from "@/components/app-downloader";

export default function Header() {
  const [location] = useLocation();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Youtube className="text-youtube-red text-2xl h-6 w-6" />
            <h1 className="text-xl font-semibold text-gray-900">Media & Gaming Hub</h1>
          </div>
          
          <nav className="flex items-center space-x-2">
            <Link href="/">
              <Button 
                variant={location === "/" ? "default" : "ghost"} 
                size="sm"
                className={location === "/" ? "bg-youtube-blue text-white" : ""}
              >
                <Youtube className="w-4 h-4 mr-2" />
                Video Player
              </Button>
            </Link>
            
            <Link href="/fps-game">
              <Button 
                variant={location === "/fps-game" ? "default" : "ghost"} 
                size="sm"
                className={location === "/fps-game" ? "bg-red-600 text-white" : ""}
              >
                <Gamepad2 className="w-4 h-4 mr-2" />
                FPS Arena
              </Button>
            </Link>
            
            <AppDownloader />
          </nav>
        </div>
      </div>
    </header>
  );
}
