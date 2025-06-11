export interface YouTubeVideoData {
  videoId: string;
  url: string;
  title?: string;
  channelName?: string;
  duration?: string;
  thumbnail?: string;
}

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

export function isValidYouTubeUrl(url: string): boolean {
  return extractVideoId(url) !== null;
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export function validateAndParseYouTubeUrl(url: string): YouTubeVideoData | null {
  if (!url.trim()) {
    return null;
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    return null;
  }

  return {
    videoId,
    url: url.trim(),
    thumbnail: getYouTubeThumbnail(videoId)
  };
}
