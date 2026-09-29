import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/*.jpg', { eager: true });

/** Look up a photo in src/assets/photos by its file name, e.g. "coach-uluru.jpg". */
export function photo(fileName: string): ImageMetadata {
  const match = files[`../assets/photos/${fileName}`];
  if (!match) throw new Error(`Unknown photo: ${fileName}`);
  return match.default;
}
