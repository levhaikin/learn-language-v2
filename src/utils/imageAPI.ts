const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;
const PEXELS_API_KEY = process.env.REACT_APP_PEXELS_API_KEY;

interface ImageResult {
  url: string;
  alt: string;
  source: 'unsplash' | 'pexels' | 'fallback';
}

// Cache images to avoid repeated API calls
const imageCache: { [key: string]: ImageResult } = {};

// Fallback to DiceBear abstract art when no API keys are available or requests fail
const getFallbackImage = (word: string): ImageResult => ({
  url: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(word)}`,
  alt: word,
  source: 'fallback'
});

export async function getWordImage(word: string): Promise<ImageResult> {
  // Check cache first
  if (imageCache[word]) {
    return imageCache[word];
  }

  // If no API keys are configured, use fallback immediately
  if (!process.env.REACT_APP_UNSPLASH_ACCESS_KEY && !process.env.REACT_APP_PEXELS_API_KEY) {
    console.warn('No image API keys configured. Using fallback images.');
    return getFallbackImage(word);
  }

  try {
    // Try Unsplash first
    if (process.env.REACT_APP_UNSPLASH_ACCESS_KEY) {
      try {
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(word)}&per_page=1`,
          {
            headers: {
              Authorization: `Client-ID ${process.env.REACT_APP_UNSPLASH_ACCESS_KEY}`,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error(`Unsplash API error: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const result: ImageResult = {
            url: data.results[0].urls.regular,
            alt: data.results[0].alt_description || word,
            source: 'unsplash'
          };
          imageCache[word] = result;
          return result;
        }
      } catch (error) {
        console.warn('Unsplash API error:', error);
      }
    }

    // Try Pexels if Unsplash fails or is not configured
    if (process.env.REACT_APP_PEXELS_API_KEY) {
      try {
        const response = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(word)}&per_page=1`,
          {
            headers: {
              Authorization: process.env.REACT_APP_PEXELS_API_KEY,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Pexels API error: ${response.status}`);
        }

        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
          const result: ImageResult = {
            url: data.photos[0].src.medium,
            alt: word,
            source: 'pexels'
          };
          imageCache[word] = result;
          return result;
        }
      } catch (error) {
        console.warn('Pexels API error:', error);
      }
    }

    // If both APIs fail or return no results, use fallback
    return getFallbackImage(word);

  } catch (error) {
    console.error('Error fetching image:', error);
    return getFallbackImage(word);
  }
} 