import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface UnsplashImage {
  url: string;
  alt: string;
}

class ImageService {
  private readonly accessKey: string;
  private readonly baseUrl: string = 'https://api.unsplash.com';

  constructor() {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      throw new Error('UNSPLASH_ACCESS_KEY is not set in environment variables');
    }
    this.accessKey = accessKey;
  }

  async getWordImage(word: string): Promise<UnsplashImage> {
    try {
      const response = await axios.get(`${this.baseUrl}/search/photos`, {
        params: {
          query: word,
          per_page: 1,
        },
        headers: {
          Authorization: `Client-ID ${this.accessKey}`,
        },
      });

      const images = response.data.results;
      if (images.length === 0) {
        throw new Error('No images found');
      }

      const image = images[0];
      return {
        url: image.urls.regular,
        alt: image.alt_description || word,
      };
    } catch (error) {
      console.error('Error fetching image from Unsplash:', error);
      throw new Error('Failed to fetch image');
    }
  }
}

export const imageService = new ImageService(); 