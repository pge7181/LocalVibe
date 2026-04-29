import * as ImagePicker from "expo-image-picker";
import { Alert, Platform } from "react-native";

/**
 * Pick one or more images from the device gallery and return them as data-URI strings (base64).
 * Compresses to keep payload size reasonable for MongoDB storage.
 */
export async function pickPortfolioImages(maxCount: number = 6): Promise<string[]> {
  if (Platform.OS !== "web") {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Permission needed", "Allow photo library access to pick portfolio images.");
      return [];
    }
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    selectionLimit: maxCount,
    quality: 0.6,
    base64: true,
    exif: false,
  });
  if (result.canceled || !result.assets) return [];
  return result.assets
    .filter((a) => a.base64)
    .map((a) => `data:${a.mimeType || "image/jpeg"};base64,${a.base64}`);
}
