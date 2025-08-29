// src/hooks/usePreloadImages.ts
import { useEffect, useState } from "react";


export function usePreloadImages(urls: string[]) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let remaining = urls.length;

    urls.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = img.onerror = () => {
        remaining -= 1;
        if (remaining === 0 && isMounted) {
          setLoaded(true);
        }
      };
    });

    return () => {
      isMounted = false;
    };
  }, [urls]);

  return loaded;
}
