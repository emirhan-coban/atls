import * as ImagePicker from 'expo-image-picker';
import { Directory, File, Paths } from 'expo-file-system';

const DIR_NAME = 'trip-photos';
export const MAX_PHOTOS_PER_TRIP = 6;

const photoDir = () => new Directory(Paths.document, DIR_NAME);

const ensureDir = () => {
  const dir = photoDir();
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
};

/**
 * Photos are stored by file name only. iOS changes the app container path on updates and reinstalls,
 * so an absolute URI saved today would point nowhere later; the full path is rebuilt on every render.
 */
export const photoUri = (fileName: string): string => new File(Paths.document, DIR_NAME, fileName).uri;

/** Opens the photo library and copies the chosen pictures into the app's own storage. Returns the new file names. */
export async function pickTripPhotos(maxToAdd: number): Promise<string[]> {
  if (maxToAdd <= 0) return [];
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: maxToAdd,
    quality: 0.7,
    exif: false,
  });
  if (result.canceled) return [];

  const dir = ensureDir();
  const names: string[] = [];
  for (const asset of result.assets.slice(0, maxToAdd)) {
    const ext = (asset.uri.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'jpg';
    const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    try {
      new File(asset.uri).copy(new File(dir, name));
      names.push(name);
    } catch (err) {
      console.warn('[photos] could not copy picked photo:', err);
    }
  }
  return names;
}

export function deletePhotoFile(fileName: string): void {
  try {
    const file = new File(Paths.document, DIR_NAME, fileName);
    if (file.exists) file.delete();
  } catch (err) {
    console.warn('[photos] could not delete photo:', err);
  }
}
