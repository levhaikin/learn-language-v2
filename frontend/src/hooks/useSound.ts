import { useCallback, useEffect, useRef } from 'react';

export const useSound = (soundDataUrl: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element
    // console.log(soundDataUrl);
    audioRef.current = new Audio(soundDataUrl);
    
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [soundDataUrl]);

  const play = useCallback(() => {
    if (audioRef.current) {
      // Reset the audio to start
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((e) => {
        // console.log(e);        
        // Ignore errors (e.g., if user hasn't interacted with page yet)
      });
    }
  }, []);

  return { play };
}; 